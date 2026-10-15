function useCrmFile(api,o,f){const [u,setU]=React.useState(null);
  React.useEffect(()=>{let ok=true;setU(null);if(api.hasFile(o,f))api.fileUrl(o,f).then(x=>{if(ok)setU(x)});else if(f==='logo'&&o.mug&&o.mug.logo_url)setU(o.mug.logo_url);return()=>{ok=false}},[o.id,f,(o.files||[]).join()]);return u}
const crmExt=u=>u&&/^data:image\/jpe?g|\.jpe?g$/i.test(u)?'jpg':u&&/svg/.test(u)?'svg':'png';
function CrmFileTile({api,o,f,label}){const u=useCrmFile(api,o,f);const dark=f==='logo'||f==='lid_logo';
  return <div style={{display:'flex',flexDirection:'column',gap:8,minWidth:0}}>
    <div style={{aspectRatio:f==='dieline'?'4/3':'1/1',background:dark?'var(--steel-700)':'var(--steel-50)',border:'1px solid var(--border-subtle)',borderRadius:'var(--radius-sm)',display:'grid',placeItems:'center',overflow:'hidden'}}>
      {u?<img src={u} alt={label} style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain'}}/>:<span style={{...crmMuted,fontSize:13,color:dark?'#fff':undefined,padding:12,textAlign:'center'}}>Not captured</span>}</div>
    <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}><span style={{font:'600 13px/1.2 var(--font-body)',color:'var(--text-strong)'}}>{label}</span>
      {u&&<a href={u} download={o.id+'-'+f+'.'+crmExt(u)} style={{font:'600 13px/1 var(--font-body)',color:'var(--brand-primary)'}}>Download</a>}</div></div>}
function CrmEdit({o,k,label,type,ctx,placeholder}){const [v,setV]=React.useState(o[k]||'');React.useEffect(()=>setV(o[k]||''),[o.id,o[k]]);
  const save=x=>{if((x||'')!==(o[k]||''))ctx.updateOrder(o.id,{[k]:x})};
  return <CrmLabeled label={label}><input type={type||'text'} value={v} placeholder={placeholder} onChange={e=>{setV(e.target.value);if(type==='date')save(e.target.value)}} onBlur={e=>type!=='date'&&save(e.target.value)} style={crmField}/></CrmLabeled>}
function crmSpec(o){const p=o.packaging||{},m=o.mug||{},a=(o.ship&&o.ship.address)||null;
  return ['MTNSHADE PRODUCTION ORDER '+o.id,'Order date: '+crmDate(o.created),'Needed by: '+(o.needed_by?crmDate(o.needed_by):'—'),'Gym: '+((o.contact&&o.contact.gym)||'—'),'PO: '+(o.mfg_po||'—'),'',
    'MUGS',...(o.lines||[]).map(l=>'- '+l.name+' hold '+(l.hold||'').toUpperCase()+(l.custom?' (custom color)':'')+': '+l.units+' mugs'+(l.cartons?' / '+l.cartons+' cartons of 36':'')+(l.sample?' (SAMPLE)':'')),
    'Body: brushed 18/8 stainless steel','Logo: '+(m.logo_name||'—')+' · etch from '+(m.etch||'auto')+' · scale '+Math.round((m.logo_scale||.5)*100)+'% · centered, 47% height'+(m.logo_cleanup?' · LOGO CLEAN-UP REQUESTED':''),'',
    'PACKAGING: '+(p.route==='custom'?'Custom box (artwork supplied separately)':'Gym logo × MTNShade co-brand box'),
    ...(p.route==='custom'?[]:['Lid: '+(p.brand_mode==='logo'?'lid logo file':'text "'+(p.brand_text||'')+'"')+' · font '+(p.font||'—')+(p.caption?' · brand name under logo':''),'Inside flap website: '+(p.website||'—'),'Inside flap socials: '+(p.instagram||'—')]),
    ...(p.tweaks?['Design tweaks: '+p.tweaks]:[]),...(o.mfg_notes?['','NOTES: '+o.mfg_notes]:[]),'',
    'SHIP TO',...(a?[(o.ship.name||''),crmAddr(a)]:['(MTNShade to confirm)'])].join('\n')}
