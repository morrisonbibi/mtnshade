// Mug CRM — Prospects: outreach pipeline. Each prospect has a private mockup page at mtnshade.com/g/<slug>.
const prLink=p=>location.origin+'/g/'+p.slug;
const prToday=()=>new Date().toISOString().slice(0,10);
const prDue=p=>!!p.follow_up&&p.follow_up<=prToday()&&!['Won','Not now','Replied','Meeting','Sample ordered'].includes(p.stage);
const prOpen=p=>!['Won','Not now'].includes(p.stage);
const prCopy=(t,flash,label)=>{const ok=()=>flash((label||'Copied')+' to clipboard');(navigator.clipboard?navigator.clipboard.writeText(t).then(ok,()=>flash('Copy failed — select and copy by hand')):Promise.reject()).catch(()=>{})};
function PrStage({stage}){return <span style={{display:'inline-flex',alignItems:'center',gap:6,font:'600 13px/1.2 var(--font-body)',color:'var(--text-strong)',whiteSpace:'nowrap'}}><span style={{width:8,height:8,borderRadius:'50%',background:CRM_PSTAGE_COLOR[stage]||'var(--steel-400)',flex:'none'}}></span>{stage||'—'}</span>}
function PrViews({p}){return p.views?<span><b style={{color:'var(--text-strong)'}}>{p.views}×</b> · {crmDate(p.last_viewed)}</span>:<span style={{color:'var(--text-muted)'}}>Not yet</span>}
// Text/date/textarea field that saves when you leave it.
function PrEdit({p,k,label,type,save,rows,placeholder}){
  const [v,setV]=React.useState(p[k]||'');React.useEffect(()=>setV(p[k]||''),[p[k]]);
  const commit=()=>{if((p[k]||'')!==v)save({[k]:v})};
  const st={...crmField,...(rows?{resize:'vertical',font:'400 14px/1.45 var(--font-body)'}:{})};
  return <CrmLabeled label={label}>{rows?<textarea rows={rows} value={v} placeholder={placeholder} onChange={e=>setV(e.target.value)} onBlur={commit} style={st}/>:<input type={type||'text'} value={v} placeholder={placeholder} onChange={e=>setV(e.target.value)} onBlur={commit} onKeyDown={e=>{if(e.key==='Enter')e.target.blur()}} style={st}/>}</CrmLabeled>;
}
function PrLogo({api,p,version}){
  const [src,setSrc]=React.useState(null);React.useEffect(()=>{let on=true;setSrc(null);api.prospectLogo(p.slug).then(s=>{if(on)setSrc(s||null)});return()=>{on=false}},[p.slug,version]);
  return <div style={{height:110,borderRadius:'var(--radius-sm)',background:'var(--steel-700)',display:'grid',placeItems:'center',padding:10}}>{src?<img src={src} alt="" style={{maxHeight:90,maxWidth:'100%',objectFit:'contain'}}/>:<span style={{...crmMuted,color:'#fff',opacity:.7,fontSize:13}}>{p.logo_url?'Logo loads when the page first opens':'No logo yet'}</span>}</div>;
}
function CrmProspectDetail({ctx,p,onBack,onSaved}){
  const {api,flash}=ctx;const [note,setNote]=React.useState('');const [ver,setVer]=React.useState(0);const fileRef=React.useRef();
  const save=(patch,n)=>api.prospect(p.slug,patch,n).then(r=>{onSaved(r.prospect);flash('Saved')},e=>flash('Save failed: '+e.message));
  const upload=f=>{if(!f)return;const r=new FileReader();r.onload=()=>api.prospect(p.slug,{},'Logo uploaded: '+f.name,r.result,f.name).then(x=>{onSaved(x.prospect);setVer(v=>v+1);flash('Logo updated')},e=>flash('Upload failed: '+e.message));r.readAsDataURL(f)};
  const card={padding:20,display:'flex',flexDirection:'column',gap:14};const g2={display:'grid',gridTemplateColumns:'1fr 1fr',gap:10};
  return <div style={{display:'flex',flexDirection:'column',gap:18}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:16,flexWrap:'wrap'}}>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        <button onClick={onBack} style={{border:'none',background:'none',padding:0,cursor:'pointer',font:'600 13px/1 var(--font-body)',color:'var(--brand-primary)',alignSelf:'flex-start'}}>← All prospects</button>
        <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}><h1 style={crmH}>{p.gym}</h1><PrStage stage={p.stage}/></div>
        <div style={crmMuted}>{[p.town,p.website,p.instagram].filter(Boolean).join(' · ')}</div></div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <CButton variant="ink" onClick={()=>prCopy(prLink(p),flash,'Link')}>Copy link</CButton>
        <CButton variant="outline" onClick={()=>window.open(prLink(p),'_blank')}>Open page</CButton>
        {p.email&&<CButton variant="outline" onClick={()=>{location.href='mailto:'+p.email}}>Email</CButton>}</div></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:16,alignItems:'start'}}>
      <div style={{display:'flex',flexDirection:'column',gap:16,minWidth:0}}>
        <CCard padding={0} style={card}><h2 style={crmH2}>Their page</h2>
          <div style={{display:'grid',gridTemplateColumns:'minmax(80px,120px) minmax(0,1fr)',gap:10,font:'400 14px/1.4 var(--font-body)'}}>
            <span style={{color:'var(--text-muted)'}}>Link</span><a href={prLink(p)} target="_blank" rel="noopener" style={{overflowWrap:'anywhere'}}>{prLink(p).replace(/^https?:\/\//,'')}</a>
            <span style={{color:'var(--text-muted)'}}>Password</span><span style={{color:'var(--text-strong)',fontWeight:600}}>{p.password||p.brand_text||p.gym} <span style={{fontWeight:400,color:'var(--text-muted)'}}>(capital letters don't matter)</span></span>
            <span style={{color:'var(--text-muted)'}}>Opened</span><span><PrViews p={p}/>{p.views>0&&<button onClick={()=>save({reset_views:true},'Reset page views (my own test visits)')} style={{marginLeft:10,border:'none',background:'none',padding:0,cursor:'pointer',font:'600 12px/1 var(--font-body)',color:'var(--brand-primary)'}}>Reset</button>}</span></div>
          <PrEdit p={p} k="note" label="Your note at the top of their page" rows={4} save={save}/>
          <div style={{...crmMuted,fontSize:12,marginTop:-8}}>Opening the page from this computer doesn't count as a view.</div></CCard>
        <CCard padding={0} style={card}><h2 style={crmH2}>Mockup</h2>
          <PrLogo api={api} p={p} version={ver}/>
          <div style={{display:'flex',gap:8,alignItems:'center'}}><CButton size="sm" variant="ghost" onClick={()=>fileRef.current.click()}>Upload a different logo</CButton><input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={e=>upload(e.target.files[0])}/></div>
          <div style={g2}><PrEdit p={p} k="hold" label="Hold color (hex)" save={save} placeholder="#F86635"/><PrEdit p={p} k="holdName" label="Color name" save={save}/></div>
          <div style={{display:'flex',alignItems:'center',gap:8,...crmMuted,fontSize:13}}><CrmSwatch c={p.hold||'#ccc'}/> {(p.hold||'').toLowerCase()==='#2141a8'||(p.hold||'').toLowerCase()==='#c8102e'?'Standard color · $12/mug':'Custom color · $13.50/mug · min 300'}</div>
          <div style={g2}><PrEdit p={p} k="brand_text" label="Name on the box" save={save}/><PrEdit p={p} k="password" label="Page password" save={save}/></div>
          <PrEdit p={p} k="logo_url" label="Logo image URL" save={save}/>
          <div style={{...crmMuted,fontSize:12,marginTop:-8}}>Design changes show up for the gym on their first visit. If they've already opened the page, they keep the version they saw.</div></CCard>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:16,minWidth:0}}>
        <CCard padding={0} style={card}><h2 style={crmH2}>Outreach</h2>
          <CrmLabeled label="Stage"><CrmSelect value={p.stage} options={CRM_PSTAGES} onChange={v=>save({stage:v})}/></CrmLabeled>
          <div style={g2}><PrEdit p={p} k="emailed_at" label="First email sent" type="date" save={save}/><PrEdit p={p} k="follow_up" label="Next follow-up" type="date" save={save}/></div>
          <div style={{...crmMuted,fontSize:12,marginTop:-8}}>Setting the stage to Emailed schedules a follow-up 5 days out; Follow-up 1 sent schedules the next one 7 days after that.</div>
          <PrEdit p={p} k="next_step" label="Next step" save={save} placeholder="e.g. Ask for the retail buyer's name"/></CCard>
        <CCard padding={0} style={card}><h2 style={crmH2}>Contact</h2>
          <div style={g2}><PrEdit p={p} k="contact_name" label="Contact name" save={save}/><PrEdit p={p} k="email" label="Email" type="email" save={save}/></div>
          <div style={g2}><PrEdit p={p} k="phone" label="Phone" save={save}/><PrEdit p={p} k="instagram" label="Instagram" save={save}/></div>
          <div style={g2}><PrEdit p={p} k="website" label="Website" save={save}/><PrEdit p={p} k="town" label="Town" save={save}/></div></CCard>
        <CCard padding={0} style={card}><h2 style={crmH2}>Research &amp; notes</h2>
          <PrEdit p={p} k="research" label="What we know" rows={4} save={save}/>
          <div style={{display:'flex',gap:8}}><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a note…" style={crmField} onKeyDown={e=>{if(e.key==='Enter'&&note.trim()){save({},note.trim());setNote('')}}}/><CButton size="sm" variant="ink" disabled={!note.trim()} onClick={()=>{save({},note.trim());setNote('')}}>Add</CButton></div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>{[...(p.history||[])].reverse().map((h,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'86px minmax(0,1fr)',gap:10,font:'400 13px/1.4 var(--font-body)'}}><span style={{color:'var(--text-muted)'}}>{crmDate(h.at)}</span><span style={{color:'var(--text-strong)',fontWeight:h.note?400:600,fontStyle:h.note?'italic':'normal'}}>{h.text}</span></div>)}
            {!(p.history||[]).length&&<span style={crmMuted}>No activity yet.</span>}</div></CCard>
      </div></div></div>;
}
function CrmNewProspect({ctx,onDone}){
  const [f,setF]=React.useState({gym:'',slug:'',password:'',email:'',website:'',instagram:'',town:'',hold:'',holdName:'',logo_url:'',note:''});const [file,setFile]=React.useState(null);const [busy,setBusy]=React.useState(false);
  const auto=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,40);
  const up=k=>e=>{const v=e.target.value;setF(x=>({...x,[k]:v,...(k==='gym'&&(!x.slug||x.slug===auto(x.gym))?{slug:auto(v)}:{}),...(k==='gym'&&(!x.password||x.password===auto(x.gym))?{password:auto(v)}:{})}))};
  const go=()=>{setBusy(true);const send=d=>ctx.api.prospectCreate({...f,brand_text:f.gym.toLowerCase()},d,file&&file.name).then(r=>{ctx.flash('Prospect added');onDone(r.prospect)},e=>ctx.flash('Failed: '+e.message)).finally(()=>setBusy(false));
    if(file){const r=new FileReader();r.onload=()=>send(r.result);r.readAsDataURL(file)}else send()};
  const I=(k,l,ph)=><CrmLabeled label={l}><input value={f[k]} onChange={up(k)} placeholder={ph} style={crmField}/></CrmLabeled>;
  return <CCard padding={20} style={{display:'flex',flexDirection:'column',gap:12,border:'1.5px solid var(--steel-900)'}}>
    <div style={{display:'flex',justifyContent:'space-between'}}><h2 style={crmH2}>Add prospect</h2><button onClick={()=>onDone()} style={{border:'none',background:'none',cursor:'pointer',font:'400 22px/1 var(--font-body)',color:'var(--text-muted)'}}>×</button></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:12}}>
      {I('gym','Gym name')}{I('slug','Link: mtnshade.com/g/…')}{I('password','Page password')}{I('email','Email')}{I('website','Website')}{I('instagram','Instagram')}{I('town','Town')}{I('hold','Hold color (hex)','#F86635')}{I('holdName','Color name','GOAT Orange')}{I('logo_url','Logo image URL')}
      <CrmLabeled label="…or upload logo"><input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0]||null)} style={{...crmField,padding:6}}/></CrmLabeled></div>
    <CrmLabeled label="Note at the top of their page"><textarea rows={3} value={f.note} onChange={up('note')} style={{...crmField,resize:'vertical'}}/></CrmLabeled>
    <div><CButton variant="ink" disabled={busy||!f.gym||!f.slug} onClick={go}>{busy?'Saving…':'Create prospect'}</CButton></div></CCard>;
}
function CrmProspects({ctx}){
  const {api,flash}=ctx;const [list,setList]=React.useState(null);const [filter,setFilter]=React.useState('Active');const [sel,setSel]=React.useState(()=>(location.hash.match(/^#prospect\/(.+)$/)||[])[1]||null);const [adding,setAdding]=React.useState(false);
  const load=()=>api.prospects().then(r=>setList(r.prospects),e=>flash('Could not load prospects: '+e.message));
  React.useEffect(()=>{load()},[api]);
  React.useEffect(()=>{const h=sel?'#prospect/'+sel:'#prospects';if(location.hash!==h)history.replaceState(null,'',h)},[sel]);
  const put=p=>setList(l=>l.some(x=>x.slug===p.slug)?l.map(x=>x.slug===p.slug?p:x):[...l,p]);
  if(!list)return <div style={crmMuted}>Loading prospects…</div>;
  const cur=sel&&list.find(p=>p.slug===sel);
  if(cur)return <CrmProspectDetail ctx={ctx} p={cur} onBack={()=>{setSel(null);load()}} onSaved={put}/>;
  const F={'Active':prOpen,'Follow-up due':prDue,'Opened page':p=>!!p.views,'Won':p=>p.stage==='Won','All':()=>true};
  const rows=list.filter(F[filter]).sort((a,b)=>(prDue(b)-prDue(a))||String(a.follow_up||'9').localeCompare(String(b.follow_up||'9'))||a.gym.localeCompare(b.gym));
  return <div style={{display:'flex',flexDirection:'column',gap:16}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}><h1 style={crmH}>Prospects</h1>
      <div style={{display:'flex',gap:8}}><CButton size="sm" variant="outline" onClick={()=>crmCSV(list.map(p=>({gym:p.gym,stage:p.stage,town:p.town,contact:p.contact_name||'',email:p.email||'',phone:p.phone||'',link:prLink(p),password:p.password||'',page_views:p.views||0,last_opened:p.last_viewed||'',emailed:p.emailed_at||'',follow_up:p.follow_up||'',next_step:p.next_step||''})),'mtnshade-prospects.csv')}>Export CSV</CButton>
        <CButton size="sm" variant="ink" onClick={()=>setAdding(true)}>+ Add prospect</CButton></div></div>
    {adding&&<CrmNewProspect ctx={ctx} onDone={p=>{setAdding(false);if(p){put(p);setSel(p.slug)}}}/>}
    <CrmSeg value={filter} onChange={setFilter} options={Object.keys(F).map(k=>[k,k,list.filter(F[k]).length])}/>
    <CCard padding={0} style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',minWidth:860}}>
      <thead><tr>{['Gym','Stage','Contact','Opened their page','Follow-up','Link'].map(h=><th key={h} style={crmTh}>{h}</th>)}</tr></thead>
      <tbody>{rows.map(p=><tr key={p.slug} onClick={()=>setSel(p.slug)} style={{cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.background='var(--steel-50)'} onMouseLeave={e=>e.currentTarget.style.background=''}>
        <td style={crmTd}><div style={{display:'flex',alignItems:'center',gap:8}}><CrmSwatch c={p.hold||'#ccc'} size={12}/><span style={{font:'600 14px/1.2 var(--font-body)',color:'var(--text-strong)'}}>{p.gym}</span></div><div style={{...crmMuted,fontSize:12,marginTop:3}}>{p.town||''}</div></td>
        <td style={crmTd}><PrStage stage={p.stage}/></td>
        <td style={crmTd}>{p.contact_name||p.email||'—'}{p.contact_name&&p.email&&<div style={{...crmMuted,fontSize:12}}>{p.email}</div>}</td>
        <td style={crmTd}><PrViews p={p}/></td>
        <td style={{...crmTd,color:prDue(p)?'var(--danger)':'var(--text-body)',fontWeight:prDue(p)?600:400}}>{p.follow_up?(prDue(p)?'Due ':'')+crmDate(p.follow_up+'T12:00:00'):'—'}</td>
        <td style={crmTd} onClick={e=>e.stopPropagation()}><CButton size="sm" variant="ghost" onClick={()=>prCopy(prLink(p),flash,'Link')}>Copy link</CButton></td></tr>)}
        {!rows.length&&<tr><td colSpan={6} style={{...crmTd,textAlign:'center',padding:40}}>{list.length?'No prospects match.':'No prospects yet.'}</td></tr>}</tbody></table></CCard>
  </div>;
}
Object.assign(window,{CrmProspects});
