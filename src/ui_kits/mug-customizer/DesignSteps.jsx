const {Button:DButton,Input:DInput,Select:DSelect,Badge:DBadge,Switch:DSwitch,Checkbox:DCheck}=window.MTNShadeDesignSystem_e114fa||{};
const HOLD_COLORS=[['#2141A8','Summit Blue'],['#C8102E','Crimp Red'],['#FF6720','Orange · PMS 165 C'],['#1F7A35','Green'],['#F5C400','Yellow'],['#16B5BF','Teal'],['#EE5FA7','Pink'],['#1E1F22','Jet Black'],['#EDEBE6','Chalk White'],['#6A3FA0','Grape']];
const PRESETS=[
  {id:'mine',label:'Your gym logo',cfg:{logoScale:.5,ink:'auto'},logo:'mine'},
  {id:'rocas',label:'Example: Las Rocas',cfg:{hold:'#16B5BF',holdName:'Teal',text:'',logoScale:.5,ink:'auto'},logo:{src:'../../assets/logo/partners/las-rocas-gecko-white.png',name:'Las Rocas gecko'}},
  {id:'blue',label:'MTNShade Blue',cfg:{hold:'#2141A8',holdName:'Summit Blue',text:''},logo:'default'},
  {id:'red',label:'MTNShade Red',cfg:{hold:'#C8102E',holdName:'Crimp Red',text:''},logo:'default'}];
const mcLabel={font:'700 13px/1 var(--font-body)',textTransform:'uppercase',letterSpacing:'.05em',color:'var(--text-strong)'};
function StepHead({k,t,d}){return <div style={{marginBottom:18}}><div style={{font:'700 13px/1 var(--font-display)',letterSpacing:'.08em',textTransform:'uppercase',color:'var(--brand-primary)'}}>{k}</div>
  <div style={{font:'700 34px/1 var(--font-display)',textTransform:'uppercase',color:'var(--text-strong)',margin:'6px 0 6px'}}>{t}</div>{d&&<div style={{font:'400 16px/1.4 var(--font-body)',color:'var(--text-muted)'}}>{d}</div>}</div>}
function SwatchGrid({value,onPick}){return <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10}}>
  {HOLD_COLORS.map(([c,n])=>{const on=c.toLowerCase()===value.toLowerCase();return <button key={c} title={n} aria-label={n} onClick={()=>onPick(c,n)} style={{aspectRatio:'1/1',padding:3,borderRadius:'50%',border:on?'2px solid var(--steel-900)':'2px solid transparent',background:'transparent',cursor:'pointer'}}>
    <span style={{display:'block',width:'100%',height:'100%',borderRadius:'50%',background:c,boxShadow:'inset 0 -4px 8px rgba(0,0,0,.25),inset 0 2px 4px rgba(255,255,255,.25)'+(c==='#EDEBE6'?',inset 0 0 0 1px var(--steel-300)':'')}}></span></button>})}</div>}
