// Private gym mockup pages (mtnshade.com/g/<slug>): password screen + personal note from Morrison.
// The password is checked server-side (netlify/functions/gym.js); the design only arrives after it matches.
const {Button:GButton,Input:GInput,Logo:GLogo}=window.MTNShadeDesignSystem_e114fa||{};
const ggRaw=(location.pathname.match(/^\/g\/([a-z0-9-]+)/i)||[])[1];
const ggSlug=ggRaw?ggRaw.toLowerCase():null;
const ggPwKey=s=>'mtnshade-gym-pw-'+s;
const ggOwner=()=>{try{return localStorage.getItem('mtnshade-owner')==='1'}catch(e){return false}};
function ggUnlock(slug,password){
  return fetch('api/gym',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({slug,password,owner:ggOwner()})})
    .then(r=>r.json().catch(()=>({})).then(j=>{if(r.ok&&j.gym)return j.gym;const e=new Error(j.error||'HTTP '+r.status);e.status=r.status;throw e}));
}
function GymGate({slug,onUnlock}){
  const [pw,setPw]=React.useState('');const [err,setErr]=React.useState('');const [busy,setBusy]=React.useState(true);const [dead,setDead]=React.useState(false);
  const go=(p,auto)=>{setBusy(true);setErr('');return ggUnlock(slug,p).then(g=>{try{localStorage.setItem(ggPwKey(slug),p)}catch(e){}onUnlock(g)},e=>{
    if(e.status===404)setDead(true);else if(!auto)setErr(e.status===401?'That\'s not it. Try your gym\'s name.':'Something went wrong. Please try again.');
    if(auto)try{localStorage.removeItem(ggPwKey(slug))}catch(_){}
    setBusy(false)})};
  React.useEffect(()=>{let saved='';try{saved=localStorage.getItem(ggPwKey(slug))||''}catch(e){}if(saved)go(saved,true);else setBusy(false)},[]);
  return <div style={{position:'fixed',inset:0,zIndex:300,display:'grid',placeItems:'center',padding:16,background:'rgba(21,23,26,.62)',backdropFilter:'blur(10px)',WebkitBackdropFilter:'blur(10px)'}}>
    <form onSubmit={e=>{e.preventDefault();if(pw.trim())go(pw.trim())}} style={{width:'100%',maxWidth:400,background:'#fff',borderRadius:'var(--radius-md)',padding:28,display:'flex',flexDirection:'column',gap:16,boxShadow:'var(--shadow-md)'}}>
      <GLogo variant="horizontal" color="blue" height={28} assetBase="../../assets/logo/"/>
      {dead?<React.Fragment>
        <div style={{font:'700 26px/1 var(--font-display)',textTransform:'uppercase',color:'var(--text-strong)'}}>Link not found</div>
        <div style={{font:'400 15px/1.45 var(--font-body)',color:'var(--text-muted)'}}>This mockup link isn't active. Email <a href={'mailto:'+MC_CONFIG.contactEmail}>{MC_CONFIG.contactEmail}</a> and we'll send you a fresh one.</div>
        <GButton variant="outline" onClick={()=>{location.href='/'}}>Open the Mug Studio</GButton>
      </React.Fragment>:<React.Fragment>
        <div style={{font:'700 13px/1 var(--font-display)',letterSpacing:'.08em',textTransform:'uppercase',color:'var(--brand-primary)'}}>Private mockup</div>
        <div style={{font:'700 30px/1 var(--font-display)',textTransform:'uppercase',color:'var(--text-strong)',marginTop:-6}}>Your gym's mug is ready</div>
        <div style={{font:'400 15px/1.45 var(--font-body)',color:'var(--text-muted)'}}>Enter your gym's name to see the custom mug and box we designed for you.</div>
        <GInput label="Gym name" value={pw} onChange={e=>setPw(e.target.value)} error={err} autoFocus autoCapitalize="off" autoComplete="off" spellCheck={false}/>
        <GButton variant="ink" size="lg" fullWidth disabled={busy||!pw.trim()}>{busy?'Loading your mockup…':'See my mockup'}</GButton>
      </React.Fragment>}
    </form></div>;
}
function GymNote({gym,onClose}){
  return <div style={{position:'relative',padding:'18px 44px 18px 28px',background:'var(--steel-50)',borderBottom:'1px solid var(--border-subtle)',display:'flex',flexDirection:'column',gap:8}}>
    <div style={{font:'700 13px/1 var(--font-display)',letterSpacing:'.08em',textTransform:'uppercase',color:'var(--brand-primary)'}}>Made for {gym.gym}</div>
    {gym.note&&<div style={{font:'400 15px/1.5 var(--font-body)',color:'var(--text-body)'}}>{gym.note}</div>}
    <div style={{font:'600 14px/1.3 var(--font-body)',color:'var(--text-strong)'}}>Morrison Bibi<span style={{fontWeight:400,color:'var(--text-muted)'}}>, Founder, MTNShade</span></div>
    <button onClick={onClose} aria-label="Hide note" style={{position:'absolute',top:12,right:14,border:'none',background:'none',cursor:'pointer',font:'400 22px/1 var(--font-body)',color:'var(--text-muted)',padding:4}}>×</button>
  </div>;
}
Object.assign(window,{MC_GYM_SLUG:ggSlug,GymGate,GymNote});
