// Co-brand box: composites the real Las Rocas dieline (assets/packaging/dieline-base.png, 2700×2025,
// variable art removed) with the customer's logo, brand name, hold colour and the MTNShade UPC,
// then maps panel crops onto a 3D box. Coordinates are in "preview units" (×3 = canvas px).
const PK_A='../../assets/packaging/';
const PK_S=3;
const PK_PANELS={back:[99,272,295.5,440.5],left:[298.5,272,462.5,440.5],front:[465.5,272,662.5,440.5],right:[665.5,272,828.5,440.5],top:[99.5,106,295.5,268]};
const PK_DIMS={w:1.98,d:1.65,h:1.70};
const PK_FONTS={rounded:{label:'Rounded (original)',family:'"Comfortaa"',weight:500,track:.02},...MC_FONTS};
let PK_ASSETS=null;
function pkLoad(){if(PK_ASSETS)return PK_ASSETS;const L=s=>new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=PK_A+s});
  PK_ASSETS=Promise.all(['dieline-base.png','mug-outline.png','mug-handle-mask.png','mtnshade-lockup-mark.png','upc-850017644854.png'].map(L)).then(([base,mug,handle,mtn,upc])=>({base,mug,handle,mtn,upc}));return PK_ASSETS}
function pkInk(img,ink,rgb){const c=document.createElement('canvas');c.width=img.naturalWidth||img.width;c.height=img.naturalHeight||img.height;const x=c.getContext('2d');x.drawImage(img,0,0);
  const d=x.getImageData(0,0,c.width,c.height),p=d.data;let opaque=true;for(let i=3;i<p.length;i+=40){if(p[i]<250){opaque=false;break}}const mode=ink==='auto'||!ink?(opaque?'dark':'shape'):ink;
  for(let i=0;i<p.length;i+=4){const L=(.299*p[i]+.587*p[i+1]+.114*p[i+2])/255,A=p[i+3]/255;let a=mode==='shape'?A:mode==='dark'?A*(1-L):A*L;a=Math.max(0,Math.min(1,(a-.1)/.75));p[i]=rgb[0];p[i+1]=rgb[1];p[i+2]=rgb[2];p[i+3]=a*255}x.putImageData(d,0,0);return c}
function pkFit(x,src,cx,cy,mw,mh){const w=src.width,h=src.height;const k=Math.min(mw/w,mh/h);x.drawImage(src,cx-w*k/2,cy-h*k/2,w*k,h*k)}
function pkText(x,t,cx,cy,px,fontKey,color,maxW){const F=PK_FONTS[fontKey]||PK_FONTS.rounded;let s=px;const set=()=>{x.font=F.weight+' '+s+'px '+F.family+', sans-serif';try{x.letterSpacing=(s*F.track)+'px'}catch(e){}};set();
  while(maxW&&x.measureText(t).width>maxW&&s>px*.4){s*=.94;set()}x.fillStyle=color;x.textAlign='center';x.textBaseline='middle';x.fillText(t,cx,cy)}
function pkLabel(x,ox,oy,k,A,name){const S=PK_S*k;x.fillStyle='#fff';x.fillRect(ox,oy,73*S,64*S);x.strokeStyle='#9a9a9a';x.lineWidth=.6*S;x.strokeRect(ox,oy,73*S,64*S);
  x.fillStyle='#111';x.textAlign='center';x.textBaseline='middle';x.font='400 '+(6.6*S)+'px "Source Sans 3", Arial, sans-serif';try{x.letterSpacing='0px'}catch(e){}x.fillText(name,ox+36.5*S,oy+7*S);
  x.drawImage(A.upc,ox+3*S,oy+11*S,66*S,42*S);x.fillStyle='#111';x.font='400 '+(5.6*S)+'px "Source Sans 3", Arial, sans-serif';x.fillText('Made in China',ox+36.5*S,oy+58.5*S)}
