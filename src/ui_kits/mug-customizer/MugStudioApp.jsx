const {TabBar:ATabs,Button:AButton,Dialog:ADialog,Toast:AToast,Logo:ALogo}=window.MTNShadeDesignSystem_e114fa||{};
const MC_KEY=window.MC_GYM_SLUG?'mtnshade-customizer-g-'+window.MC_GYM_SLUG:'mtnshade-customizer-v1'; // gym mockup pages keep their own saved design
const MC_DEFAULT={hold:'#2141A8',holdName:'Summit Blue',logoScale:.5,text:'',textFont:'condensed',textCaps:true,ink:'auto',logoHelp:false};
const STEPS=[{id:'hold',label:'Hold'},{id:'logo',label:'Logo'},{id:'packaging',label:'Packaging'},{id:'order',label:'Order'}];
function load(){try{return JSON.parse(localStorage.getItem(MC_KEY))||{}}catch(e){return {}}}
function MugStudioApp(){
  const saved=React.useMemo(load,[]);
  const [cfg,setCfg]=React.useState(()=>{const c={...MC_DEFAULT,...(saved.cfg||{})};delete c.body;delete c.bodyColor;delete c.logoY;c.text='';return c});
  const [logo,setLogo]=React.useState(saved.logo!==undefined?saved.logo:null);
  const [logoImg,setLogoImg]=React.useState(null);
  const [step,setStep]=React.useState(saved.step&&saved.step!=='body'?saved.step:'hold');const [view,setView]=React.useState('3/4');
  const [pkg,setPkg]=React.useState(()=>{const v={...PK_DEFAULT,...(saved.pkg||{})};if(!(saved.logo&&saved.logo.name==='Las Rocas gecko'))Object.keys(PK_ROCAS).forEach(k=>{if(v[k]===PK_ROCAS[k])v[k]=''});return v});const [boxView,setBoxView]=React.useState('3/4');const [flat,setFlat]=React.useState(false);const [lidImg,setLidImg]=React.useState(null);
  const [lines,setLines]=React.useState(saved.lines&&saved.lines.length?saved.lines.map(l=>({hold:l.hold,name:l.name,units:mcSnap(l.hold,mcUnits(l))})):[{hold:cfg.hold,name:cfg.holdName,units:mcMinUnits(cfg.hold)}]);const shots=React.useRef({});
  const [dlg,setDlg]=React.useState(null);const [toast,setToast]=React.useState(null);const api=React.useRef();
  const set=p=>setCfg(c=>({...c,...p}));
  const [myLogo,setMyLogo]=React.useState(()=>{try{const v=JSON.parse(localStorage.getItem('mtnshade-mylogo-v2'));return v&&v.mine?v:null}catch(e){return null}});
  React.useEffect(()=>{if(!window.MC_GYM_SLUG&&logo&&logo.mine&&(!myLogo||myLogo.src!==logo.src)){setMyLogo(logo);try{localStorage.setItem('mtnshade-mylogo-v2',JSON.stringify(logo))}catch(e){}}},[logo&&logo.src]);
  React.useEffect(()=>{if(!logo||!logo.src){setLogoImg(null);return}const i=new Image();i.onload=()=>setLogoImg(i);i.src=logo.src},[logo&&logo.src]);
  React.useEffect(()=>{if(!pkg.lidLogo){setLidImg(null);return}const i=new Image();i.onload=()=>setLidImg(i);i.src=pkg.lidLogo.src},[pkg.lidLogo&&pkg.lidLogo.src]);
  React.useEffect(()=>{setLines(ls=>{const rest=ls.slice(1).filter(l=>l.hold.toLowerCase()!==cfg.hold.toLowerCase()).map(l=>({...l,units:mcSnap(l.hold,mcUnits(l))}));const f=ls[0]||{units:0};return [{hold:cfg.hold,name:cfg.holdName,units:mcSnap(cfg.hold,mcUnits(f))},...rest]})},[cfg.hold,cfg.holdName]);
  React.useEffect(()=>{try{localStorage.setItem(MC_KEY,JSON.stringify({cfg,logo,step,pkg,lines}))}catch(e){try{localStorage.setItem(MC_KEY,JSON.stringify({cfg,step,lines,pkg:{...pkg,lidLogo:null}}))}catch(_){}}},[cfg,logo,step,pkg,lines]);
  const autoLabel=((pkg.brandText||'MTNShade').trim().replace(/\b\w/g,m=>m.toUpperCase()))+' '+(cfg.holdName||'').split(' ')[0];
  const boxOpts=React.useMemo(()=>({logoImg,ink:cfg.ink,hold:cfg.hold,brandMode:pkg.brandMode,brandText:pkg.brandText,brandFont:pkg.brandFont,caption:pkg.caption,lidLogoImg:lidImg,lidInk:pkg.lidInk,website:pkg.website,instagram:pkg.instagram,labelName:pkg.labelName||autoLabel}),[logoImg,cfg.ink,cfg.hold,pkg,lidImg,autoLabel]);
  const isBox=step==='packaging';
  const applyPreset=p=>{setCfg(c=>({...c,...p.cfg}));if(p.logo==='default')setLogo({src:MC_DEFAULT_LOGO,name:'MTNShade mark'});if(p.logo==='none')setLogo(null);if(p.logo==='mine')setLogo(myLogo||null);if(p.logo&&typeof p.logo==='object')setLogo(p.logo);setPkg(x=>{const v={...x};Object.keys(PK_ROCAS).forEach(k=>{if(p.id==='rocas')v[k]=PK_ROCAS[k];else if(v[k]===PK_ROCAS[k])v[k]=''});return p.pkg?{...v,...p.pkg}:v})};
  const summary=cfg.holdName+' hold · '+(logo?logo.name:'No logo yet')+(cfg.logoHelp?' (logo clean-up requested)':'')+' · '+(pkg.mode==='custom'?'Custom box (we\'ll reach out)':'Co-brand box'+(pkg.tweaks&&pkg.tweaks.trim()?' — box notes: "'+pkg.tweaks.trim()+'"':''));
  const flash=t=>{setToast(t);clearTimeout(window.__mcT);window.__mcT=setTimeout(()=>setToast(null),4000)};
  const idx=STEPS.findIndex(s=>s.id===step);
  const shoot=()=>{try{if(api.current){shots.current[isBox?'box':'mug']=api.current.snapshot();if(isBox&&pkg.mode==='cobrand'&&api.current.dieline)shots.current.dieline=api.current.dieline()}}catch(e){}};
  const go=s=>{shoot();setStep(s)};
  const proof=()=>{shoot();const ok=mcOpenProof({lines,shots:shots.current,brand:pkg.brandText,summary,customBox:pkg.mode==='custom'});if(!ok)flash({tone:'danger',title:'Pop-up blocked',body:'Allow pop-ups to open the proof.'})};
  const snap=()=>{const a=document.createElement('a');a.href=api.current.snapshot();a.download=isBox?'mtnshade-custom-box.png':'mtnshade-custom-mug.png';a.click()};
  const minPrice=MC_CONFIG.pricing.standard;
  React.useEffect(()=>{const q=new URLSearchParams(location.search),paid=q.get('paid'),cx=q.get('canceled');if(!paid&&!cx)return;
    if(paid){flash({tone:'brand',title:'Payment received',body:'Order '+paid+' is confirmed. We\'ll email your digital proof within ~3 business days.'});mcSubmit({_subject:'Paid · '+paid,type:'payment',order_id:paid,payment_status:'Paid',stripe_session:q.get('session_id')||''}).catch(()=>{});mcLinkPayment(paid,q.get('session_id'))}
    else flash({tone:'ink',title:'Checkout canceled',body:'Your design is saved — pick up where you left off any time.'});
    history.replaceState(null,'',location.pathname)},[]);
  // Agent/outreach prefill: ?gym=&logo=<url>&hold=<hex>&web=&ig=&font=  (overrides saved state once, then strips itself from the URL)
  React.useEffect(()=>{const q=new URLSearchParams(location.search);const g=k=>(q.get(k)||'').trim();if(!['logo','hold','brand','web','ig'].some(k=>q.get(k)))return;
    const hex=g('hold').replace(/^#?/,'#');if(/^#[0-9a-f]{6}$/i.test(hex)){const hit=HOLD_COLORS.find(([c])=>c.toLowerCase()===hex.toLowerCase());set({hold:hit?hit[0]:hex,holdName:hit?hit[1]:(g('holdName')||'Custom '+hex.toUpperCase())})}
    const ink=g('ink');if(['auto','shape','dark','light'].includes(ink))set({ink});const sc=parseFloat(g('scale'));if(sc>=.3&&sc<=.95)set({logoScale:sc});
    const brand=g('brand')||g('gym');setPkg(x=>({...x,mode:'cobrand',brandMode:'text',brandText:brand?brand.toLowerCase():x.brandText,website:g('web')||x.website,instagram:g('ig')?(g('ig').startsWith('@')?g('ig'):'@'+g('ig')):x.instagram,brandFont:g('font')||x.brandFont}));
    const url=g('logo');if(url){const toData=b=>new Promise((ok,no)=>{if(!b.type.startsWith('image/'))return no();const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(b)});
      const get=u=>fetch(u).then(r=>{if(!r.ok)throw 0;return r.blob()}).then(toData);
      get(url).catch(()=>get('https://images.weserv.nl/?output=png&url='+encodeURIComponent(url.replace(/^https?:\/\//,'')))).then(src=>setLogo({src,name:(brand||'Gym')+' logo',mine:true}),()=>flash({tone:'danger',title:'Couldn\'t load logo',body:'Upload it in the Logo step.'}))}
    setStep('hold');const keep=new URLSearchParams();q.forEach((v,k)=>{if(/^utm_|^(name|email|gym)$/.test(k))keep.set(k,v)});history.replaceState(null,'',location.pathname+(keep.toString()?'?'+keep:''))},[]);
  // Private gym mockup page (/g/<slug>): after the password, load that gym's design once (later visits keep their own tweaks).
  const [gym,setGym]=React.useState(null);const [noteOpen,setNoteOpen]=React.useState(true);
  const unlockGym=g=>{
    const hold=/^#[0-9a-f]{6}$/i.test(g.hold||'')?g.hold:MC_DEFAULT.hold,holdName=g.holdName||('Custom '+hold.toUpperCase());
    const gcfg={hold,holdName,logoScale:g.logo_scale||.5,ink:g.ink||'auto'}; // ink: which part of the logo gets etched (auto/shape/dark/light)
    const gpkg={mode:'cobrand',brandMode:'text',brandText:(g.brand_text||g.gym||'').toLowerCase(),website:g.website||'',instagram:g.instagram||'',brandFont:g.font||PK_DEFAULT.brandFont,labelName:''};
    const glogo=g.logo?{src:g.logo,name:g.gym+' logo',mine:true}:null;
    window.MC_GYM_PRESET={id:'gym',label:g.gym+' design',cfg:gcfg,logo:glogo||undefined,pkg:gpkg};
    mcSetAttribution({utm_source:'outreach',utm_medium:'email',utm_campaign:'gym-'+g.slug,gym:g.gym});
    document.title=g.gym+' × MTNShade';setGym(g);
    const AP='mtnshade-gym-applied-'+g.slug;let fresh=true;try{fresh=localStorage.getItem(AP)!=='1';localStorage.setItem(AP,'1')}catch(e){}
    if(fresh){set(gcfg);setPkg(x=>({...x,...gpkg}));setStep('hold');setView('3/4')}
    if(fresh||!saved.logo){
      if(glogo)setLogo(glogo);
      else if(g.logo_url){const toData=b=>new Promise((ok,no)=>{if(!b.type.startsWith('image/'))return no();const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(b)});
        fetch('https://images.weserv.nl/?output=png&url='+encodeURIComponent(g.logo_url.replace(/^https?:\/\//,''))).then(r=>{if(!r.ok)throw 0;return r.blob()}).then(toData).then(src=>{window.MC_GYM_PRESET.logo={src,name:g.gym+' logo',mine:true};setLogo(window.MC_GYM_PRESET.logo)},()=>{})}}
  };
  const submitOrder=(mode,f)=>{shoot();const C=MC_CONFIG,id=mcOrderId(),sample=mode==='sample';
    const colors=sample?cfg.holdName+(mcIsCustom(cfg.hold)?' (custom '+cfg.hold+')':''):lines.map(l=>l.name+(mcIsCustom(l.hold)?' (custom '+l.hold+')':'')+' × '+mcUnits(l)+' mugs ('+mcCartons(mcUnits(l))+' ctn)').join('; ');
    const total=sample?f.sq*f.sPrice:f.total;
    const fields={_subject:{checkout:'New bulk order',sample:'New sample order',quote:'Quote request'}[mode]+' · '+id+' · '+(f.org||f.name)+' · '+mcMoney(total),_replyto:f.email,
      type:{checkout:'bulk_order',sample:'sample_order',quote:'quote_request'}[mode],order_id:id,name:f.name,gym:f.org,email:f.email,needed_by:f.date,notes:f.notes,
      hold_colors:colors,cartons:sample?0:f.cartons,units:sample?f.sq:f.units,packaging_route:pkg.mode==='custom'?'Custom':'Gym logo × MTNShade',box_notes:(pkg.tweaks||'').trim(),
      logo_name:logo?logo.name:'(none)',logo_cleanup:cfg.logoHelp?'Yes':'No',summary,total:total,payment_status:mode==='quote'?'Quote':'Awaiting payment',production_stage:'Received',ship_date:''};
    const files=[logo&&logo.src&&{field:'logo',src:logo.src,name:logo.name||'logo.png'},shots.current.mug&&{field:'mug_render',src:shots.current.mug,name:id+'-mug.png'},shots.current.box&&{field:'box_render',src:shots.current.box,name:id+'-box.png'}].filter(Boolean);
    const order={id,type:fields.type,contact:{name:f.name,gym:f.org,email:f.email},needed_by:f.date,notes:f.notes,summary,total,units:fields.units,cartons:fields.cartons,
      lines:sample?[{hold:cfg.hold,name:cfg.holdName,units:f.sq,custom:mcIsCustom(cfg.hold),unit_price:f.sPrice,sample:true}]:lines.map(l=>({hold:l.hold,name:l.name,units:mcUnits(l),cartons:mcCartons(mcUnits(l)),custom:mcIsCustom(l.hold),unit_price:mcUnitPrice(l.hold)})),
      pack_fee:!sample&&pkg.mode==='custom'?mcPackFee(f.units):0,
      mug:{logo_name:logo?logo.name:'',logo_url:logo&&logo.src&&!logo.src.startsWith('data:')?new URL(logo.src,location.href).href:'',logo_scale:cfg.logoScale,etch:cfg.ink,logo_cleanup:!!cfg.logoHelp},
      packaging:{route:pkg.mode,brand_mode:pkg.brandMode,brand_text:pkg.brandText,font:pkg.brandFont,caption:!!pkg.caption,website:pkg.website,instagram:pkg.instagram,lid_ink:pkg.lidInk,tweaks:(pkg.tweaks||'').trim()},
      attribution:mcAttribution(),page:location.href.split('?')[0]};
    const crmFiles=[...files,pkg.lidLogo&&pkg.lidLogo.src&&{field:'lid_logo',src:pkg.lidLogo.src,name:pkg.lidLogo.name||'lid-logo.png'},shots.current.dieline&&pkg.mode==='cobrand'&&{field:'dieline',src:shots.current.dieline,name:id+'-dieline.jpg'}].filter(Boolean).map(x=>({...x,field:x.field==='mug_render'?'mug':x.field==='box_render'?'box':x.field}));
    const saved=Promise.all([mcSubmit(fields,files).then(()=>true,()=>false),mcSaveOrder(order,crmFiles)]).then(([a,b])=>a||b);
    if(mode==='quote')return saved.then(ok=>flash(ok?{tone:'brand',title:'Quote request sent',body:'Thanks '+f.name.split(' ')[0]+' — we\'ll email '+f.email+' a quote and proof for '+f.units+' mugs.'}:{tone:'danger',title:'Couldn\'t send',body:'Please email '+C.contactEmail+'.'}));
    const pay=sample?{kind:'sample',hold:cfg.hold,holdName:cfg.holdName,qty:f.sq}:{kind:'bulk',lines,packCustom:pkg.mode==='custom'};
    return saved.then(ok=>mcCheckout({...pay,orderId:id,email:f.email,gym:f.org}).then(url=>{location.href=url},()=>flash(ok?{tone:'ink',title:'Order '+id+' received',body:'Online payment isn\'t live yet — we\'ll email '+f.email+' a secure invoice.'}:{tone:'danger',title:'Couldn\'t place order',body:'Please email '+C.contactEmail+'.'})))};
  return <div style={{height:'100%'}}>
    <header style={{height:60,display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,padding:'0 24px',background:'var(--steel-900)',color:'#fff'}}>
      <div style={{display:'flex',alignItems:'center',gap:14,minWidth:0}}><ALogo variant="horizontal" height={28} assetBase="../../assets/logo/"/><span style={{font:'600 15px/1 var(--font-display)',textTransform:'uppercase',letterSpacing:'.12em',opacity:.8,whiteSpace:'nowrap'}}>Custom Mug Studio</span></div>
      <div style={{display:'flex',gap:8}}><AButton size="sm" variant="ghost" style={{color:'#fff'}} onClick={snap}>Save image</AButton><AButton size="sm" variant="inverse" onClick={proof}>Share proof</AButton></div></header>
    <div className="mc-layout">
      <section className="mc-stage" style={{position:'relative',overflow:'hidden',background:'radial-gradient(120% 90% at 50% 35%,#FAFAFA 0%,#E9EBED 55%,#D5D9DD 100%)'}}>
        {!isBox&&!logo&&<button onClick={()=>go('logo')} style={{position:'absolute',left:'50%',top:'46%',transform:'translate(-50%,-50%)',zIndex:3,background:'rgba(255,255,255,.92)',border:'1.5px dashed var(--steel-500)',borderRadius:'var(--radius-md)',padding:'14px 20px',cursor:'pointer',font:'700 16px/1.1 var(--font-display)',textTransform:'uppercase',letterSpacing:'.05em',color:'var(--text-strong)',boxShadow:'var(--shadow-sm)'}}>+ Add your gym's logo</button>}
        {isBox?<BoxStage opts={boxOpts} custom={pkg.mode==='custom'} view={boxView} flat={flat&&pkg.mode==='cobrand'} onDrag={()=>setBoxView(null)} apiRef={api}/>:<MugStage config={cfg} logoImg={logoImg} view={view} onDrag={()=>setView(null)} apiRef={api}/>}
        <div style={{position:'absolute',left:20,top:20,display:'flex',flexDirection:'column',gap:6,pointerEvents:'none'}}>
          <div style={{font:'700 clamp(28px,3.4vw,44px)/0.95 var(--font-display)',textTransform:'uppercase',color:'var(--text-strong)'}}>{isBox?'The Box':'The Crimp Mug'}</div>
          <div style={{font:'400 15px/1.3 var(--font-body)',color:'var(--steel-600)'}}>{isBox?(pkg.mode==='custom'?'Custom artwork — designed with our team':'Your logo × MTNShade · retail gift box'):'Your logo, laser-etched · exclusive to your gym'}</div></div>
        <div style={{position:'absolute',left:0,right:0,bottom:18,display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
          <div style={{display:'flex',background:'rgba(255,255,255,.85)',borderRadius:'var(--radius-pill)',padding:4,boxShadow:'var(--shadow-sm)'}}>
            {(isBox?[...Object.keys(PK_VIEWS),...(pkg.mode==='cobrand'?['Flat']:[])]:Object.keys(MC_VIEWS)).map(v=>{const on=isBox?(v==='Flat'?flat:!flat&&boxView===v):view===v;return <button key={v} onClick={()=>{if(!isBox)return setView(v);if(v==='Flat')return setFlat(true);setFlat(false);setBoxView(v)}} style={{border:'none',cursor:'pointer',padding:'8px 14px',borderRadius:'var(--radius-pill)',font:'700 14px/1 var(--font-display)',textTransform:'uppercase',letterSpacing:'.06em',whiteSpace:'nowrap',background:on?'var(--steel-900)':'transparent',color:on?'#fff':'var(--steel-700)'}}>{v==='Flat'?'Flat dieline':v}</button>})}</div>
          <div style={{font:'400 13px/1 var(--font-body)',color:'var(--steel-500)'}}>{isBox?(flat?'Print layout · cut lines in red':'Drag to rotate · drag up/down to tilt'):'Drag the mug to rotate'}</div></div></section>
      <aside className="mc-panel" style={{background:'#fff',borderLeft:'1px solid var(--border-subtle)',display:'flex',flexDirection:'column'}}>
        {gym&&noteOpen&&<GymNote gym={gym} onClose={()=>setNoteOpen(false)}/>}
        <ATabs tone="light" items={STEPS} value={step} onChange={go} style={{gap:28,position:'sticky',top:0,background:'#fff',zIndex:2}}/>
        <div style={{padding:'24px 28px',flex:1}}>
          {step==='hold'&&<StepHold cfg={cfg} set={set} applyPreset={applyPreset}/>}
          {step==='logo'&&<StepLogo cfg={cfg} set={set} logo={logo} setLogo={setLogo}/>}
          {step==='packaging'&&<StepPackaging pkg={pkg} setPkg={setPkg} logo={logo} goLogo={()=>go('logo')} autoLabel={autoLabel} onCustom={f=>{mcSubmit({_subject:'Custom packaging request · '+(f.name||''),_replyto:f.email,type:'custom_packaging',order_id:mcOrderId(),name:f.name,email:f.email,notes:f.notes,hold_colors:cfg.holdName,summary,payment_status:'Quote',production_stage:'Received'}).catch(()=>{});flash({tone:'brand',title:'Request sent',body:'Thanks '+f.name.split(' ')[0]+' — we\'ll reach out to '+f.email+' about your custom box.'})}}/>}
          {step==='order'&&<OrderStep packCustom={pkg.mode==='custom'} cfg={cfg} lines={lines} setLines={setLines} summary={summary} onProof={proof} onSubmit={submitOrder}/>}</div>
        {step!=='order'&&<div style={{position:'sticky',bottom:0,background:'#fff',borderTop:'1px solid var(--border-subtle)',padding:'14px 28px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:14}}>
          <div style={{minWidth:0}}><div style={{font:'400 12px/1 var(--font-body)',textTransform:'uppercase',letterSpacing:'.05em',color:'var(--text-muted)'}}>Bulk · cartons of {MC_CONFIG.carton}</div><div style={{font:'700 24px/1.1 var(--font-display)',color:'var(--text-strong)'}}>From ${minPrice} / mug</div></div>
          <AButton size="lg" onClick={()=>go(STEPS[idx+1].id)}>Next: {STEPS[idx+1].label}</AButton></div>}
      </aside></div>
    {window.MC_GYM_SLUG&&!gym&&<GymGate slug={window.MC_GYM_SLUG} onUnlock={unlockGym}/>}
    {toast&&<div style={{position:'fixed',right:24,bottom:24,zIndex:200}}><AToast tone={toast.tone} title={toast.title} onClose={()=>setToast(null)}>{toast.body}</AToast></div>}
  </div>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<MugStudioApp/>);
