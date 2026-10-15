function CrmCustomers({ctx}){
  const {derived}=ctx;const [filter,setFilter]=React.useState('All');const [q,setQ]=React.useState('');const today=crmDay(new Date().toISOString());
  const F={'All':()=>true,'Leads':c=>c.status==='Lead','Sampled':c=>c.status==='Sampled','Customers':c=>['Customer','Repeat'].includes(c.status),'Repeat':c=>c.status==='Repeat','Follow-up due':c=>(c.follow_up&&c.follow_up<=today)||c.reorderDue};
  const rows=derived.customers.filter(F[filter]).filter(c=>!q||[c.gym,c.name,c.emails.join(' '),crmLocStr(c.loc),c.tags,c.source].join(' ').toLowerCase().includes(q.toLowerCase()));
  const exp=()=>crmCSV(derived.customers.map(c=>({gym:c.gym,status:c.status,contact:c.name,emails:c.emails.join('; '),phone:c.phone,website:c.website,instagram:c.instagram,city:c.loc.city,state:c.loc.region,country:c.loc.country,orders:c.orders.length,paid_orders:c.paid.length,mugs_ordered:c.units,lifetime_value:c.ltv,first_seen:c.first,last_order:c.last,source:c.source,follow_up:c.follow_up,tags:c.tags,size:c.size,notes:c.notes})),'mtnshade-customers.csv');
  return <div style={{display:'flex',flexDirection:'column',gap:16}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}><h1 style={crmH}>Customers</h1><CButton size="sm" variant="outline" onClick={exp}>Export CSV</CButton></div>
    <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center',justifyContent:'space-between'}}><CrmSeg value={filter} onChange={setFilter} options={Object.keys(F).map(k=>[k,k,derived.customers.filter(F[k]).length])}/>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search gym, contact, city, tag" style={{...crmField,maxWidth:300}}/></div>
    <CCard padding={0} style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',minWidth:940}}>
      <thead><tr>{['Gym','Location','Status','Orders','Lifetime value','Last order','Source','Follow-up'].map(h=><th key={h} style={crmTh}>{h}</th>)}</tr></thead>
      <tbody>{rows.map(c=><tr key={c.key} onClick={()=>ctx.openCustomer(c.key)} style={{cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.background='var(--steel-50)'} onMouseLeave={e=>e.currentTarget.style.background=''}>
        <td style={crmTd}><div style={{font:'600 14px/1.2 var(--font-body)',color:'var(--text-strong)'}}>{c.gym}</div><div style={{...crmMuted,fontSize:12}}>{c.name}{c.emails[0]?' · '+c.emails[0]:''}</div></td>
        <td style={crmTd}>{crmLocStr(c.loc)}</td>
        <td style={crmTd}><CBadge tone={c.status==='Repeat'?'blue':c.status==='Customer'?'ink':c.status==='Lead'?'outline':'steel'}>{c.status}</CBadge></td>
        <td style={crmTd}>{c.paid.length} paid{c.orders.length>c.paid.length?<span style={crmMuted}> / {c.orders.length}</span>:null}</td>
        <td style={{...crmTd,fontWeight:600,color:'var(--text-strong)'}}>{crmMoney(c.ltv)}</td>
        <td style={crmTd}>{crmDate(c.last)}</td><td style={crmTd}>{c.source}</td>
        <td style={crmTd}>{c.follow_up?<span style={{color:c.follow_up<=today?'var(--danger)':'var(--text-body)',fontWeight:c.follow_up<=today?600:400}}>{crmDate(c.follow_up)}</span>:c.reorderDue?<span style={{color:'var(--danger)',fontWeight:600}}>Reorder?</span>:'—'}</td></tr>)}
        {!rows.length&&<tr><td colSpan={8} style={{...crmTd,textAlign:'center',padding:40}}>No customers match.</td></tr>}</tbody></table></CCard>
  </div>;
}
function CrmCustomerDetail({ctx,id}){
  const c=ctx.derived.byKey[id];const ov=(ctx.data.customers||{})[id]||{};
  const [f,setF]=React.useState({status:ov.status||'',follow_up:ov.follow_up||'',tags:ov.tags||'',owner:ov.owner||'',size:ov.size||'',phone:ov.phone||'',website:ov.website||'',instagram:ov.instagram||'',notes:ov.notes||''});
  if(!c)return <div style={crmMuted}>Customer not found.</div>;
  const dirty=Object.keys(f).some(k=>(f[k]||'')!==(ov[k]||''));const up=k=>e=>setF(x=>({...x,[k]:e.target.value}));
  const card={padding:20,display:'flex',flexDirection:'column',gap:14};
  const kv=(k,v)=>v?<div style={{display:'grid',gridTemplateColumns:'minmax(70px,120px) minmax(0,1fr)',gap:10,font:'400 14px/1.4 var(--font-body)'}}><span style={{color:'var(--text-muted)'}}>{k}</span><span style={{color:'var(--text-strong)',overflowWrap:'anywhere',whiteSpace:'pre-line'}}>{v}</span></div>:null;
  const avg=c.paid.length?c.ltv/c.paid.length:0;
  return <div style={{display:'flex',flexDirection:'column',gap:18}}>
    <div style={{display:'flex',flexDirection:'column',gap:8}}><button onClick={ctx.back} style={{border:'none',background:'none',padding:0,cursor:'pointer',font:'600 13px/1 var(--font-body)',color:'var(--brand-primary)',alignSelf:'flex-start'}}>← Back</button>
      <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}><h1 style={crmH}>{c.gym}</h1><CBadge tone={c.status==='Repeat'?'blue':'ink'}>{c.status}</CBadge>{c.tags&&c.tags.split(',').map(t=>t.trim()).filter(Boolean).map(t=><CBadge key={t} tone="outline">{t}</CBadge>)}</div>
      <div style={crmMuted}>{crmLocStr(c.loc)}{c.loc.src==='ip'?' (approx.)':''} · customer since {crmDate(c.first)} · via {c.source}</div></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12}}>
      <CrmStat k="Lifetime value" v={crmMoney(c.ltv)}/><CrmStat k="Paid orders" v={c.paid.length} sub={c.orders.length+' total incl. quotes'}/><CrmStat k="Mugs ordered" v={c.units}/><CrmStat k="Avg order" v={crmMoney(avg)}/><CrmStat k="Last paid" v={c.lastPaid?crmDate(c.lastPaid):'—'} sub={c.reorderDue?'Over 5 months — time to reorder?':null}/></div>
    <div style={{display:'grid',gridTemplateColumns:'minmax(0,1.5fr) minmax(300px,1fr)',gap:16,alignItems:'start'}}>
      <div style={{display:'flex',flexDirection:'column',gap:16,minWidth:0}}>
        <CCard padding={0} style={card}><h2 style={crmH2}>Orders</h2>
          <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',minWidth:620}}><thead><tr>{['Order','Date','Type','Colors','Total','Payment','Stage'].map(h=><th key={h} style={crmTh}>{h}</th>)}</tr></thead>
            <tbody>{[...c.orders].reverse().map(o=><tr key={o.id} onClick={()=>ctx.openOrder(o.id)} style={{cursor:'pointer'}}><td style={{...crmTd,fontFamily:'var(--font-mono)',whiteSpace:'nowrap'}}>{o.id}</td><td style={{...crmTd,whiteSpace:'nowrap'}}>{crmDate(o.created)}</td><td style={crmTd}>{crmType(o)}</td>
              <td style={crmTd}><div style={{display:'flex',gap:4}}>{(o.lines||[]).map((l,i)=><CrmSwatch key={i} c={l.hold} size={12}/>)}</div></td><td style={crmTd}>{crmMoney(crmTotal(o))}</td><td style={crmTd}><CrmPay o={o}/></td><td style={crmTd}><CrmStage stage={o.stage}/></td></tr>)}</tbody></table></div></CCard>
        <CCard padding={0} style={card}><h2 style={crmH2}>Notes</h2>
          <textarea value={f.notes} onChange={up('notes')} rows={6} placeholder="Front desk volume, decision maker, events, preferences…" style={{...crmField,resize:'vertical',font:'400 15px/1.45 var(--font-body)'}}></textarea></CCard></div>
      <div style={{display:'flex',flexDirection:'column',gap:16,minWidth:0}}>
        <CCard padding={0} style={card}><h2 style={crmH2}>Account</h2>
          <CrmLabeled label={'Status (auto: '+c.autoStatus+')'}><CrmSelect value={f.status} options={[['','Auto — '+c.autoStatus],...CRM_CUST_STATUS]} onChange={v=>setF(x=>({...x,status:v}))}/></CrmLabeled>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><CrmLabeled label="Next follow-up"><input type="date" value={f.follow_up} onChange={up('follow_up')} style={crmField}/></CrmLabeled><CrmLabeled label="Owner"><input value={f.owner} onChange={up('owner')} style={crmField}/></CrmLabeled></div>
          <CrmLabeled label="Gym size"><CrmSelect value={f.size} options={[['','—'],'Small (<500 members)','Medium (500–1,500)','Large (1,500+ members)','Multi-location']} onChange={v=>setF(x=>({...x,size:v}))}/></CrmLabeled>
          <CrmLabeled label="Tags (comma separated)"><input value={f.tags} onChange={up('tags')} placeholder="hot lead, bouldering, florida" style={crmField}/></CrmLabeled>
          <CButton variant="ink" disabled={!dirty} onClick={()=>ctx.updateCustomer(id,f)}>Save changes</CButton></CCard>
        <CCard padding={0} style={card}><h2 style={crmH2}>Contact</h2>
          {kv('Contacts',c.contacts.join(', '))}{kv('Emails',c.emails.join('\n'))}
          <CrmLabeled label="Phone"><input value={f.phone||c.phone} onChange={up('phone')} style={crmField}/></CrmLabeled>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><CrmLabeled label="Website"><input value={f.website||c.website} onChange={up('website')} style={crmField}/></CrmLabeled><CrmLabeled label="Instagram"><input value={f.instagram||c.instagram} onChange={up('instagram')} style={crmField}/></CrmLabeled></div>
          {kv('Address',c.address?crmAddr(c.address):'')}{kv('Colors ordered',c.colors.join(', '))}
          {c.email&&<CButton size="sm" variant="outline" onClick={()=>location.href='mailto:'+c.emails.join(',')}>Email {c.name?c.name.split(' ')[0]:'gym'}</CButton>}</CCard></div></div>
  </div>;
}
Object.assign(window,{CrmCustomers,CrmCustomerDetail});