function pkCompose(A,o,dc,bc){const x=dc.getContext('2d');const S=PK_S;x.drawImage(A.base,0,0);
  const logoInk=o.logoImg?pkInk(o.logoImg,o.ink,[20,20,22]):null;const brand=(o.brandText||'').trim()||'Enter brand name';const cap=o.caption;
  [97,297,464,664].forEach(px=>{x.drawImage(A.mtn,(px+4)*S,273*S,26*S,38*S);
    x.fillStyle='#222';x.font='400 '+(8*S)+'px "Source Sans 3", Arial, sans-serif';try{x.letterSpacing='0px'}catch(e){}x.textAlign='center';x.textBaseline='middle';x.fillText('x',(px+35)*S,296*S);
    if(logoInk)pkFit(x,logoInk,(px+54)*S,(cap?288:292)*S,(cap?22:28)*S,(cap?24:32)*S);
    if(cap)pkText(x,brand,(px+54)*S,(logoInk?305:292)*S,7.6*S,o.brandFont,'#414143',36*S)});
  const hold=document.createElement('canvas');hold.width=A.handle.width;hold.height=A.handle.height;const hx=hold.getContext('2d');hx.drawImage(A.handle,0,0);hx.globalCompositeOperation='source-in';hx.fillStyle=o.hold;hx.fillRect(0,0,hold.width,hold.height);
  [[536,308],[723,307]].forEach(([mx,my])=>{const w=76*S,h=74*S;x.drawImage(hold,mx*S,my*S,w,h);x.drawImage(A.mug,mx*S,my*S,w,h);if(logoInk)pkFit(x,logoInk,mx*S+w*.405,my*S+h*.5,w*.24,h*.3)});
  if(o.brandMode==='logo'&&o.lidLogoImg)pkFit(x,pkInk(o.lidLogoImg,o.lidInk,[255,255,255]),197*S,186*S,150*S,80*S);
  else if(brand)pkText(x,brand,197*S,186*S,31*S,o.brandFont,'#fff',165*S);
  pkText(x,'Find us online at',381*S,244*S,6.8*S,o.brandFont,'#fff',150*S);pkText(x,(o.website||'').trim()||'Enter website',381*S,253*S,6.8*S,o.brandFont,'#fff',150*S);
  pkText(x,'Follow us on socials',747*S,244*S,6.8*S,o.brandFont,'#fff',150*S);pkText(x,(o.instagram||'').trim()||'@Social Media Handle',747*S,253*S,6.8*S,o.brandFont,'#fff',150*S);
  const bx=bc.getContext('2d');bx.fillStyle='#414143';bx.fillRect(0,0,bc.width,bc.height);}
