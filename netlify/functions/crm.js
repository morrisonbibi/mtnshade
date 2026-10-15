// PRIVATE CRM API. Every request needs header x-crm-key = env CRM_PASSWORD (Netlify → Site configuration → Environment variables).
const {connectLambda,orderStore,fileStore,customerStore,res:json,ID,now,customerKey,syncStripe,body,toBuf}=require('../lib/crm.js');
const EDITABLE=['stage','ship_date','carrier','tracking','manufacturer','mfg_po','mfg_cost','internal_notes','proof_status','archived','ship','mfg_notes','contact','needed_by','quoted_total'];
const STAGES=['Quote','Received','Proof sent','Proof approved','Sent to manufacturer','In production','Shipped','Delivered','Canceled'];
exports.handler=async e=>{
  const qp=e.queryStringParameters||{},op=qp.op||'list';connectLambda(e);
  const pw=process.env.CRM_PASSWORD;if(!pw)return json({error:'CRM_PASSWORD is not set in Netlify environment variables'},503);
  if((e.headers['x-crm-key']||'')!==pw)return json({error:'Wrong password'},401);
  const os=orderStore(),fs=fileStore(),cs=customerStore();
  if(op==='ping')return json({ok:true});
  if(op==='list'){
    const {blobs}=await os.list();let all=(await Promise.all(blobs.map(b=>os.get(b.key,{type:'json'})))).filter(Boolean);
    const pend=all.filter(o=>o.payment&&o.payment.status==='Awaiting payment'&&o.payment.session).slice(0,15);
    await Promise.all(pend.map(async o=>{const u=await syncStripe(o).catch(()=>null);if(u){Object.assign(o,u);await os.setJSON(o.id,o)}}));
    const fl=await fs.list();const files={};fl.blobs.forEach(b=>{const [id,f]=b.key.split('/');(files[id]=files[id]||[]).push(f)});
    all.forEach(o=>{o.files=files[o.id]||[]});
    const cl=await cs.list();const customers={};await Promise.all(cl.blobs.map(async b=>{customers[b.key]=await cs.get(b.key,{type:'json'})}));
    return json({orders:all,customers});
  }
  if(op==='file'){
    const id=qp.id||'',f=(qp.field||'').replace(/[^\w-]/g,'');
    const r=await fs.getWithMetadata(id+'/'+f,{type:'arrayBuffer'});if(!r)return json({error:'not found'},404);
    return {statusCode:200,headers:{'content-type':(r.metadata&&r.metadata.type)||'application/octet-stream','cache-control':'private, max-age=600'},body:Buffer.from(r.data).toString('base64'),isBase64Encoded:true};
  }
  if(e.httpMethod!=='POST')return json({error:'POST only'},405);
  const b=body(e)||{};
  if(op==='update'){
    const o=await os.get(b.id,{type:'json'});if(!o)return json({error:'not found'},404);
    const p=b.patch||{},hist=[];
    Object.keys(p).forEach(k=>{
      if(k==='payment_status'){if((o.payment||{}).status!==p[k])hist.push('Payment → '+p[k]);o.payment={...(o.payment||{}),status:p[k]};return}
      if(!EDITABLE.includes(k))return;
      if(k==='stage'){if(!STAGES.includes(p[k]))return;if(o.stage!==p[k])hist.push('Stage → '+p[k])}
      if(k==='tracking'&&p[k]&&p[k]!==o.tracking)hist.push('Tracking added: '+p[k]);
      o[k]=p[k]});
    if(b.note)hist.push({note:String(b.note).slice(0,2000)});
    o.history=[...(o.history||[]),...hist.map(h=>typeof h==='string'?{at:now(),text:h}:{at:now(),text:h.note,note:true})];o.updated=now();
    if(p.contact)o.customer_key=customerKey(o);
    await os.setJSON(o.id,o);return json({order:o});
  }
  if(op==='customer'){
    if(!/^[\w.-]{1,120}$/.test(b.key||''))return json({error:'bad key'},400);
    const c=(await cs.get(b.key,{type:'json'}))||{};const n={...c,...(b.patch||{}),updated:now()};await cs.setJSON(b.key,n);return json({customer:n});
  }
  if(op==='sync'){
    const o=await os.get(b.id,{type:'json'});if(!o)return json({error:'not found'},404);
    const u=await syncStripe(o);if(u){Object.assign(o,u);await os.setJSON(o.id,o)}return json({order:o,changed:!!u});
  }
  if(op==='upload'){
    if(!ID.test(b.id||''))return json({error:'bad id'},400);const f=String(b.field||'').replace(/[^\w-]/g,'').slice(0,40);
    const m=/^data:([\w.+-]+\/[\w.+-]+);base64,(.+)$/.exec(b.dataUrl||'');if(!f||!m)return json({error:'bad file'},400);
    const buf=Buffer.from(m[2],'base64');await fs.set(b.id+'/'+f,toBuf(buf),{metadata:{type:m[1],name:String(b.name||f).slice(0,120),size:buf.length}});
    return json({ok:true,field:f});
  }
  if(op==='create'){
    const d=new Date(),p=n=>String(n).padStart(2,'0');const id='MS-'+String(d.getFullYear()).slice(2)+p(d.getMonth()+1)+p(d.getDate())+'-'+Math.random().toString(36).slice(2,6).toUpperCase();
    const o={...(b.order||{}),id,created:now(),source:'manual',payment:{status:(b.order&&b.order.payment_status)||'Invoiced'},stage:(b.order&&b.order.stage)||'Received',history:[{at:now(),text:'Created manually in CRM'}]};
    delete o.payment_status;o.customer_key=customerKey(o);await os.setJSON(id,o);return json({order:o});
  }
  return json({error:'unknown op'},400);
};