function crmClean(o){const x={};Object.keys(o).forEach(k=>{if(k[0]!=='_')x[k]=o[k]});return x}
function crmPacket(o,urls){const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));const abs=u=>u?new URL(u,location.href).href:'';
  const p=o.packaging||{},m=o.mug||{},a=(o.ship&&o.ship.address)||null;
  const img=(f,l,dark)=>urls[f]?'<figure'+(dark?' class="d"':'')+'><img src="'+abs(urls[f])+'"><figcaption>'+l+'</figcaption></figure>':'';
  const rows=(o.lines||[]).map(l=>'<tr><td><i style="background:'+esc(l.hold)+'"></i>'+esc(l.name)+(l.sample?' (sample)':'')+'</td><td class="m">'+esc((l.hold||'').toUpperCase())+'</td><td>'+(l.custom?'Custom color — match hex':'MTNShade standard')+'</td><td class="r">'+l.units+'</td><td class="r">'+(l.cartons||'—')+'</td></tr>').join('');
  const kv=(k,v)=>v?'<tr><th>'+k+'</th><td>'+esc(v)+'</td></tr>':'';
  const css='body{font:14px/1.45 Arial,sans-serif;color:#15171A;max-width:900px;margin:28px auto;padding:0 24px}h1{font:800 28px/1 "Arial Narrow",Arial,sans-serif;text-transform:uppercase;margin:0}h2{font:800 15px/1 "Arial Narrow",Arial,sans-serif;text-transform:uppercase;letter-spacing:.06em;margin:22px 0 8px;border-bottom:2px solid #15171A;padding-bottom:6px}.top{display:flex;justify-content:space-between;gap:20px;align-items:flex-end}table{width:100%;border-collapse:collapse}td,th{padding:7px 8px;border-bottom:1px solid #ddd;text-align:left;vertical-align:top}th{width:200px;color:#555;font-weight:600}.r{text-align:right}.m{font-family:monospace}i{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:8px;vertical-align:-1px}.g{display:grid;grid-template-columns:1fr 1fr;gap:14px}figure{margin:0;border:1px solid #ddd;border-radius:4px;padding:8px;break-inside:avoid}figure.d{background:#414143}figure.d figcaption{color:#fff}figure.w{grid-column:1/-1}img{width:100%;max-height:360px;object-fit:contain;display:block}figcaption{font-size:12px;color:#555;margin-top:6px}pre{font:inherit;white-space:pre-wrap;margin:0}@media print{button{display:none}}';
  const html='<!doctype html><html><head><meta charset="utf-8"><title>'+o.id+' production order</title><style>'+css+'</style></head><body><button onclick="print()" style="float:right;padding:8px 14px">Print / Save PDF</button>'+
    '<div class="top"><div><div style="font:700 12px Arial;letter-spacing:.1em;color:#2141A8">MTNSHADE · PRODUCTION ORDER</div><h1>'+esc(o.id)+'</h1></div><div style="text-align:right">'+esc((o.contact&&o.contact.gym)||'')+'<br>Ordered '+crmDate(o.created)+(o.needed_by?'<br><b>Needed by '+crmDate(o.needed_by)+'</b>':'')+(o.mfg_po?'<br>PO '+esc(o.mfg_po):'')+'</div></div>'+
    '<h2>Mugs</h2><table><tr><th style="width:auto">Hold color</th><th style="width:auto">Hex</th><th style="width:auto">Match</th><th class="r" style="width:auto">Mugs</th><th class="r" style="width:auto">Cartons (36)</th></tr>'+rows+'</table>'+
    '<h2>Mug spec</h2><table>'+kv('Body','Brushed 18/8 stainless steel')+kv('Logo file',m.logo_name)+kv('Laser etch from',m.etch||'auto')+kv('Logo size',Math.round((m.logo_scale||.5)*100)+'% · centered at 47% height')+kv('Logo clean-up',m.logo_cleanup?'Requested — clean up before etching':'')+'</table>'+
    '<h2>Packaging</h2><table>'+kv('Box',p.route==='custom'?'Custom box — artwork supplied separately':'Gym logo × MTNShade co-brand box')+(p.route==='custom'?'':kv('Lid',p.brand_mode==='logo'?'Lid logo file (see below)':'Text: "'+(p.brand_text||'')+'"')+kv('Font',p.font)+kv('Brand name under logo',p.caption?'Yes':'No')+kv('Inside flap — website',p.website)+kv('Inside flap — socials',p.instagram))+kv('Design tweaks',p.tweaks)+'</table>'+
    (o.mfg_notes?'<h2>Notes</h2><pre>'+esc(o.mfg_notes)+'</pre>':'')+
    '<h2>Ship to</h2><pre>'+(a?esc((o.ship.name||'')+'\n'+crmAddr(a)):'MTNShade to confirm')+'</pre>'+
    '<h2>Artwork</h2><div class="g">'+img('mug','Mug render')+img('box','Box render')+img('logo','Logo file',1)+img('lid_logo','Lid logo',1)+(urls.dieline?'<figure class="w"><img src="'+abs(urls.dieline)+'" style="max-height:none"><figcaption>Box dieline — print layout</figcaption></figure>':'')+'</div></body></html>';
  const w=window.open('','_blank');if(!w)return false;w.document.write(html);w.document.close();return true}
