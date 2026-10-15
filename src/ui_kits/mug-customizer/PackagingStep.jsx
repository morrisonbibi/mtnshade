const {Button:PButton,Input:PInput,Select:PSelect,Switch:PSwitch,Card:PCard}=window.MTNShadeDesignSystem_e114fa||{};
const PK_DEFAULT={mode:'cobrand',brandMode:'text',brandText:'',brandFont:'rounded',caption:true,lidLogo:null,lidInk:'auto',website:'',instagram:'',labelName:''};
function PkOption({on,title,body,onClick}){return <button onClick={onClick} style={{textAlign:'left',padding:16,background:'#fff',border:on?'2px solid var(--steel-900)':'1px solid var(--border-subtle)',borderRadius:'var(--radius-md)',cursor:'pointer',display:'flex',flexDirection:'column',gap:6}}>
  <span style={{display:'flex',alignItems:'center',gap:10}}><span style={{width:18,height:18,borderRadius:'50%',border:'2px solid '+(on?'var(--steel-900)':'var(--steel-400)'),display:'inline-flex',alignItems:'center',justifyContent:'center',flex:'none'}}>{on&&<span style={{width:8,height:8,borderRadius:'50%',background:'var(--steel-900)'}}></span>}</span>
  <span style={{font:'700 18px/1.05 var(--font-display)',textTransform:'uppercase',color:'var(--text-strong)'}}>{title}</span></span>
  <span style={{font:'400 14px/1.4 var(--font-body)',color:'var(--text-muted)',paddingLeft:28}}>{body}</span></button>}
