// Outreach prospects: seed list (prospects-seed.js) + CRM edits/views stored in Netlify Blobs.
const {getStore}=require('@netlify/blobs');
const SEED=require('./prospects-seed.js');
const store=name=>getStore({name,consistency:'strong'});
const pStore=()=>store('mug-prospects'),pFiles=()=>store('mug-prospect-files');
const STAGES=['Researching','Mockup ready','Emailed','Follow-up 1 sent','Follow-up 2 sent','Replied','Meeting','Sample ordered','Won','Not now'];
// Days until the next follow-up after a stage change (Emailed → +5, first follow-up → +7 more, i.e. day 12).
const FOLLOW={'Emailed':5,'Follow-up 1 sent':7};
const SLUG=/^[a-z0-9][a-z0-9-]{0,40}$/;
const now=()=>new Date().toISOString();
const day=(n)=>new Date(Date.now()+n*864e5).toISOString().slice(0,10);
const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const seedOf=slug=>SEED.find(p=>p.slug===slug)||null;
async function getProspect(slug){
  if(!SLUG.test(slug||''))return null;
  const s=seedOf(slug),b=await pStore().get(slug,{type:'json'});
  if(!s&&!b)return null;
  return Object.assign({slug},s||{},b||{},{seeded:!!s});
}
async function listProspects(){
  const {blobs}=await pStore().list();const slugs=[...new Set([...SEED.map(p=>p.slug),...blobs.map(b=>b.key)])];
  return (await Promise.all(slugs.map(getProspect))).filter(Boolean);
}
const pwOk=(p,pw)=>!!norm(pw)&&norm(pw)===norm(p.password||p.brand_text||p.gym);
// Saves CRM fields for a prospect (only what changed vs. the seed lives in Blobs, plus history/views).
async function saveProspect(slug,patch,note){
  const st=pStore();const cur=(await st.get(slug,{type:'json'}))||{};const base=Object.assign({},seedOf(slug)||{},cur);
  const hist=[];const p=Object.assign({},patch||{});
  if(p.stage&&!STAGES.includes(p.stage))delete p.stage;
  if(p.stage&&p.stage!==base.stage){
    hist.push('Stage → '+p.stage);
    if(p.stage==='Emailed'&&!p.emailed_at)p.emailed_at=day(0);
    if(FOLLOW[p.stage]&&p.follow_up===undefined)p.follow_up=day(FOLLOW[p.stage]);
    if(['Replied','Meeting','Sample ordered','Won','Not now'].includes(p.stage)&&p.follow_up===undefined)p.follow_up='';
  }
  ['slug','seeded','history','views','first_viewed','last_viewed','created'].forEach(k=>delete p[k]);
  const n=Object.assign({},cur,p,{updated:now()});if(!n.created)n.created=now();
  n.history=[...(cur.history||[]),...hist.map(t=>({at:now(),text:t})),...(note?[{at:now(),text:String(note).slice(0,2000),note:true}]:[])];
  await st.setJSON(slug,n);return getProspect(slug);
}
// Logs that the gym unlocked its page (history entry at most once every 30 min so refreshes don't spam it).
async function logView(slug,geo){
  const st=pStore();const cur=(await st.get(slug,{type:'json'}))||{};const t=now();
  const quiet=cur.last_viewed&&(Date.now()-new Date(cur.last_viewed))<30*60e3;
  const where=[geo&&geo.city,geo&&geo.subdivision&&(geo.subdivision.code||geo.subdivision.name)].filter(Boolean).join(', ');
  const n=Object.assign({},cur,{views:(cur.views||0)+1,last_viewed:t,first_viewed:cur.first_viewed||t});
  if(!quiet)n.history=[...(cur.history||[]),{at:t,text:'Opened their mockup page'+(where?' ('+where+')':'')}];
  await st.setJSON(slug,n);
}
const toBuf=b=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);
// Logo for the mockup: a file uploaded in the CRM wins; otherwise the logo_url is fetched once and cached.
async function getLogo(p){
  const fs=pFiles();
  for(const k of ['logo-upload','logo-fetched']){
    const r=await fs.getWithMetadata(p.slug+'/'+k,{type:'arrayBuffer'});
    if(r&&(k==='logo-upload'||(r.metadata&&r.metadata.url===p.logo_url)))return 'data:'+((r.metadata&&r.metadata.type)||'image/png')+';base64,'+Buffer.from(r.data).toString('base64');
  }
  if(!p.logo_url)return null;
  try{
    const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),8000);
    const r=await fetch(p.logo_url,{signal:ctl.signal,headers:{'user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36',accept:'image/avif,image/webp,image/png,image/svg+xml,image/*'}});clearTimeout(t);
    const type=(r.headers.get('content-type')||'').split(';')[0];if(!r.ok||!type.startsWith('image/'))return null;
    const buf=Buffer.from(await r.arrayBuffer());if(buf.length>4e6)return null;
    await fs.set(p.slug+'/logo-fetched',toBuf(buf),{metadata:{type,url:p.logo_url,size:buf.length}});
    return 'data:'+type+';base64,'+buf.toString('base64');
  }catch(e){return null}
}
async function setLogoUpload(slug,dataUrl,name){
  const m=/^data:(image\/[\w.+-]+);base64,(.+)$/.exec(dataUrl||'');if(!m)return false;
  const buf=Buffer.from(m[2],'base64');if(buf.length>4e6)return false;
  await pFiles().set(slug+'/logo-upload',toBuf(buf),{metadata:{type:m[1],name:String(name||'logo').slice(0,120),size:buf.length}});return true;
}
// What the gym's page receives after the right password. Internal fields (research, notes, email…) never leave the server.
const publicView=p=>({slug:p.slug,gym:p.gym,hold:p.hold,holdName:p.holdName,brand_text:p.brand_text,website:p.website,instagram:p.instagram,font:p.font,logo_scale:p.logo_scale,note:p.note,logo_url:p.logo_url});
module.exports={STAGES,SLUG,norm,getProspect,listProspects,saveProspect,logView,getLogo,setLogoUpload,pwOk,publicView,pFiles};
