// 3D mug: lathe body (stainless only), photo-matched climbing hold, canvas-texture laser etch.
THREE.ColorManagement.legacyMode=false;
const MUG_R=1,MUG_H=2.8; // ~2.75" dia × ~3.9" tall
function mcNoise(x,y,z){return Math.sin(x*3.1+1.7)*Math.sin(y*2.3+.4)*Math.cos(z*2.9+2.1)*.55+Math.sin(x*6.7+y*5.3)*Math.cos(z*7.1+x*1.3)*.22+Math.sin(y*11+z*9)*.07}
function mcCanvasTex(w,h,draw,rep){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;if(rep)t.repeat.set(rep[0],rep[1]);return t}
function mcBuildEnv(renderer){
  const s=new THREE.Scene();const box=new THREE.Mesh(new THREE.BoxGeometry(30,30,30),new THREE.MeshBasicMaterial({color:0x5f646b,side:THREE.BackSide}));s.add(box);
  const panel=(w,h,k,pos)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));m.material.color.setScalar(k);m.position.set(...pos);m.lookAt(0,pos[1],0);s.add(m)};
  panel(2.2,20,5,[-7,2,6]);panel(1,20,3,[7,2,5]);panel(4,20,1.6,[0,2,-10]);panel(1.4,20,2.2,[-9,2,-3]);
  const top=new THREE.Mesh(new THREE.PlaneGeometry(14,14),new THREE.MeshBasicMaterial());top.material.color.setScalar(1.8);top.position.y=12;top.rotation.x=Math.PI/2;s.add(top);
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(30,30),new THREE.MeshBasicMaterial({color:0x2b2e33}));fl.position.y=-6;fl.rotation.x=-Math.PI/2;s.add(fl);
  const pm=new THREE.PMREMGenerator(renderer);const env=pm.fromScene(s,.03).texture;pm.dispose();return env}
// Hold modelled from reference photos (assets/reference/hold-*.png):
// peanut / dog-bone outline ~0.6x mug height, ~0.5x mug diameter, waist just above centre,
// spine ridge along the long axis, soft bevelled flanks, bolt in a countersunk dimple ~60% down.
const HOLD={A:.52,B:.8,T:.44,yc:1.47,tilt:.1,bolt:[.03,-.04]};
function mcHoldShape(){
  const {A,B,T,tilt}=HOLD;const ct=Math.cos(tilt),st=Math.sin(tilt);
  const outline=phi=>{const c=Math.cos(phi),s=Math.sin(phi);let r=A*B/Math.sqrt((B*c)**2+(A*s)**2);
    r*=1+.035*Math.sin(3*phi+.7)+.022*Math.sin(5*phi+2.1)+.012*Math.sin(9*phi+.3);return r};
  const warp=(u,v)=>{const w=1-.27*Math.exp(-(((v-.06)/.3)**2));const lobe=1+.07*(v/B);return [u*w*lobe+.05*v,v]};
  const rot=(u,v)=>[u*ct-v*st,u*st+v*ct];
  const [bu,bv]=warp(...HOLD.bolt);
  const height=(sN,phi,u,v)=>{let h=T*Math.pow(Math.max(0,1-Math.pow(sN,5)),.32);
    h*=1-.12*Math.pow(sN,1.5)*Math.abs(Math.cos(phi));h*=1-.08*Math.exp(-(((v-.04)/.22)**2));h*=1+.05*Math.sin(v*5.2+.6);h*=1+.1*(v/B);
    h+=T*.07*(Math.sin(u*9+v*4)*Math.sin(v*7-u*3))*sN*(1-sN)*4;
    const d=Math.hypot(u-bu,v-bv);if(d<.15)h-=.035*Math.pow(1-(d/.15)**2,1.5);return Math.max(h,.004)};
  const point=(sN,phi)=>{const r=outline(phi)*sN;let [u,v]=warp(r*Math.cos(phi),r*Math.sin(phi));const h=height(sN,phi,u,v);[u,v]=rot(u,v);return {u,v,h}};
  const boltPt=(()=>{const [u,v]=rot(bu,bv);const T0=T;const h=height(.25,Math.atan2(HOLD.bolt[1],HOLD.bolt[0]),bu,bv);return {u,v,h}})();
  return {point,boltPt}}
