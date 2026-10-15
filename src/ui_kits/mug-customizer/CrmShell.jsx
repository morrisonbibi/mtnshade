const {Button:CButton,Input:CInput,Card:CCard,Badge:CBadge,Logo:CLogo,TabBar:CTabs}=window.MTNShadeDesignSystem_e114fa||{};
const crmLbl={font:'700 12px/1 var(--font-body)',textTransform:'uppercase',letterSpacing:'.05em',color:'var(--text-muted)'};
const crmH={font:'700 24px/1 var(--font-display)',textTransform:'uppercase',color:'var(--text-strong)',margin:0};
const crmH2={font:'700 17px/1.1 var(--font-display)',textTransform:'uppercase',letterSpacing:'.02em',color:'var(--text-strong)',margin:0};
const crmMuted={font:'400 14px/1.45 var(--font-body)',color:'var(--text-muted)'};
const crmField={font:'400 14px/1.2 var(--font-body)',padding:'8px 10px',border:'1.5px solid var(--border-strong)',borderRadius:'var(--radius-sm)',background:'#fff',color:'var(--text-strong)',width:'100%',boxSizing:'border-box',minWidth:0};
const crmTh={...crmLbl,textAlign:'left',padding:'10px 12px',borderBottom:'1px solid var(--border-subtle)',whiteSpace:'nowrap',background:'var(--steel-50)'};
const crmTd={font:'400 14px/1.3 var(--font-body)',color:'var(--text-body)',padding:'12px',borderBottom:'1px solid var(--border-subtle)',verticalAlign:'top'};
function CrmSeg({value,options,onChange}){return <div style={{display:'flex',flexWrap:'wrap',background:'var(--steel-100)',borderRadius:'var(--radius-sm)',padding:3,gap:3}}>{options.map(([v,l,n])=><button key={v} onClick={()=>onChange(v)} style={{border:'none',cursor:'pointer',padding:'8px 12px',borderRadius:3,font:'700 13px/1 var(--font-display)',textTransform:'uppercase',letterSpacing:'.05em',background:value===v?'#fff':'transparent',color:value===v?'var(--text-strong)':'var(--text-muted)',boxShadow:value===v?'var(--shadow-sm)':'none',display:'flex',gap:6,alignItems:'center'}}>{l}{n!=null&&<span style={{font:'600 12px/1 var(--font-body)',color:'var(--text-muted)'}}>{n}</span>}</button>)}</div>}
function CrmStage({stage}){return <span style={{display:'inline-flex',alignItems:'center',gap:6,font:'600 13px/1.2 var(--font-body)',color:'var(--text-strong)',whiteSpace:'nowrap'}}><span style={{width:8,height:8,borderRadius:'50%',background:CRM_STAGE_COLOR[stage]||'var(--steel-400)',flex:'none'}}></span>{stage||'—'}</span>}
function CrmPay({o}){const s=(o.payment&&o.payment.status)||'—';return <CBadge tone={s==='Paid'?'blue':s==='Refunded'?'red':s==='Quote'?'outline':'steel'}>{s}</CBadge>}
function CrmClient({o}){return o._prior?<CBadge tone="ink">Repeat client</CBadge>:<CBadge tone="outline">New client</CBadge>}
function CrmSwatch({c,size=14}){return <span style={{width:size,height:size,borderRadius:'50%',background:c,flex:'none',display:'inline-block',boxShadow:'inset 0 -2px 3px rgba(0,0,0,.25)'}}></span>}
function CrmSelect({value,options,onChange,style}){return <select value={value||''} onChange={e=>onChange(e.target.value)} style={{...crmField,cursor:'pointer',...style}}>{options.map(o=>typeof o==='string'?<option key={o} value={o}>{o}</option>:<option key={o[0]} value={o[0]}>{o[1]}</option>)}</select>}
function CrmLabeled({label,children}){return <label style={{display:'flex',flexDirection:'column',gap:6,minWidth:0}}><span style={crmLbl}>{label}</span>{children}</label>}
function CrmLogin({onKey,err,busy}){const [k,setK]=React.useState('');
  return <div style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'var(--steel-900)',padding:24}}>
    <form onSubmit={e=>{e.preventDefault();onKey(k)}} style={{width:'100%',maxWidth:380,background:'#fff',borderRadius:'var(--radius-md)',padding:28,display:'flex',flexDirection:'column',gap:16}}>
      <CLogo variant="horizontal" color="blue" height={30} assetBase="../../assets/logo/"/>
      <h1 style={crmH}>Mug CRM</h1>
      <CInput label="CRM password" type="password" value={k} onChange={e=>setK(e.target.value)} error={err} autoFocus/>
      <CButton variant="ink" size="lg" fullWidth disabled={busy||!k}>{busy?'Checking…':'Open CRM'}</CButton>
      <div style={{...crmMuted,fontSize:13}}>The password is the CRM_PASSWORD value in your Netlify environment variables.</div></form></div>}