function HexField({value,onChange,label}){const [t,setT]=React.useState(value);React.useEffect(()=>setT(value),[value]);
  return <div style={{display:'flex',gap:10,alignItems:'flex-end'}}><label style={{display:'flex',flexDirection:'column',gap:6}}><span style={mcLabel}>{label}</span>
    <input type="color" value={value} onChange={e=>onChange(e.target.value)} style={{width:44,height:44,padding:2,border:'1.5px solid var(--border-strong)',borderRadius:'var(--radius-sm)',background:'#fff',cursor:'pointer'}}/></label>
    <DInput style={{flex:1}} value={t} onChange={e=>{const v=e.target.value;setT(v);if(/^#[0-9a-f]{6}$/i.test(v))onChange(v)}} placeholder="#16B5BF" hint="Enter your brand hex"/></div>}
function StepHold({cfg,set,applyPreset}){
  return <div><StepHead k="Step 01" t="Hold color" d="Match your gym's colors, or keep it classic MTNShade blue or red."/>
    <div style={{...mcLabel,marginBottom:10}}>Start from</div>
    <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:22}}>{(window.MC_GYM_PRESET?[window.MC_GYM_PRESET,...PRESETS.filter(x=>x.id!=='mine')]:PRESETS).map(p=><DButton key={p.id} size="sm" variant="outline" onClick={()=>applyPreset(p)}>{p.label}</DButton>)}</div>
    <div style={{...mcLabel,marginBottom:12}}>Hold: <span style={{fontWeight:400,textTransform:'none',letterSpacing:0}}>{cfg.holdName}</span></div>
    <SwatchGrid value={cfg.hold} onPick={(c,n)=>set({hold:c,holdName:n})}/>
    {mcIsCustom(cfg.hold)?<div style={{marginTop:14,padding:'10px 12px',background:'var(--steel-50)',borderRadius:'var(--radius-sm)',font:'400 13px/1.4 var(--font-body)',color:'var(--text-body)'}}><b>Custom color.</b> {mcMoney(MC_CONFIG.pricing.custom)}/mug · minimum {MC_CONFIG.customMOQ} mugs · adds ~2 weeks lead time.</div>:<div style={{marginTop:14,font:'400 13px/1.4 var(--font-body)',color:'var(--text-muted)'}}>Standard MTNShade color · {mcMoney(MC_CONFIG.pricing.standard)}/mug · no minimum · fastest lead time.</div>}
    <div style={{marginTop:20}}><HexField label="Custom" value={cfg.hold} onChange={c=>set({hold:c,holdName:'Custom '+c.toUpperCase()})}/></div></div>}
function StepLogo({cfg,set,logo,setLogo}){const ref=React.useRef();const [over,setOver]=React.useState(false);
  const read=f=>{if(!f||!f.type.startsWith('image/'))return;const r=new FileReader();r.onload=()=>setLogo({src:r.result,name:f.name,mine:true});r.readAsDataURL(f)};
  const R=(label,k,min,max,step)=><label style={{display:'flex',flexDirection:'column',gap:8}}><span style={{...mcLabel,display:'flex',justifyContent:'space-between'}}>{label}<span style={{fontWeight:400,color:'var(--text-muted)'}}>{Math.round(cfg[k]*100)}%</span></span>
    <input type="range" min={min} max={max} step={step} value={cfg[k]} onChange={e=>set({[k]:+e.target.value})}/></label>;
  return <div><StepHead k="Step 02" t="Your logo" d="Upload your gym or company logo. One-color, high-contrast art etches best."/>
    <button onClick={()=>ref.current.click()} onDragOver={e=>{e.preventDefault();setOver(true)}} onDragLeave={()=>setOver(false)} onDrop={e=>{e.preventDefault();setOver(false);read(e.dataTransfer.files[0])}}
      style={{width:'100%',padding:'22px 16px',border:'2px dashed '+(over?'var(--brand-primary)':'var(--border-strong)'),borderRadius:'var(--radius-md)',background:over?'var(--blue-50)':'#fff',cursor:'pointer',font:'600 16px/1.4 var(--font-body)',color:'var(--text-body)',display:'flex',alignItems:'center',justifyContent:'center',gap:14}}>
      {logo&&logo.src?<><img src={logo.src} alt="" style={{height:40,maxWidth:80,objectFit:'contain',background:'var(--steel-700)',borderRadius:4,padding:4}}/><span>{logo.name} · <u>Replace</u></span></>:<span>Drop your logo here or <u>browse</u><br/><span style={{fontWeight:400,fontSize:14,color:'var(--text-muted)'}}>PNG, SVG or JPG</span></span>}</button>
    <input ref={ref} type="file" accept="image/*" onChange={e=>read(e.target.files[0])} style={{display:'none'}}/>
    <div style={{display:'flex',gap:8,marginTop:10,marginBottom:20}}>{logo&&<DButton size="sm" variant="ghost" onClick={()=>setLogo(null)}>Remove logo</DButton>}</div>
    <div style={{display:'flex',flexDirection:'column',gap:6,padding:'12px 14px',background:'var(--steel-50)',borderRadius:'var(--radius-md)',marginBottom:20}}><DCheck checked={!!cfg.logoHelp} onChange={v=>set({logoHelp:v})} label="Only have a JPG or low-res logo? We'll clean it up"/><span style={{font:'400 13px/1.4 var(--font-body)',color:'var(--text-muted)',paddingLeft:32}}>Upload what you have. We'll send a clean, etch-ready version with your proof.</span></div>
    <div style={{display:'flex',flexDirection:'column',gap:18}}>
      <DSelect label="Etch from" value={cfg.ink} onChange={v=>set({ink:v})} options={[{value:'auto',label:'Auto-detect'},{value:'shape',label:'Logo shape (transparent PNG)'},{value:'dark',label:'Dark areas of logo'},{value:'light',label:'Light areas of logo'}]}/>
      {R('Logo size','logoScale',.3,.95,.01)}
      {/* Engraved text option removed for now — restore from git history if needed */}</div></div>}
const MC_DEFAULT_LOGO='../../assets/logo/mtnshade-mark-white.png';
Object.assign(window,{HOLD_COLORS,StepHead,StepHold,StepLogo,PRESETS,MC_DEFAULT_LOGO,mcLabel});