function crmFileUrls(api,o){const fs=[...new Set([...CRM_FILES.map(x=>x[0]),...(o.files||[])])];return Promise.all(fs.map(f=>(api.hasFile(o,f)?api.fileUrl(o,f):Promise.resolve(f==='logo'&&o.mug&&o.mug.logo_url||null)).then(u=>[f,u]))).then(r=>Object.fromEntries(r.filter(x=>x[1])))}
function CrmOrderDetail({ctx,id}){
  const {api,data,derived}=ctx;const o=data.orders.find(x=>x.id===id);const [note,setNote]=React.useState('');const [busy,setBusy]=React.useState('');const fileRef=React.useRef();
  if(!o)return <div style={crmMuted}>Order {id} not found. <a href="#orders" onClick={ctx.back}>Back to orders</a></div>;
  const c=derived.byKey[o._ckey]||{};const p=o.packaging||{},m=o.mug||{},a=(o.ship&&o.ship.address)||null,loc=crmLoc(o);
  const extra=(o.files||[]).filter(f=>!CRM_FILES.some(x=>x[0]===f));const rev=crmTotal(o);const cost=+o.mfg_cost||0;
  const packet=()=>{setBusy('packet');crmFileUrls(api,o).then(u=>{if(!crmPacket(o,u))ctx.flash('Allow pop-ups to open the packet')}).finally(()=>setBusy(''))};
  const zip=()=>{if(!window.JSZip)return ctx.flash('Zip library not loaded');setBusy('zip');crmFileUrls(api,o).then(async u=>{const z=new JSZip();
    for(const [f,url] of Object.entries(u)){try{const b=await (await fetch(url)).blob();z.file(o.id+'-'+f+'.'+(b.type.includes('jpeg')?'jpg':b.type.includes('svg')?'svg':b.type.includes('pdf')?'pdf':'png'),b)}catch(e){}}
    z.file(o.id+'-spec.txt',crmSpec(o));z.file(o.id+'-order.json',JSON.stringify(crmClean(o),null,2));
    const b=await z.generateAsync({type:'blob'});const l=document.createElement('a');l.href=URL.createObjectURL(b);l.download=o.id+'-manufacturer.zip';l.click()}).finally(()=>setBusy(''))};
  const sync=()=>{setBusy('sync');api.sync(o.id).then(r=>{ctx.putOrder(r.order);ctx.flash(r.changed?'Updated from Stripe':'No change in Stripe')},e=>ctx.flash(e.message)).finally(()=>setBusy(''))};
  const upload=file=>{if(!file)return;const r=new FileReader();r.onload=()=>{const f=file.name.replace(/\.[^.]+$/,'').toLowerCase().replace(/[^\w-]+/g,'-').slice(0,40)||'file';
    api.upload(o.id,f,file.name,r.result).then(()=>{ctx.putOrder({...o,files:[...new Set([...(o.files||[]),f])]});ctx.flash('File added')},e=>ctx.flash('Upload failed: '+e.message))};r.readAsDataURL(file)};
  const card={padding:20,display:'flex',flexDirection:'column',gap:14};const kv=(k,v)=>v?<div style={{display:'grid',gridTemplateColumns:'minmax(70px,130px) minmax(0,1fr)',gap:10,font:'400 14px/1.4 var(--font-body)'}}><span style={{color:'var(--text-muted)'}}>{k}</span><span style={{color:'var(--text-strong)',overflowWrap:'anywhere',whiteSpace:'pre-line'}}>{v}</span></div>:null;
  return <div style={{display:'flex',flexDirection:'column',gap:18}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:16,flexWrap:'wrap'}}>
      <div style={{display:'flex',flexDirection:'column',gap:8}}><button onClick={ctx.back} style={{border:'none',background:'none',padding:0,cursor:'pointer',font:'600 13px/1 var(--font-body)',color:'var(--brand-primary)',alignSelf:'flex-start'}}>← All orders</button>
        <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}><h1 style={crmH}>{(o.contact&&o.contact.gym)||o.id}</h1><CrmPay o={o}/><CrmClient o={o}/></div>
        <div style={crmMuted}>{o.id} · {crmType(o)} · {crmDate(o.created)} · {crmMoney(rev)}</div></div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <CButton variant="ink" onClick={packet} disabled={!!busy}>{busy==='packet'?'Preparing…':'Manufacturer packet'}</CButton>
        <CButton variant="outline" onClick={zip} disabled={!!busy}>{busy==='zip'?'Zipping…':'Download all files'}</CButton>
        {o.contact&&o.contact.email&&<CButton variant="outline" onClick={()=>location.href='mailto:'+o.contact.email+'?subject='+encodeURIComponent('Your MTNShade mug order '+o.id)}>Email customer</CButton>}
        {api.live&&o.payment&&o.payment.session&&<CButton variant="ghost" onClick={sync} disabled={!!busy}>Check Stripe</CButton>}</div></div>
    <div style={{display:'grid',gridTemplateColumns:'minmax(0,1.6fr) minmax(300px,1fr)',gap:16,alignItems:'start'}}>
      <div style={{display:'flex',flexDirection:'column',gap:16,minWidth:0}}>
        <CCard padding={0} style={card}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10}}><h2 style={crmH2}>Artwork & files</h2>
          <CButton size="sm" variant="ghost" onClick={()=>fileRef.current.click()}>+ Add file</CButton><input ref={fileRef} type="file" style={{display:'none'}} onChange={e=>upload(e.target.files[0])}/></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))',gap:14}}>{CRM_FILES.filter(([f])=>f!=='lid_logo'||api.hasFile(o,f)).map(([f,l])=><CrmFileTile key={f} api={api} o={o} f={f} label={l}/>)}{extra.map(f=><CrmFileTile key={f} api={api} o={o} f={f} label={f}/>)}</div></CCard>
        <CCard padding={0} style={card}><h2 style={crmH2}>Mugs</h2>
          <table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr>{['Hold color','Hex','Mugs','Cartons','Unit','Line'].map(h=><th key={h} style={crmTh}>{h}</th>)}</tr></thead><tbody>
            {(o.lines||[]).map((l,i)=><tr key={i}><td style={crmTd}><span style={{display:'inline-flex',gap:8,alignItems:'center'}}><CrmSwatch c={l.hold}/>{l.name}{l.custom&&<CBadge tone="steel">Custom</CBadge>}{l.sample&&<CBadge tone="outline">Sample</CBadge>}</span></td><td style={{...crmTd,fontFamily:'var(--font-mono)'}}>{(l.hold||'').toUpperCase()}</td><td style={crmTd}>{l.units}</td><td style={crmTd}>{l.cartons||'—'}</td><td style={crmTd}>{crmMoney(l.unit_price)}</td><td style={crmTd}>{crmMoney((+l.units||0)*(+l.unit_price||0))}</td></tr>)}</tbody></table>
          {o.pack_fee?kv('Custom packaging fee',crmMoney(o.pack_fee)):null}
          {kv('Logo',m.logo_name)}{kv('Etch from',m.etch)}{kv('Logo size',m.logo_scale?Math.round(m.logo_scale*100)+'%':'')}{kv('Logo clean-up',m.logo_cleanup?'Requested':'')}</CCard>
        <CCard padding={0} style={card}><h2 style={crmH2}>Packaging</h2>
          {kv('Box',p.route==='custom'?'Custom box — contact customer for artwork':'Gym logo × MTNShade')}{p.route!=='custom'&&<>{kv('Lid',p.brand_mode==='logo'?'Lid logo file':'"'+(p.brand_text||'')+'"')}{kv('Font',p.font)}{kv('Name under logo',p.caption?'Yes':'No')}{kv('Website flap',p.website)}{kv('Socials flap',p.instagram)}</>}{kv('Design tweaks',p.tweaks)}</CCard>
        {(o.notes||o.summary)&&<CCard padding={0} style={card}><h2 style={crmH2}>Customer notes</h2>{kv('Notes',o.notes)}{kv('Summary',o.summary)}</CCard>}
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:16,minWidth:0}}>
        <CCard padding={0} style={card}><h2 style={crmH2}>Status</h2>
          <CrmLabeled label="Stage"><CrmSelect value={o.stage} options={CRM_STAGES} onChange={v=>ctx.updateOrder(o.id,{stage:v})}/></CrmLabeled>
          <CrmLabeled label="Payment"><CrmSelect value={o.payment&&o.payment.status} options={CRM_PAY} onChange={v=>ctx.updateOrder(o.id,{payment_status:v})}/></CrmLabeled>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><CrmEdit o={o} k="needed_by" label="Needed by" type="date" ctx={ctx}/><CrmEdit o={o} k="ship_date" label="Ship date" type="date" ctx={ctx}/></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><CrmEdit o={o} k="carrier" label="Carrier" ctx={ctx} placeholder="UPS"/><CrmEdit o={o} k="tracking" label="Tracking #" ctx={ctx}/></div></CCard>
        <CCard padding={0} style={card}><h2 style={crmH2}>Manufacturer</h2>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><CrmEdit o={o} k="manufacturer" label="Factory" ctx={ctx}/><CrmEdit o={o} k="mfg_po" label="PO #" ctx={ctx}/></div>
          <CrmEdit o={o} k="mfg_cost" label="Your cost ($)" type="number" ctx={ctx}/>
          {cost>0&&<div style={{display:'flex',justifyContent:'space-between',font:'600 14px/1 var(--font-body)',color:'var(--text-strong)'}}><span>Gross profit</span><span>{crmMoney(rev-cost)} · {rev?Math.round((rev-cost)/rev*100):0}%</span></div>}
          <CrmEdit o={o} k="mfg_notes" label="Notes on packet" ctx={ctx} placeholder="e.g. Pack 6 extra boxes"/>
          {o.stage!=='Sent to manufacturer'&&['Received','Proof sent','Proof approved'].includes(o.stage)&&<CButton size="sm" variant="outline" onClick={()=>ctx.updateOrder(o.id,{stage:'Sent to manufacturer'})}>Mark sent to manufacturer</CButton>}</CCard>
        <CCard padding={0} style={card}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><h2 style={crmH2}>Customer</h2><button onClick={()=>ctx.openCustomer(o._ckey)} style={{border:'none',background:'none',cursor:'pointer',font:'600 13px/1 var(--font-body)',color:'var(--brand-primary)'}}>Profile →</button></div>
          {kv('Contact',o.contact&&o.contact.name)}{kv('Email',o.contact&&o.contact.email)}{kv('Phone',o.contact&&o.contact.phone)}
          {kv('Location',crmLocStr(loc)+(loc.src==='ip'?' (approx. from IP)':''))}{kv('Ship to',a?((o.ship.name||'')+'\n'+crmAddr(a)):'')}
          {kv('History',c.paid?c.paid.length+' paid order'+(c.paid.length===1?'':'s')+' · '+crmMoney(c.ltv)+' lifetime':'')}
          {kv('Source',[(o.attribution&&o.attribution.utm_campaign)||'(direct)',o.attribution&&o.attribution.utm_source].filter(Boolean).join(' · '))}</CCard>
        <CCard padding={0} style={card}><h2 style={crmH2}>Activity</h2>
          <div style={{display:'flex',gap:8}}><input value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a note…" style={crmField} onKeyDown={e=>{if(e.key==='Enter'&&note.trim()){ctx.updateOrder(o.id,{},note.trim());setNote('')}}}/><CButton size="sm" variant="ink" disabled={!note.trim()} onClick={()=>{ctx.updateOrder(o.id,{},note.trim());setNote('')}}>Add</CButton></div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>{[...(o.history||[])].reverse().map((h,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'86px minmax(0,1fr)',gap:10,font:'400 13px/1.4 var(--font-body)'}}><span style={{color:'var(--text-muted)'}}>{crmDate(h.at)}</span><span style={{color:'var(--text-strong)',fontWeight:h.note?400:600,fontStyle:h.note?'italic':'normal'}}>{h.text}</span></div>)}</div></CCard>
      </div></div></div>;
}
function CrmNewOrder({ctx,onDone}){const [f,setF]=React.useState({gym:'',name:'',email:'',phone:'',color:'Summit Blue',hold:'#2141A8',units:36,total:432,payment_status:'Invoiced',notes:''});const [busy,setBusy]=React.useState(false);
  const up=k=>e=>setF(x=>({...x,[k]:e.target.value}));
  const save=()=>{setBusy(true);ctx.api.create({type:'bulk_order',contact:{gym:f.gym,name:f.name,email:f.email,phone:f.phone},lines:[{hold:f.hold,name:f.color,units:+f.units,cartons:Math.ceil(f.units/36),custom:!['#2141a8','#c8102e'].includes(f.hold.toLowerCase()),unit_price:f.units?+f.total/f.units:0}],units:+f.units,total:+f.total,notes:f.notes,payment_status:f.payment_status,attribution:{utm_campaign:'(manual)'}})
    .then(r=>{ctx.addOrder(r.order);ctx.flash('Order '+r.order.id+' created');onDone(r.order.id)},e=>ctx.flash('Failed: '+e.message)).finally(()=>setBusy(false))};
  const I=(k,l,t)=><CrmLabeled label={l}><input type={t||'text'} value={f[k]} onChange={up(k)} style={crmField}/></CrmLabeled>;
  return <CCard padding={20} style={{display:'flex',flexDirection:'column',gap:12,border:'1.5px solid var(--steel-900)'}}>
    <div style={{display:'flex',justifyContent:'space-between'}}><h2 style={crmH2}>Add order (phone / invoice)</h2><button onClick={()=>onDone()} style={{border:'none',background:'none',cursor:'pointer',font:'400 22px/1 var(--font-body)',color:'var(--text-muted)'}}>×</button></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12}}>{I('gym','Gym')}{I('name','Contact')}{I('email','Email','email')}{I('phone','Phone')}{I('color','Hold color name')}{I('hold','Hex')}{I('units','Mugs','number')}{I('total','Total ($)','number')}
      <CrmLabeled label="Payment"><CrmSelect value={f.payment_status} options={CRM_PAY} onChange={v=>setF(x=>({...x,payment_status:v}))}/></CrmLabeled></div>
    {I('notes','Notes')}<div><CButton variant="ink" disabled={busy||!f.gym} onClick={save}>{busy?'Saving…':'Create order'}</CButton></div></CCard>}