function mcHoldGeo(){const {point}=mcHoldShape();const M=180,N=44;const pos=[],uv=[],idx=[];
  const base=u=>Math.sqrt(Math.max(0,1-u*u));
  const rows=[];for(let i=0;i<=N;i++)rows.push([i/N,1]);for(let i=N;i>=0;i--)rows.push([i/N,0]);
  rows.forEach(([sN,front])=>{for(let j=0;j<=M;j++){const phi=j/M*Math.PI*2;const p=point(sN,phi);const x=base(p.u)+(front?p.h:-.03);pos.push(x,HOLD.yc+p.v,p.u);uv.push(p.u*1.6+.5,p.v*1.6+.5)}});
  for(let r=0;r<rows.length-1;r++)for(let j=0;j<M;j++){const a=r*(M+1)+j,b=a+M+1;idx.push(a,b,a+1,b,b+1,a+1)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g}
// Button-head hex socket bolt + thin flange washer, seated at the bottom of the countersink (see hold-*-front.png).
function mcBolt(mat,holdGeo){const {A,B,tilt}=HOLD;const ct=Math.cos(tilt),st=Math.sin(tilt);
  const [u0,v0]=HOLD.bolt;const w=1-.27*Math.exp(-(((v0-.06)/.3)**2));const lobe=1+.07*(v0/B);let bu=u0*w*lobe+.05*v0,bv=v0;
  const tu=bu*ct-bv*st,tv=bu*st+bv*ct;
  const P=holdGeo.attributes.position,Nm=holdGeo.attributes.normal;const half=P.count/2|0;let best=1e9,bi=0;
  for(let i=0;i<half;i++){const dz=P.getZ(i)-tu,dy=P.getY(i)-(HOLD.yc+tv);const d=dz*dz+dy*dy;if(d<best){best=d;bi=i}}
  const pos=new THREE.Vector3(P.getX(bi),P.getY(bi),P.getZ(bi));const n=new THREE.Vector3(Nm.getX(bi),Nm.getY(bi),Nm.getZ(bi));if(n.x<0)n.negate();n.lerp(new THREE.Vector3(1,0,0),.85).normalize();
  const g=new THREE.Group();
  const flange=new THREE.Mesh(new THREE.CylinderGeometry(.15,.155,.02,56),mat);flange.rotation.z=-Math.PI/2;flange.position.x=.01;
  const prof=[];for(let k=0;k<=24;k++){const t=k/24;prof.push(new THREE.Vector2(.128*Math.pow(Math.cos(t*Math.PI/2),.5),.078*Math.sin(t*Math.PI/2)))}
  const head=new THREE.Mesh(new THREE.LatheGeometry(prof,56),mat);head.rotation.z=-Math.PI/2;head.position.x=.018;
  const sock=new THREE.Mesh(new THREE.CylinderGeometry(.024,.024,.01,6),new THREE.MeshStandardMaterial({color:0x4a4d52,metalness:.8,roughness:.4}));sock.rotation.z=-Math.PI/2;sock.position.x=.093;
  g.add(flange,head,sock);g.position.copy(pos).addScaledVector(n,.004);g.quaternion.setFromUnitVectors(new THREE.Vector3(1,0,0),n);return g}
const MC_LOGO_Y=.47;
const MC_FONTS={condensed:{label:'Condensed (brand)',family:'"Barlow Condensed"',weight:700,track:.14},
  heavy:{label:'Heavy sans',family:'"Archivo"',weight:800,track:.04},
  classic:{label:'Classic sans',family:'"Source Sans 3"',weight:600,track:.06},
  serif:{label:'Serif',family:'"Playfair Display"',weight:700,track:.04},
  slab:{label:'Slab',family:'"Roboto Slab"',weight:700,track:.05},
  stencil:{label:'Stencil',family:'"Big Shoulders Stencil Text"',weight:800,track:.1},
  script:{label:'Script',family:'"Pacifico"',weight:400,track:0},
  mono:{label:'Mono',family:'"JetBrains Mono"',weight:600,track:.08}};
function mcDrawDecal(canvas,o){
  const W=canvas.width,H=canvas.height,x=canvas.getContext('2d');x.clearRect(0,0,W,H);let ty=H*MC_LOGO_Y;
  if(o.logoImg){const img=o.logoImg;const w=W*o.logoScale;const h=Math.min(w*img.height/img.width,H*.62);const ww=h*img.width/img.height;
    const c=document.createElement('canvas');c.width=Math.max(1,Math.round(ww));c.height=Math.max(1,Math.round(h));const cx=c.getContext('2d');cx.drawImage(img,0,0,c.width,c.height);
    const d=cx.getImageData(0,0,c.width,c.height),p=d.data;let opaque=true;for(let i=3;i<p.length;i+=40){if(p[i]<250){opaque=false;break}}
    const mode=o.ink==='auto'?(opaque?'dark':'shape'):o.ink;const [er,eg,eb]=o.etchRGB;
    for(let i=0;i<p.length;i+=4){const L=(.299*p[i]+.587*p[i+1]+.114*p[i+2])/255,A=p[i+3]/255;let a=mode==='shape'?A:mode==='dark'?A*(1-L):A*L;a=Math.max(0,Math.min(1,(a-.12)/.72));p[i]=er;p[i+1]=eg;p[i+2]=eb;p[i+3]=a*255}
    cx.putImageData(d,0,0);x.drawImage(c,W/2-ww/2,ty-h/2);ty=ty+h/2+H*.085}
  if(o.text){const F=MC_FONTS[o.font]||MC_FONTS.condensed;const fs=H*(o.font==='script'?.062:.07);x.font=F.weight+' '+fs+'px '+F.family+', sans-serif';x.textAlign='center';x.textBaseline='middle';try{x.letterSpacing=(fs*F.track)+'px'}catch(e){}
    x.fillStyle='rgb('+o.etchRGB.join(',')+')';let t=o.caps?o.text.toUpperCase():o.text;let f2=fs;const setF=()=>{x.font=F.weight+' '+f2+'px '+F.family+', sans-serif';try{x.letterSpacing=(f2*F.track)+'px'}catch(e){}};while(x.measureText(t).width>W*.7&&f2>H*.036){f2*=.94;setF()}while(x.measureText(t).width>W*.7&&t.length>1)t=t.slice(0,-1);x.fillText(t,W/2,Math.min(ty,H*.92))}}
const MC_STEEL={color:'#d3d7dc',metal:1,rough:.55,etch:[218,214,202],etchMetal:.35,etchRough:.7};
const MC_VIEWS={'3/4':-.5,'Front':0,'Handle':-Math.PI/2,'Back':Math.PI};
function MugStage({config,logoImg,view,onDrag,apiRef,glare=true}){
  const host=React.useRef();const S=React.useRef({});
  React.useEffect(()=>{const el=host.current;const st=S.current;
    const r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});r.setPixelRatio(Math.min(2,window.devicePixelRatio));r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.05;
    el.appendChild(r.domElement);r.domElement.style.display='block';r.domElement.style.touchAction='none';
    const scene=new THREE.Scene();scene.environment=mcBuildEnv(r);
    const cam=new THREE.PerspectiveCamera(28,1,.1,100);
    scene.add(new THREE.HemisphereLight(0xffffff,0x444444,.35));const dl=new THREE.DirectionalLight(0xffffff,1.1);dl.position.set(3,6,5);scene.add(dl);
    const mug=new THREE.Group();scene.add(mug);
    const brushed=mcCanvasTex(1024,1024,(x,w,h)=>{x.fillStyle='#8c8c8c';x.fillRect(0,0,w,h);for(let i=0;i<5000;i++){const v=100+Math.random()*80|0;x.strokeStyle='rgba('+v+','+v+','+v+',.14)';x.lineWidth=.5+Math.random()*.8;const y=Math.random()*h;x.beginPath();x.moveTo(0,y);x.lineTo(w,y+(Math.random()-.5)*3);x.stroke()}},[1,6]);
    const V=(a,b)=>new THREE.Vector2(a,b);
    const outerPts=[V(0,0),V(.9,0),V(.97,.015),V(.995,.06),V(1,.14),V(1,2.7),V(.997,2.76),V(.99,2.785)];
    const innerPts=[V(.99,2.785),V(.975,2.805),V(.955,2.8),V(.94,2.77),V(.935,2.7),V(.935,.32),V(.9,.29),V(0,.28)];
    const outerMat=new THREE.MeshStandardMaterial({roughnessMap:brushed,side:THREE.DoubleSide,envMapIntensity:1.1});
    const innerMat=new THREE.MeshStandardMaterial({color:0xcfd3d8,metalness:1,roughness:.5,roughnessMap:brushed,side:THREE.DoubleSide});
    mug.add(new THREE.Mesh(new THREE.LatheGeometry(outerPts,128),outerMat));mug.add(new THREE.Mesh(new THREE.LatheGeometry(innerPts,128),innerMat));
    const ARC=1.7,DH=2.4;const dc=document.createElement('canvas');dc.width=Math.round(512*ARC/DH*2);dc.height=1024;const dtex=new THREE.CanvasTexture(dc);dtex.encoding=THREE.sRGBEncoding;dtex.anisotropy=8;
    const decalMat=new THREE.MeshStandardMaterial({map:dtex,transparent:true,polygonOffset:true,polygonOffsetFactor:-2,depthWrite:false});
    const decal=new THREE.Mesh(new THREE.CylinderGeometry(1.003,1.003,DH,96,1,true,-ARC/2,ARC),decalMat);decal.position.y=1.42;mug.add(decal);
    const grit=mcCanvasTex(512,512,(x,w,h)=>{const d=x.createImageData(w,h);for(let i=0;i<d.data.length;i+=4){const v=Math.random()*255;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}x.putImageData(d,0,0)},[3,3]);
    const holdMat=new THREE.MeshStandardMaterial({roughness:.9,metalness:0,bumpMap:grit,bumpScale:.01,side:THREE.DoubleSide,envMapIntensity:.45});
    const holdGeo=mcHoldGeo();mug.add(new THREE.Mesh(holdGeo,holdMat));
    mug.add(mcBolt(new THREE.MeshStandardMaterial({color:0xe4e7eb,metalness:1,roughness:.12}),holdGeo));
    const sh=new THREE.Mesh(new THREE.PlaneGeometry(4.2,4.2),new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,map:mcCanvasTex(256,256,(x,w,h)=>{const g=x.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(0,0,0,.42)');g.addColorStop(.45,'rgba(0,0,0,.16)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,w,h)})}));sh.rotation.x=-Math.PI/2;sh.position.y=.002;scene.add(sh);
    Object.assign(st,{r,scene,cam,mug,outerMat,decalMat,dtex,dc,holdMat,rot:-.5,target:-.5,drag:null});
    const fit=()=>{const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;r.setSize(w,h);cam.aspect=w/h;const dist=w/h<.85?12.5:10;cam.position.set(0,2.3,dist);cam.lookAt(0,1.25,0);cam.updateProjectionMatrix()};
    const ro=new ResizeObserver(fit);ro.observe(el);fit();
    const cv=r.domElement;
    const down=e=>{st.drag={x:e.clientX,rot:st.target};cv.setPointerCapture(e.pointerId);cv.style.cursor='grabbing'};
    const move=e=>{if(!st.drag)return;st.target=st.drag.rot+(e.clientX-st.drag.x)*.011;onDrag&&onDrag()};
    const up=()=>{st.drag=null;cv.style.cursor='grab'};cv.style.cursor='grab';
    cv.addEventListener('pointerdown',down);cv.addEventListener('pointermove',move);cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
    let raf;const loop=()=>{st.rot+=(st.target-st.rot)*.12;mug.rotation.y=st.rot;r.render(scene,cam);raf=requestAnimationFrame(loop)};loop();
    if(apiRef)apiRef.current={snapshot:()=>r.domElement.toDataURL('image/png')};
    return()=>{cancelAnimationFrame(raf);ro.disconnect();r.dispose();el.removeChild(cv)}},[]);
  React.useEffect(()=>{const st=S.current;if(!st.outerMat)return;const b=MC_STEEL;st.outerMat.color.set(b.color);st.outerMat.metalness=b.metal;st.outerMat.roughness=b.rough;st.decalMat.metalness=b.etchMetal;st.decalMat.roughness=b.etchRough;st.holdMat.color.set(config.hold)},[config.hold]);
  // Preview-only lighting: 'glare' on shows how reflective the brushed steel is; off tones reflections down so the etched logo is easier to judge. Never part of the order.
  React.useEffect(()=>{const st=S.current;if(!st.outerMat)return;st.outerMat.envMapIntensity=glare?1.1:.28;st.outerMat.roughness=glare?MC_STEEL.rough:.82;st.outerMat.needsUpdate=true;if(st.decalMat){st.decalMat.envMapIntensity=glare?1:.3;st.decalMat.needsUpdate=true}},[glare,config.hold]);
  React.useEffect(()=>{const st=S.current;if(!st.dc)return;const b=MC_STEEL;
    const draw=()=>{mcDrawDecal(st.dc,{logoImg,logoScale:config.logoScale,text:config.text,ink:config.ink,font:config.textFont,caps:config.textCaps,etchRGB:b.etch});st.dtex.needsUpdate=true};
    const F=MC_FONTS[config.textFont]||MC_FONTS.condensed;draw();document.fonts&&document.fonts.load(F.weight+' 60px '+F.family).then(draw)},[logoImg,config.logoScale,config.text,config.ink,config.textFont,config.textCaps]);
  React.useEffect(()=>{const st=S.current;if(view==null||!(view in MC_VIEWS))return;const t=MC_VIEWS[view];const cur=st.target;const k=Math.round((cur-t)/(Math.PI*2));st.target=t+k*Math.PI*2},[view]);
  return <div ref={host} style={{position:'absolute',inset:0}}></div>;
}
Object.assign(window,{MugStage,MC_STEEL,MC_VIEWS,MC_FONTS,MC_LOGO_Y});
