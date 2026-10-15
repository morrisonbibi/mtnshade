const {Button:OButton,Input:OInput,Select:OSelect,Card:OCard,Badge:OBadge,QuantityStepper:OQty}=window.MTNShadeDesignSystem_e114fa||{};
const SAMPLE_PRICE=MC_CONFIG.sample.standard;
const oLbl={font:'700 13px/1 var(--font-body)',textTransform:'uppercase',letterSpacing:'.05em',color:'var(--text-strong)'};
const oTitle={font:'700 24px/1 var(--font-display)',textTransform:'uppercase',color:'var(--text-strong)'};
const oMuted={font:'400 14px/1.45 var(--font-body)',color:'var(--text-muted)'};
const money=n=>mcMoney(n);
function Dot({c}){return <span style={{width:16,height:16,borderRadius:'50%',background:c,flex:'none',boxShadow:'inset 0 -2px 3px rgba(0,0,0,.25)'}}></span>}
function Timeline({custom}){const [a,b]=mcWeeks(custom);const steps=[['Design','Today'],['Proof','~3 days'],['Approve','You sign off'],['At your door',a+'–'+b+' wks']];
  return <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>{steps.map(([t,s],i)=><div key={t} style={{display:'flex',flexDirection:'column',gap:6}}>
    <span style={{height:4,borderRadius:2,background:i===3?'var(--brand-primary)':'var(--steel-300)'}}></span>
    <span style={{font:'700 13px/1.1 var(--font-display)',textTransform:'uppercase',letterSpacing:'.04em',color:'var(--text-strong)'}}>{t}</span><span style={{font:'400 12px/1.2 var(--font-body)',color:'var(--text-muted)'}}>{s}</span></div>)}</div>}