const PK_VIEWS={'3/4':{y:-.6,x:.42},'Front':{y:0,x:.2},'Side':{y:-Math.PI/2,x:.2},'Top':{y:0,x:1.25},'Bottom':{y:0,x:-1.35}};
function BoxStage({opts,custom,view,onDrag,apiRef,flat}){
  const host=React.useRef();const flatHost=React.useRef();const S=React.useRef({});const [ready,setReady]=React.useState(false);
  React.useEffect(()=>{const el=host.current;const st=S.current;
    st.dc=document.createElement('canvas');st.dc.width=2700;st.dc.height=2025;st.bc=document.createElement('canvas');st.bc.width=Math.round(198*PK_S);st.bc.height=Math.round(165*PK_S);
    const r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});r.setPixelRatio(Math.min(2,window.devicePixelRatio));r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.NoToneMapping;
    el.appendChild(r.domElement);r.domElement.style.display='block';r.domElement.style.touchAction='none';
    const scene=new THREE.Scene();scene.add(new THREE.AmbientLight(0xffffff,.55));const dl=new THREE.DirectionalLight(0xffffff,.62);dl.position.set(-2.5,5,4);scene.add(dl);const dl2=new THREE.DirectionalLight(0xffffff,.25);dl2.position.set(4,2,3);scene.add(dl2);
    const cam=new THREE.PerspectiveCamera(28,1,.1,100);
    const base=new THREE.CanvasTexture(st.dc);base.encoding=THREE.sRGBEncoding;base.anisotropy=8;
    const crop=([x0,y0,x1,y1],rot)=>{const t=base.clone();t.needsUpdate=true;const W=900,H=675;if(rot){t.repeat.set(-(x1-x0)/W,-(y1-y0)/H);t.offset.set(x1/W,1-y0/H)}else{t.repeat.set((x1-x0)/W,(y1-y0)/H);t.offset.set(x0/W,1-y1/H)}return t};
    const tex={front:crop(PK_PANELS.front),back:crop(PK_PANELS.back),left:crop(PK_PANELS.left),right:crop(PK_PANELS.right),top:crop(PK_PANELS.top,Math.PI),bottom:new THREE.CanvasTexture(st.bc)};
    tex.bottom.encoding=THREE.sRGBEncoding;
    const M=t=>new THREE.MeshLambertMaterial({map:t});
    st.mats=[M(tex.right),M(tex.left),M(tex.top),M(tex.bottom),M(tex.front),M(tex.back)];st.tex=tex;
    st.plain=new THREE.MeshLambertMaterial({color:0xf6f6f4});
    const {w,d,h}=PK_DIMS;const box=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),st.mats);
    const g=new THREE.Group();g.position.y=h/2;g.add(box);scene.add(g);st.box=box;
    const sh=new THREE.Mesh(new THREE.PlaneGeometry(4.6,4.6),new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,map:mcCanvasTex(256,256,(x,W,H)=>{const gr=x.createRadialGradient(W/2,H/2,0,W/2,H/2,W/2);gr.addColorStop(0,'rgba(0,0,0,.38)');gr.addColorStop(.42,'rgba(0,0,0,.14)');gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,W,H)})}));sh.rotation.x=-Math.PI/2;sh.position.y=.002;scene.add(sh);st.sh=sh;
    Object.assign(st,{r,scene,cam,g,ry:-.6,rx:.42,ty:-.6,tx:.42});
    const fit=()=>{const W=el.clientWidth,H=el.clientHeight;if(!W||!H)return;r.setSize(W,H);cam.aspect=W/H;const dist=W/H<.85?11:8.6;cam.position.set(0,.9,dist);cam.lookAt(0,.85,0);cam.updateProjectionMatrix()};
    const ro=new ResizeObserver(fit);ro.observe(el);fit();
    const cv=r.domElement;cv.style.cursor='grab';
    cv.addEventListener('pointerdown',e=>{st.drag={x:e.clientX,y:e.clientY,ty:st.ty,tx:st.tx};cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing'});
    cv.addEventListener('pointermove',e=>{if(!st.drag)return;st.ty=st.drag.ty+(e.clientX-st.drag.x)*.011;st.tx=Math.max(-1.4,Math.min(1.4,st.drag.tx+(e.clientY-st.drag.y)*.008));onDrag&&onDrag()});
    const up=()=>{st.drag=null;cv.style.cursor='grab'};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
    let raf;const loop=()=>{st.ry+=(st.ty-st.ry)*.12;st.rx+=(st.tx-st.rx)*.12;g.rotation.order='XYZ';g.rotation.x=st.rx;g.rotation.y=st.ry;const lift=Math.abs(st.rx)>.7?(Math.abs(st.rx)-.7)*.6:0;g.position.y=h/2+lift;st.sh.material.opacity=1-Math.min(1,lift*2);r.render(scene,cam);raf=requestAnimationFrame(loop)};loop();
    if(apiRef)apiRef.current={snapshot:()=>r.domElement.toDataURL('image/png'),dieline:()=>st.dc?st.dc.toDataURL('image/jpeg',.9):null};
    pkLoad().then(A=>{st.A=A;setReady(true)});
    return()=>{cancelAnimationFrame(raf);ro.disconnect();r.dispose();el.removeChild(cv)}},[]);
  React.useEffect(()=>{const st=S.current;if(!ready||!st.A)return;
    const go=()=>{pkCompose(st.A,opts,st.dc,st.bc);Object.values(st.tex).forEach(t=>t.needsUpdate=true);if(flatHost.current&&!flatHost.current.contains(st.dc)){flatHost.current.innerHTML='';st.dc.style.width='100%';st.dc.style.height='auto';st.dc.style.display='block';flatHost.current.appendChild(st.dc)}};
    const F=PK_FONTS[opts.brandFont]||PK_FONTS.rounded;go();document.fonts&&Promise.all([document.fonts.load(F.weight+' 40px '+F.family),document.fonts.load('400 20px "Source Sans 3"')]).then(go)},[ready,opts,flat]);
  React.useEffect(()=>{const st=S.current;if(!st.box)return;st.box.material=custom?st.plain:st.mats},[custom,ready]);
  React.useEffect(()=>{const st=S.current;if(view==null||!PK_VIEWS[view])return;const v=PK_VIEWS[view];const k=Math.round((st.ty-v.y)/(Math.PI*2));st.ty=v.y+k*Math.PI*2;st.tx=v.x},[view]);
  return <><div ref={host} style={{position:'absolute',inset:0,visibility:flat?'hidden':'visible'}}></div>
    <div style={{position:'absolute',inset:'96px 24px 96px',display:flat?'flex':'none',alignItems:'center',justifyContent:'center'}}><div ref={flatHost} style={{width:'100%',maxWidth:900,background:'#fff',boxShadow:'var(--shadow-md)',borderRadius:'var(--radius-sm)',overflow:'hidden'}}></div></div></>;
}
Object.assign(window,{BoxStage,PK_VIEWS,PK_FONTS});