function CrmOrders({ctx}){
  const {data}=ctx;const [filter,setFilter]=React.useState('Open');const [q,setQ]=React.useState('');const [adding,setAdding]=React.useState(false);
  const prod=['Proof approved','Sent to manufacturer','In production'];
  const F={'Open':o=>!['Delivered','Canceled','Quote'].includes(o.stage),'Needs proof':o=>crmPaid(o)&&o.stage==='Received','In production':o=>prod.includes(o.stage),'Shipped':o=>['Shipped','Delivered'].includes(o.stage),'Unpaid':o=>o.payment&&o.payment.status==='Awaiting payment','Quotes':o=>o.stage==='Quote','All':()=>true};
  const live=data.orders.filter(o=>!o.archived);
  const rows=live.filter(F[filter]).filter(o=>!q||[o.id,o.contact&&o.contact.gym,o.contact&&o.contact.name,o.contact&&o.contact.email,crmLocStr(crmLoc(o))].join(' ').toLowerCase().includes(q.toLowerCase())).sort((a,b)=>a.created<b.created?1:-1);
  const exp=()=>crmCSV(live.map(o=>{const l=crmLoc(o);return {order_id:o.id,created:o.created,type:crmType(o),gym:o.contact&&o.contact.gym,contact:o.contact&&o.contact.name,email:o.contact&&o.contact.email,phone:o.contact&&o.contact.phone,city:l.city,state:l.region,country:l.country,client:o._prior?'Repeat':'New',
    colors:(o.lines||[]).map(x=>x.name+' '+x.hold+' ×'+x.units).join('; '),mugs:(o.lines||[]).reduce((s,x)=>s+(+x.units||0),0),total:crmTotal(o),payment:o.payment&&o.payment.status,stage:o.stage,needed_by:o.needed_by||'',ship_date:o.ship_date||'',tracking:o.tracking||'',manufacturer:o.manufacturer||'',po:o.mfg_po||'',cost:o.mfg_cost||'',campaign:o.attribution&&o.attribution.utm_campaign}}),'mtnshade-orders.csv');
  return <div style={{display:'flex',flexDirection:'column',gap:16}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}><h1 style={crmH}>Orders</h1>
      <div style={{display:'flex',gap:8}}><CButton size="sm" variant="outline" onClick={exp}>Export CSV</CButton><CButton size="sm" variant="ink" onClick={()=>setAdding(true)}>+ Add order</CButton></div></div>
    {adding&&<CrmNewOrder ctx={ctx} onDone={id=>{setAdding(false);if(id)ctx.openOrder(id)}}/>}
    <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center',justifyContent:'space-between'}}><CrmSeg value={filter} onChange={setFilter} options={Object.keys(F).map(k=>[k,k,live.filter(F[k]).length])}/>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search gym, email, city, order #" style={{...crmField,maxWidth:300}}/></div>
    <CCard padding={0} style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',minWidth:960}}>
      <thead><tr>{['Order','Gym','Location','Type','Mugs','Total','Payment','Stage','Needed by'].map(h=><th key={h} style={crmTh}>{h}</th>)}</tr></thead>
      <tbody>{rows.map(o=>{const l=crmLoc(o);return <tr key={o.id} onClick={()=>ctx.openOrder(o.id)} style={{cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.background='var(--steel-50)'} onMouseLeave={e=>e.currentTarget.style.background=''}>
        <td style={crmTd}><div style={{font:'600 14px/1.2 var(--font-mono)',color:'var(--text-strong)'}}>{o.id}</div><div style={{...crmMuted,fontSize:12}}>{crmDate(o.created)}</div></td>
        <td style={crmTd}><div style={{font:'600 14px/1.2 var(--font-body)',color:'var(--text-strong)'}}>{(o.contact&&o.contact.gym)||'—'}</div><div style={{marginTop:4}}><CrmClient o={o}/></div></td>
        <td style={crmTd}>{crmLocStr(l)}{l.src==='ip'&&<div style={{...crmMuted,fontSize:12}}>approx.</div>}</td>
        <td style={crmTd}>{crmType(o)}</td>
        <td style={crmTd}><div style={{display:'flex',gap:4,alignItems:'center'}}>{(o.lines||[]).map((x,i)=><CrmSwatch key={i} c={x.hold} size={12}/>)}<span style={{marginLeft:4}}>{(o.lines||[]).reduce((s,x)=>s+(+x.units||0),0)}</span></div></td>
        <td style={{...crmTd,fontWeight:600,color:'var(--text-strong)'}}>{crmMoney(crmTotal(o))}</td>
        <td style={crmTd}><CrmPay o={o}/></td><td style={crmTd}><CrmStage stage={o.stage}/></td><td style={crmTd}>{o.needed_by?crmDate(o.needed_by):'—'}</td></tr>})}
        {!rows.length&&<tr><td colSpan={9} style={{...crmTd,textAlign:'center',padding:40}}>{live.length?'No orders match.':'No orders yet — they appear here as soon as a gym checks out, orders a sample, or requests a quote.'}</td></tr>}</tbody></table></CCard>
  </div>;
}
Object.assign(window,{CrmOrders,CrmOrderDetail});