function OrderStep({cfg,lines,setLines,summary,onSubmit,onProof,packCustom}){
  const C=MC_CONFIG;const [retail,setRetail]=React.useState(C.retailDefault);const [mode,setMode]=React.useState(null);const [busy,setBusy]=React.useState(false);
  const att=mcAttribution();const [f,setF]=React.useState({name:att.name||'',org:att.gym||'',email:att.email||'',date:'',notes:''});const [err,setErr]=React.useState({});const [sq,setSq]=React.useState(1);
  const units=lines.reduce((s,l)=>s+mcUnits(l),0);const cartons=lines.reduce((s,l)=>s+mcCartons(mcUnits(l)),0);const subtotal=lines.reduce((s,l)=>s+mcUnits(l)*mcUnitPrice(l.hold),0);const packFee=packCustom?mcPackFee(units):0;const total=subtotal+packFee;const avg=units?total/units:0;
  const anyCustom=lines.some(l=>mcIsCustom(l.hold));const [wa,wb]=mcWeeks(anyCustom);
  const designCustom=mcIsCustom(cfg.hold);const sPrice=designCustom?C.sample.custom:C.sample.standard;const sWeeks=C.sample.weeks+(designCustom?C.sample.customExtraWeeks:0);
  const used=lines.map(l=>l.hold.toLowerCase());const addable=HOLD_COLORS.filter(([c])=>!used.includes(c.toLowerCase()));
  const setLine=(i,p)=>setLines(ls=>ls.map((l,k)=>k===i?{...l,...p}:l));
  const up=k=>e=>setF(x=>({...x,[k]:e.target.value}));
  const send=()=>{const e={};if(!f.name.trim())e.name='Required';if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email))e.email='Enter a valid email';if(mode!=='quote'&&!f.org.trim())e.org='Required';setErr(e);if(Object.keys(e).length)return;setBusy(true);Promise.resolve(onSubmit(mode,{...f,cartons,units,total,sq,sPrice})).finally(()=>setBusy(false))};
  const open=m=>{setMode(m);setErr({})};
  const form=<OCard padding={20} style={{display:'flex',flexDirection:'column',gap:12,border:'1.5px solid var(--steel-900)'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}><div style={oTitle}>{mode==='quote'?'Request a quote':mode==='sample'?'Sample checkout':'Checkout'}</div><button onClick={()=>setMode(null)} aria-label="Close" style={{border:'none',background:'none',cursor:'pointer',font:'400 22px/1 var(--font-body)',color:'var(--text-muted)',padding:0}}>×</button></div>
    <div style={{...oMuted,marginTop:-6}}>{mode==='sample'?sq+' sample'+(sq>1?'s':'')+' · '+money(sq*sPrice):units+' mugs · '+money(total)} · {summary}</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><OInput label="Name" value={f.name} onChange={up('name')} error={err.name}/><OInput label="Gym" value={f.org} onChange={up('org')} error={err.org} placeholder="Las Rocas"/></div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><OInput label="Email" type="email" value={f.email} onChange={up('email')} error={err.email} placeholder="you@yourgym.com"/><OInput label="Needed by" type="date" value={f.date} onChange={up('date')}/></div>
    <label style={{display:'flex',flexDirection:'column',gap:6}}><span style={oLbl}>Notes</span><textarea value={f.notes} onChange={up('notes')} rows={3} placeholder={mode==='quote'?'Event date, reorders, questions…':'Anything we should know before production'} style={{font:'400 16px/1.4 var(--font-body)',padding:12,border:'1.5px solid var(--border-strong)',borderRadius:'var(--radius-sm)',resize:'vertical'}}></textarea></label>
    <OButton fullWidth size="lg" variant="ink" disabled={busy} onClick={send}>{busy?'Working…':mode==='quote'?'Send request':'Continue to secure payment · '+money(mode==='sample'?sq*sPrice:total)}</OButton>
    {mode!=='quote'&&<div style={{...oMuted,fontSize:12,textAlign:'center'}}>Paid securely through Stripe. Shipping address is collected at payment. We email a digital proof before anything is made.</div>}</OCard>;
  const profit=retail-avg;
  return <div><StepHead k="Step 04" t="Order" d="Bulk orders ship in cartons of 36. Your design is exclusive to your gym."/>
    <div style={{display:'flex',flexDirection:'column',gap:14}}>
      <OCard padding={0} style={{overflow:'hidden',display:'grid',gridTemplateColumns:'110px 1fr'}}>
        <div style={{background:'url(../../assets/reference/packaging/photo-b.jpg) center 62%/cover',minHeight:110}}></div>
        <div style={{padding:'14px 16px',display:'flex',flexDirection:'column',gap:4,justifyContent:'center'}}><OBadge tone="ink">Gym partner</OBadge>
          <div style={{font:'700 18px/1.1 var(--font-display)',textTransform:'uppercase',color:'var(--text-strong)',marginTop:4}}>Las Rocas · Miami</div>
          <div style={oMuted}>Gecko-etched mugs in co-branded boxes, sold at the front desk.</div></div></OCard>
      <OCard padding={20} style={{display:'flex',flexDirection:'column',gap:16}}>
        <div style={oTitle}>Bulk order</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',border:'1px solid var(--border-subtle)',borderRadius:'var(--radius-sm)',overflow:'hidden'}}>
          {[['MTNShade Blue / Red',C.pricing.standard,'No minimum · from 1 carton',!lines.every(l=>mcIsCustom(l.hold))],['Custom color',C.pricing.custom,'Min '+C.customMOQ+' per color',anyCustom]].map(([t,pr,s,on],k)=><div key={t} style={{padding:'12px 10px',background:on?'var(--steel-900)':'#fff',color:on?'#fff':'var(--text-strong)',borderLeft:k?'1px solid var(--border-subtle)':'none'}}>
            <div style={{font:'700 13px/1.1 var(--font-display)',textTransform:'uppercase',letterSpacing:'.04em',opacity:.85}}>{t}</div><div style={{font:'700 24px/1.1 var(--font-display)',marginTop:4}}>{money(pr)}<span style={{font:'400 13px var(--font-body)'}}> / mug</span></div><div style={{font:'400 12px/1.3 var(--font-body)',color:on?'rgba(255,255,255,.8)':'var(--text-muted)',marginTop:2}}>{s}</div></div>)}</div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {lines.map((l,i)=><div key={l.hold} style={{display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
            <Dot c={l.hold}/><span style={{flex:1,minWidth:110,font:'600 15px/1.2 var(--font-body)',color:'var(--text-strong)'}}>{l.name}{mcIsCustom(l.hold)&&<span style={{marginLeft:8}}><OBadge tone="steel">Custom</OBadge></span>}</span>
                        {(()=>{const u=mcUnits(l),min=mcMinUnits(l.hold),b={width:36,height:36,border:'1.5px solid var(--border-strong)',background:'#fff',borderRadius:'var(--radius-sm)',cursor:'pointer',font:'700 18px/1 var(--font-body)',color:'var(--text-strong)'};const step=d=>{const v=mcStepUnits(l.hold,u,d);if(v===0){if(i>0)setLines(ls=>ls.filter((_,k)=>k!==i))}else setLine(i,{units:v})};
              return <div style={{display:'flex',alignItems:'center',gap:6}}><button aria-label="Fewer" disabled={i===0&&u<=min} onClick={()=>step(-1)} style={{...b,opacity:i===0&&u<=min?.4:1}}>−</button><span style={{minWidth:44,textAlign:'center',font:'700 16px/1 var(--font-display)',color:'var(--text-strong)'}}>{u}</span><button aria-label="More" disabled={u>=3564} onClick={()=>step(1)} style={b}>+</button></div>})()}
            <span style={{width:96,textAlign:'right',font:'400 13px/1.2 var(--font-body)',color:'var(--text-muted)'}}>{mcCartons(mcUnits(l))} carton{mcCartons(mcUnits(l))>1?'s':''}<br/>{money(mcUnits(l)*mcUnitPrice(l.hold))}</span></div>)}
          {addable.length>0&&<div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}><span style={{...oMuted,fontSize:13}}>Split with another color:</span>
            {addable.slice(0,6).map(([c,n])=><button key={c} title={n} aria-label={'Add '+n} onClick={()=>setLines(ls=>[...ls,{hold:c,name:n,units:mcMinUnits(c)}])} style={{width:26,height:26,borderRadius:'50%',border:'1.5px dashed var(--steel-400)',background:'#fff',padding:3,cursor:'pointer'}}><span style={{display:'block',width:'100%',height:'100%',borderRadius:'50%',background:c}}></span></button>)}</div>}</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',gap:12,paddingTop:14,borderTop:'1px solid var(--border-subtle)'}}>
          <div><div style={oMuted}>{units} mugs · {cartons} carton{cartons>1?'s':''}{lines.length>1?' · avg '+money(avg)+'/mug':''}</div><div style={{...oMuted,fontSize:13}}>At your door in {wa}–{wb} weeks{anyCustom?' (custom color +2 wks)':''}</div></div>
          <div style={{font:'700 30px/1 var(--font-display)',color:'var(--text-strong)'}}>{money(total)}</div></div>
        {packCustom&&<div style={{display:'flex',justifyContent:'space-between',gap:12,font:'400 13px/1.4 var(--font-body)',color:'var(--text-muted)',marginTop:-8}}><span>Includes one-time custom packaging fee ({money(C.customPackaging.perUnit)}/mug, max {money(C.customPackaging.cap)})</span><span style={{color:'var(--text-strong)',fontWeight:600}}>{money(packFee)}</span></div>}
        {anyCustom&&<div style={{font:'400 12px/1.4 var(--font-body)',color:'var(--text-muted)'}}>Custom colors start at {C.customMOQ} mugs, then {mcSnap('#000',C.customMOQ+1)}, then add cartons of {C.carton}.</div>}
      </OCard>
      <OCard variant="sunken" padding={20} style={{display:'flex',flexDirection:'column',gap:12}}>
        <div style={oTitle}>Your margin</div>
        <div style={{display:'flex',alignItems:'flex-end',gap:14,flexWrap:'wrap'}}>
          <OInput label="Front-desk price" type="number" min={0} value={retail} onChange={e=>setRetail(Math.max(0,+e.target.value||0))} style={{width:140}}/>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,auto)',gap:'2px 18px',flex:1}}>
            {[['Per mug',profit],['Per carton',profit*C.carton],['This order',profit*units]].map(([k,v])=><div key={k}><div style={{...oMuted,fontSize:12,textTransform:'uppercase',letterSpacing:'.05em'}}>{k}</div><div style={{font:'700 22px/1.1 var(--font-display)',color:v>=0?'var(--text-strong)':'var(--danger)'}}>{money(v)}</div></div>)}</div></div>
        <div style={{...oMuted,fontSize:13}}>{retail>0?Math.round(profit/retail*100):0}% margin at {money(retail)} · we recommend {money(C.retailDefault)} at the front desk.</div></OCard>
      <div style={{display:'flex',flexDirection:'column',gap:10}}><div style={oLbl}>How it works</div><Timeline custom={anyCustom}/></div>
      <OButton size="lg" fullWidth onClick={()=>open('checkout')}>Checkout · {money(total)}</OButton>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:-4}}>
        <OButton fullWidth variant="outline" onClick={()=>open('quote')}>Request quote</OButton>
        <OButton fullWidth variant="outline" onClick={onProof}>Share proof</OButton></div>
      {(mode==='checkout'||mode==='quote')&&form}
      <OCard padding={20} style={{display:'flex',flexDirection:'column',gap:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:12}}><div><div style={oTitle}>Try a sample first</div><div style={{...oMuted,marginTop:6}}>Your exact design, landed in ~{sWeeks} weeks.{designCustom?' Custom colors take 2 weeks longer.':''}</div></div>
          <div style={{textAlign:'right',flex:'none'}}><div style={{font:'700 24px/1 var(--font-display)',color:'var(--text-strong)'}}>{money(sPrice)}</div><div style={{...oMuted,fontSize:12}}>/ mug{designCustom?' · custom color':''}</div></div></div>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><OQty value={sq} min={1} max={5} onChange={setSq}/>
          <OButton variant="outline" onClick={()=>open('sample')}>Order {sq} sample{sq>1?'s':''} · {money(sq*sPrice)}</OButton></div>
        {mode==='sample'&&form}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap',padding:'12px 14px',border:'1px solid var(--border-subtle)',borderRadius:'var(--radius-md)'}}>
          <span><span style={{display:'block',font:'700 15px/1.1 var(--font-display)',textTransform:'uppercase',color:'var(--text-strong)'}}>Just want to hold one?</span><span style={oMuted}>Buy a standard MTNShade mug on Amazon</span></span>
          <span style={{display:'flex',gap:8}}>{C.amazon.map(l=><a key={l.label} href={l.url} target="_blank" rel="noopener" style={{display:'inline-flex',alignItems:'center',gap:8,height:36,padding:'0 12px',border:'1.5px solid var(--steel-900)',borderRadius:'var(--radius-sm)',font:'700 14px/1 var(--font-display)',textTransform:'uppercase',letterSpacing:'.05em',color:'var(--text-strong)',textDecoration:'none'}}><Dot c={l.hold}/>{l.label} →</a>)}</span></div></OCard>
    </div></div>;
}
Object.assign(window,{OrderStep,SAMPLE_PRICE});