function CrmApp(){
  const [mode,setMode]=React.useState(null);const [key,setKey]=React.useState(()=>sessionStorage.getItem('mtnshade-crm-key')||'');
  const [api,setApi]=React.useState(null);const [data,setData]=React.useState(null);const [err,setErr]=React.useState('');const [busy,setBusy]=React.useState(false);
  const [view,setView]=React.useState(()=>(location.hash.match(/^#(dashboard|orders|customers)/)||[])[1]||'dashboard');
  const [sel,setSel]=React.useState(()=>{const m=location.hash.match(/^#(order|customer)\/(.+)$/);return m?{kind:m[1],id:decodeURIComponent(m[2])}:null});
  const [toast,setToast]=React.useState('');
  React.useEffect(()=>{crmProbe().then(m=>{setMode(m);if(m==='demo')setApi(crmDemo())})},[]);
  React.useEffect(()=>{if(mode==='live'&&key&&!api)login(key)},[mode]);
  React.useEffect(()=>{if(api)load()},[api]);
  React.useEffect(()=>{const h=sel?'#'+sel.kind+'/'+encodeURIComponent(sel.id):'#'+view;if(location.hash!==h)history.replaceState(null,'',h)},[view,sel]);
  function login(k){setBusy(true);setErr('');const c=crmLive(k);c.list().then(d=>{sessionStorage.setItem('mtnshade-crm-key',k);setKey(k);setApi(c);setData(d)},e=>{setErr(e.status===401?'Wrong password':e.message);sessionStorage.removeItem('mtnshade-crm-key')}).finally(()=>setBusy(false))}
  function load(){return api.list().then(setData,e=>setToast('Could not load: '+e.message))}
  const flash=t=>{setToast(t);clearTimeout(window.__crmT);window.__crmT=setTimeout(()=>setToast(''),3500)};
  const derived=React.useMemo(()=>data?crmDerive(data.orders,data.customers):null,[data]);
  const putOrder=o=>setData(d=>({...d,orders:d.orders.map(x=>x.id===o.id?{...o,files:o.files||x.files,_demoFiles:x._demoFiles}:x)}));
  const ctx={api,data,derived,flash,reload:load,putOrder,
    updateOrder:(id,patch,note)=>api.update(id,patch,note).then(r=>{putOrder(r.order);return r.order},e=>{flash('Save failed: '+e.message);throw e}),
    updateCustomer:(k,patch)=>api.customer(k,patch).then(r=>{setData(d=>({...d,customers:{...d.customers,[k]:r.customer}}));flash('Customer saved')},e=>flash('Save failed: '+e.message)),
    openOrder:id=>setSel({kind:'order',id}),openCustomer:id=>setSel({kind:'customer',id}),back:()=>setSel(null),
    addOrder:o=>setData(d=>({...d,orders:[...d.orders,o]}))};
  if(mode===null)return <div style={{padding:40,...crmMuted}}>Loading…</div>;
  if(mode==='live'&&!api)return <CrmLogin onKey={login} err={err} busy={busy}/>;
  const tabs=[{id:'dashboard',label:'Dashboard'},{id:'orders',label:'Orders'},{id:'customers',label:'Customers'}];
  return <div style={{minHeight:'100vh',background:'var(--surface-sunken)'}}>
    <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,padding:'0 24px',minHeight:60,background:'var(--steel-900)',color:'#fff',flexWrap:'wrap'}}>
      <div style={{display:'flex',alignItems:'center',gap:14}}><CLogo variant="horizontal" height={26} assetBase="../../assets/logo/"/><span style={{font:'600 15px/1 var(--font-display)',textTransform:'uppercase',letterSpacing:'.12em',opacity:.8}}>Mug CRM</span></div>
      <div style={{display:'flex',alignItems:'center',gap:4}}>{tabs.map(t=><button key={t.id} onClick={()=>{setView(t.id);setSel(null)}} style={{border:'none',background:'none',cursor:'pointer',padding:'20px 12px',font:'700 14px/1 var(--font-display)',textTransform:'uppercase',letterSpacing:'.08em',color:'#fff',opacity:view===t.id&&!sel?1:.6,boxShadow:view===t.id&&!sel?'inset 0 -3px 0 var(--brand-primary)':'none'}}>{t.label}</button>)}</div>
      <div style={{display:'flex',gap:8}}><CButton size="sm" variant="inverse" onClick={()=>load().then(()=>flash('Refreshed'))}>Refresh</CButton>{api&&api.live&&<CButton size="sm" variant="ghost" style={{color:'#fff'}} onClick={()=>{sessionStorage.removeItem('mtnshade-crm-key');location.reload()}}>Sign out</CButton>}</div></header>
    {!api||!api.live?<div style={{background:'var(--warning)',color:'var(--steel-900)',font:'600 13px/1.4 var(--font-body)',padding:'8px 24px'}}>Demo data — the live backend isn't reachable from this preview. On your Netlify site this page shows real orders.</div>:null}
    <main style={{padding:24,maxWidth:1320,margin:'0 auto'}}>
      {!derived?<div style={crmMuted}>Loading orders…</div>:
        sel&&sel.kind==='order'?<CrmOrderDetail ctx={ctx} id={sel.id}/>:
        sel&&sel.kind==='customer'?<CrmCustomerDetail ctx={ctx} id={sel.id}/>:
        view==='orders'?<CrmOrders ctx={ctx}/>:view==='customers'?<CrmCustomers ctx={ctx}/>:<CrmDashboard ctx={ctx} go={setView}/>}
    </main>
    {toast&&<div style={{position:'fixed',bottom:20,left:'50%',transform:'translateX(-50%)',background:'var(--steel-900)',color:'#fff',padding:'12px 18px',borderRadius:'var(--radius-md)',font:'500 14px/1.3 var(--font-body)',boxShadow:'var(--shadow-md)',zIndex:20}}>{toast}</div>}
  </div>;
}
function CrmStat({k,v,sub}){return <div style={{display:'flex',flexDirection:'column',gap:8,padding:18,background:'#fff',borderRadius:'var(--radius-md)',border:'1px solid var(--border-subtle)',minWidth:0}}><span style={crmLbl}>{k}</span><span style={{font:'700 32px/1 var(--font-display)',color:'var(--text-strong)'}}>{v}</span>{sub&&<span style={{...crmMuted,fontSize:13}}>{sub}</span>}</div>}
function CrmBars({rows,fmt}){const max=Math.max(1,...rows.map(r=>r[1]));return <div style={{display:'flex',flexDirection:'column',gap:10}}>{rows.length?rows.map(([k,v,extra])=><div key={k} style={{display:'grid',gridTemplateColumns:'minmax(80px,140px) minmax(0,1fr) auto',gap:10,alignItems:'center'}}>
  <span style={{font:'600 14px/1.2 var(--font-body)',color:'var(--text-strong)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{k}</span>
  <span style={{height:10,background:'var(--steel-100)',borderRadius:5,overflow:'hidden'}}><span style={{display:'block',height:'100%',width:(v/max*100)+'%',background:'var(--brand-primary)',borderRadius:5}}></span></span>
  <span style={{font:'400 13px/1 var(--font-body)',color:'var(--text-muted)',whiteSpace:'nowrap'}}>{fmt?fmt(v):v}{extra?' · '+extra:''}</span></div>):<span style={crmMuted}>No data yet.</span>}</div>}
function CrmDashboard({ctx,go}){
  const {data,derived}=ctx;const O=data.orders.filter(o=>!o.archived);const paid=O.filter(crmPaid);const sum=a=>a.reduce((s,o)=>s+crmTotal(o),0);
  const paying=derived.customers.filter(c=>c.paid.length);const repeat=derived.customers.filter(c=>c.bulk.length>=2);
  const today=crmDay(new Date().toISOString());const soon=crmDay(new Date(Date.now()+21*864e5).toISOString());
  const prod=['Proof approved','Sent to manufacturer','In production'];
  const act=[
    ...O.filter(o=>crmPaid(o)&&o.stage==='Received').map(o=>[o,'Send proof']),
    ...O.filter(o=>o.stage==='Proof approved').map(o=>[o,'Send to manufacturer']),
    ...O.filter(o=>o.payment&&o.payment.status==='Awaiting payment'&&(Date.now()-new Date(o.created))>864e5).map(o=>[o,'Unpaid — follow up']),
    ...O.filter(o=>o.stage==='Quote').map(o=>[o,'Send quote']),
    ...O.filter(o=>o.needed_by&&o.needed_by<=soon&&!['Shipped','Delivered','Canceled'].includes(o.stage)).map(o=>[o,'Needed by '+crmDate(o.needed_by)])];
  const fol=derived.customers.filter(c=>(c.follow_up&&c.follow_up<=today)||c.reorderDue);
  const group=(f)=>{const m={};paid.forEach(o=>{const k=f(o);if(!k)return;m[k]=(m[k]||0)+crmTotal(o)});return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,8)};
  const camp={};O.forEach(o=>{const k=(o.attribution&&o.attribution.utm_campaign)||'(direct)';camp[k]=camp[k]||{n:0,p:0,rev:0};camp[k].n++;if(crmPaid(o)){camp[k].p++;camp[k].rev+=crmTotal(o)}});
  const colors={};paid.forEach(o=>(o.lines||[]).forEach(l=>{if(!l.sample)colors[l.name]=(colors[l.name]||0)+(+l.units||0)}));
  const card={padding:20,display:'flex',flexDirection:'column',gap:14};
  return <div style={{display:'flex',flexDirection:'column',gap:20}}>
    <h1 style={crmH}>Dashboard</h1>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12}}>
      <CrmStat k="Paid revenue" v={crmMoney(sum(paid))} sub={paid.length+' paid orders'}/>
      <CrmStat k="In production" v={O.filter(o=>prod.includes(o.stage)).length} sub="Approved → manufacturer"/>
      <CrmStat k="Awaiting payment" v={O.filter(o=>o.payment&&o.payment.status==='Awaiting payment').length} sub={crmMoney(sum(O.filter(o=>o.payment&&o.payment.status==='Awaiting payment')))+' open'}/>
      <CrmStat k="Avg order" v={crmMoney(paid.length?sum(paid)/paid.length:0)}/>
      <CrmStat k="Repeat clients" v={paying.length?Math.round(repeat.length/paying.length*100)+'%':'—'} sub={repeat.length+' of '+paying.length+' paying gyms'}/></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))',gap:16}}>
      <CCard padding={0} style={card}><h2 style={crmH2}>Needs action</h2>
        {act.length?act.slice(0,10).map(([o,t],i)=><button key={o.id+i} onClick={()=>ctx.openOrder(o.id)} style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',border:'none',borderTop:i?'1px solid var(--border-subtle)':'none',background:'none',padding:'10px 0 0',cursor:'pointer',textAlign:'left'}}>
          <span style={{display:'flex',flexDirection:'column',gap:3,minWidth:0}}><span style={{font:'600 14px/1.2 var(--font-body)',color:'var(--text-strong)'}}>{(o.contact&&o.contact.gym)||o.id}</span><span style={{...crmMuted,fontSize:13}}>{o.id} · {crmType(o)} · {crmMoney(crmTotal(o))}</span></span>
          <span style={{font:'700 12px/1.2 var(--font-display)',textTransform:'uppercase',letterSpacing:'.05em',color:'var(--brand-primary)',whiteSpace:'nowrap'}}>{t} →</span></button>):<span style={crmMuted}>All caught up.</span>}</CCard>
      <CCard padding={0} style={card}><h2 style={crmH2}>Follow-ups due</h2>
        {fol.length?fol.slice(0,8).map((c,i)=><button key={c.key} onClick={()=>ctx.openCustomer(c.key)} style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',border:'none',borderTop:i?'1px solid var(--border-subtle)':'none',background:'none',padding:'10px 0 0',cursor:'pointer',textAlign:'left'}}>
          <span style={{display:'flex',flexDirection:'column',gap:3}}><span style={{font:'600 14px/1.2 var(--font-body)',color:'var(--text-strong)'}}>{c.gym}</span><span style={{...crmMuted,fontSize:13}}>{crmLocStr(c.loc)} · {c.status}</span></span>
          <span style={{...crmMuted,fontSize:13,whiteSpace:'nowrap'}}>{c.follow_up&&c.follow_up<=today?'Due '+crmDate(c.follow_up):'Reorder? Last paid '+crmDate(c.lastPaid)}</span></button>):<span style={crmMuted}>No follow-ups due.</span>}</CCard>
      <CCard padding={0} style={card}><h2 style={crmH2}>Revenue by state</h2><CrmBars rows={group(o=>{const l=crmLoc(o);return l.region||l.country})} fmt={crmMoney}/></CCard>
      <CCard padding={0} style={card}><h2 style={crmH2}>Outreach campaigns</h2><CrmBars rows={Object.entries(camp).sort((a,b)=>b[1].rev-a[1].rev).map(([k,v])=>[k,v.rev,v.p+'/'+v.n+' paid'])} fmt={crmMoney}/></CCard>
      <CCard padding={0} style={card}><h2 style={crmH2}>Hold colors ordered</h2><CrmBars rows={Object.entries(colors).sort((a,b)=>b[1]-a[1])} fmt={v=>v+' mugs'}/></CCard>
      <CCard padding={0} style={card}><h2 style={crmH2}>Pipeline</h2><CrmBars rows={CRM_STAGES.map(s=>[s,O.filter(o=>o.stage===s).length]).filter(r=>r[1])}/>
        <div><CButton size="sm" variant="outline" onClick={()=>go('orders')}>Open orders</CButton></div></CCard></div>
  </div>;
}
Object.assign(window,{CrmApp,CrmSeg,CrmStage,CrmPay,CrmClient,CrmSwatch,CrmSelect,CrmLabeled,CrmStat,crmLbl,crmH,crmH2,crmMuted,crmField,crmTh,crmTd});