function PkSeg({value,options,onChange}){return <div style={{display:'flex',background:'var(--steel-100)',borderRadius:'var(--radius-sm)',padding:3,gap:3}}>{options.map(([v,l])=><button key={v} onClick={()=>onChange(v)} style={{flex:1,border:'none',cursor:'pointer',padding:'9px 10px',borderRadius:3,font:'700 14px/1 var(--font-display)',textTransform:'uppercase',letterSpacing:'.05em',background:value===v?'#fff':'transparent',color:value===v?'var(--text-strong)':'var(--text-muted)',boxShadow:value===v?'var(--shadow-sm)':'none'}}>{l}</button>)}</div>}
function StepPackaging({pkg,setPkg,logo,goLogo,autoLabel,onCustom}){
  const ref=React.useRef();const up=p=>setPkg(x=>({...x,...p}));const [f,setF]=React.useState({name:'',email:'',notes:''});const [err,setErr]=React.useState({});
  const read=file=>{if(!file||!file.type.startsWith('image/'))return;const r=new FileReader();r.onload=()=>up({lidLogo:{src:r.result,name:file.name}});r.readAsDataURL(file)};
  const send=()=>{const e={};if(!f.name.trim())e.name='Required';if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email))e.email='Enter a valid email';setErr(e);if(!Object.keys(e).length)onCustom(f)};
  const sec={display:'flex',flexDirection:'column',gap:12,paddingTop:18,marginTop:18,borderTop:'1px solid var(--border-subtle)'};
  return <div><StepHead k="Step 03" t="Packaging" d="Retail-ready gift box. Go co-branded, or bring your own full design."/>
    <div style={{display:'flex',flexDirection:'column',gap:10}}>
      <PkOption on={pkg.mode==='cobrand'} onClick={()=>up({mode:'cobrand'})} title="Gym logo × MTNShade" body="Our mountain box with your logo on every side and on the mug drawing, plus your name on the lid."/>
      <PkOption on={pkg.mode==='custom'} onClick={()=>up({mode:'custom'})} title="Custom" body={'Your own full box design. We\'ll reach out and work through it with you. One-time fee: '+mcMoney(MC_CONFIG.customPackaging.perUnit)+'/mug or '+mcMoney(MC_CONFIG.customPackaging.cap)+', whichever is lower.'}/></div>
    {pkg.mode==='cobrand'&&<>
      <div style={sec}><div style={mcLabel}>Your logo</div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>{logo&&logo.src?<img src={logo.src} alt="" style={{width:52,height:52,objectFit:'contain',background:'var(--steel-700)',borderRadius:6,padding:6,flex:'none'}}/>:<span style={{width:52,height:52,borderRadius:6,border:'1.5px dashed var(--border-strong)',flex:'none'}}></span>}
          <div style={{flex:1,minWidth:0,font:'400 14px/1.4 var(--font-body)',color:'var(--text-muted)'}}>{logo?<>Using <b style={{color:'var(--text-strong)'}}>{logo.name}</b> from your mug on the lockups and the mug drawing.</>:'No logo on your mug yet.'}</div>
          <PButton size="sm" variant="outline" onClick={goLogo}>{logo?'Change':'Add logo'}</PButton></div></div>
      <div style={sec}><div style={mcLabel}>Lid · brand name</div>
        <PkSeg value={pkg.brandMode} onChange={v=>up({brandMode:v})} options={[['text','Text'],['logo','Logo']]}/>
        <PInput label="Brand name" value={pkg.brandText} maxLength={24} onChange={e=>up({brandText:e.target.value})} placeholder="Enter brand name" hint={pkg.brandMode==='text'?'Printed on the lid and under your logo':'Printed under your logo'}/>
        <PSelect label="Font" value={pkg.brandFont} onChange={v=>up({brandFont:v})} options={Object.entries(PK_FONTS).map(([value,x])=>({value,label:x.label}))}/>
        {pkg.brandMode==='logo'&&<><button onClick={()=>ref.current.click()} style={{padding:16,border:'2px dashed var(--border-strong)',borderRadius:'var(--radius-md)',background:'#fff',cursor:'pointer',font:'600 15px/1.4 var(--font-body)',color:'var(--text-body)',display:'flex',alignItems:'center',justifyContent:'center',gap:12}}>
          {pkg.lidLogo?<><img src={pkg.lidLogo.src} alt="" style={{height:36,maxWidth:90,objectFit:'contain',background:'#414143',borderRadius:4,padding:4}}/>{pkg.lidLogo.name} · <u>Replace</u></>:<span>Upload a lid logo · <u>browse</u></span>}</button>
          <input ref={ref} type="file" accept="image/*" style={{display:'none'}} onChange={e=>read(e.target.files[0])}/>
          <PSelect label="Print from" value={pkg.lidInk} onChange={v=>up({lidInk:v})} options={[{value:'auto',label:'Auto-detect'},{value:'shape',label:'Logo shape (transparent PNG)'},{value:'dark',label:'Dark areas of logo'},{value:'light',label:'Light areas of logo'}]}/></>}
        <PSwitch checked={pkg.caption} onChange={v=>up({caption:v})} label="Show brand name under logo"/></div>
      <div style={sec}><div style={mcLabel}>Inside flaps</div>
        <PInput label="Website" value={pkg.website} onChange={e=>up({website:e.target.value})} placeholder="Enter website"/>
        <PInput label="Socials handle" value={pkg.instagram} onChange={e=>up({instagram:e.target.value})} placeholder="@Social Media Handle"/></div>
      <div style={sec}><div style={mcLabel}>Design tweaks</div>
        <span style={{font:'400 13px/1.4 var(--font-body)',color:'var(--text-muted)',marginTop:-4}}>Any small changes? Our designer will apply them before your proof.</span>
        <textarea value={pkg.tweaks||''} onChange={e=>up({tweaks:e.target.value})} rows={3} maxLength={500} placeholder="e.g. Make the logo a little bigger, use our darker orange…" style={{font:'400 15px/1.4 var(--font-body)',padding:'10px 12px',border:'1.5px solid var(--border-strong)',borderRadius:'var(--radius-sm)',resize:'vertical',minHeight:72,color:'var(--text-strong)'}}></textarea>
        <span style={{font:'400 12px/1 var(--font-body)',color:'var(--text-muted)',alignSelf:'flex-end'}}>{(pkg.tweaks||'').length}/500</span></div>
</>}
    {pkg.mode==='custom'&&<PCard variant="sunken" padding={18} style={{display:'flex',flexDirection:'column',gap:12,marginTop:18}}>
      <div style={{font:'400 15px/1.45 var(--font-body)',color:'var(--text-body)'}}>Tell us what you have in mind. We'll send the box dieline and help you finish the artwork.</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}><PInput label="Name" value={f.name} error={err.name} onChange={e=>setF(x=>({...x,name:e.target.value}))}/><PInput label="Email" type="email" value={f.email} error={err.email} onChange={e=>setF(x=>({...x,email:e.target.value}))}/></div>
      <label style={{display:'flex',flexDirection:'column',gap:6}}><span style={mcLabel}>Your idea</span><textarea rows={3} value={f.notes} onChange={e=>setF(x=>({...x,notes:e.target.value}))} placeholder="Colors, artwork, finish…" style={{font:'400 16px/1.4 var(--font-body)',padding:12,border:'1.5px solid var(--border-strong)',borderRadius:'var(--radius-sm)',resize:'vertical'}}></textarea></label>
      <PButton variant="ink" onClick={send}>Contact us about a custom box</PButton></PCard>}
  </div>;
}
const PK_ROCAS={brandText:'las rocas',website:'lasrocasclimbing.com',instagram:'@Lasrocasmiami'};
Object.assign(window,{StepPackaging,PK_DEFAULT,PK_ROCAS});
