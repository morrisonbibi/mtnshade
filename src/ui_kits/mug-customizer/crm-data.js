// Mug CRM — data layer: API client (live), demo client (preview without backend), and customer roll-ups.
window.CRM_STAGES=['Quote','Received','Proof sent','Proof approved','Sent to manufacturer','In production','Shipped','Delivered','Canceled'];
window.CRM_STAGE_COLOR={'Quote':'var(--steel-400)','Received':'var(--warning)','Proof sent':'var(--ice)','Proof approved':'var(--brand-primary)','Sent to manufacturer':'#6A3FA0','In production':'#6A3FA0','Shipped':'var(--steel-900)','Delivered':'#1F7A35','Canceled':'var(--danger)'};
window.CRM_PAY=['Quote','Awaiting payment','Invoiced','Paid','Refunded'];
window.CRM_CUST_STATUS=['Lead','Sampled','Customer','Repeat','Inactive','Not a fit'];
window.CRM_PSTAGES=['Researching','Mockup ready','Emailed','Follow-up 1 sent','Follow-up 2 sent','Replied','Meeting','Sample ordered','Won','Not now'];
window.CRM_PSTAGE_COLOR={'Researching':'var(--steel-400)','Mockup ready':'var(--warning)','Emailed':'var(--ice)','Follow-up 1 sent':'var(--ice)','Follow-up 2 sent':'var(--ice)','Replied':'var(--brand-primary)','Meeting':'#6A3FA0','Sample ordered':'#6A3FA0','Won':'#1F7A35','Not now':'var(--danger)'};
window.CRM_FILES=[['mug','Mug render'],['box','Box render'],['dieline','Box dieline (print layout)'],['logo','Logo file'],['lid_logo','Lid logo']];
(function(){
  const money=n=>{const v=Math.round((+n||0)*100)/100;return '$'+v.toLocaleString(undefined,{minimumFractionDigits:Number.isInteger(v)?0:2,maximumFractionDigits:2})};
  const slug=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80);
  window.crmMoney=money;
  window.crmDate=s=>s?new Date(s).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'—';
  window.crmDay=s=>s?String(s).slice(0,10):'';
  window.crmKey=o=>{const c=o.contact||{};const g=slug(c.gym);if(g)return 'gym-'+g;const e=slug(c.email);return e?'em-'+e:'unknown'};
  window.crmPaid=o=>!!(o.payment&&o.payment.status==='Paid');
  window.crmTotal=o=>crmPaid(o)&&o.payment.amount!=null?o.payment.amount:(+o.total||0);
  window.crmType=o=>({bulk_order:'Bulk',sample_order:'Sample',quote_request:'Quote'})[o.type]||'Manual';
  window.crmLoc=o=>{const a=(o.ship&&o.ship.address)||{};if(a.city||a.state)return {city:a.city||'',region:a.state||'',country:a.country||'',postal:a.postal_code||'',src:'ship'};const g=o.geo_ip||{};return {city:g.city||'',region:g.region||'',country:g.country||'',postal:'',src:g.city||g.region?'ip':''}};
  window.crmLocStr=l=>l?([l.city,l.region].filter(Boolean).join(', ')||l.country||'—'):'—';
  window.crmAddr=a=>a?[a.line1,a.line2,[a.city,a.state,a.postal_code].filter(Boolean).join(' '),a.country].filter(Boolean).join('\n'):'';
  // Groups orders into customers and tags each order New/Repeat.
  window.crmDerive=function(orders,over){
    const by={};orders.forEach(o=>{const k=o.customer_key||crmKey(o);o._ckey=k;(by[k]=by[k]||[]).push(o)});
    const list=Object.entries(by).map(([key,os])=>{
      os=os.slice().sort((a,b)=>a.created<b.created?-1:1);const last=os[os.length-1];const ov=(over||{})[key]||{};
      const paid=os.filter(crmPaid),bulk=paid.filter(o=>o.type==='bulk_order'||o.source==='manual');
      os.forEach(o=>{o._prior=paid.filter(p=>p!==o&&p.created<o.created).length});
      const loc=[...os].reverse().map(crmLoc).find(l=>l.src==='ship')||crmLoc(last);
      const auto=bulk.length>=2?'Repeat':bulk.length===1?'Customer':paid.length?'Sampled':'Lead';
      const units=bulk.reduce((s,o)=>s+(o.lines||[]).reduce((t,l)=>t+(+l.units||0),0),0);
      const colors=[...new Set(os.flatMap(o=>(o.lines||[]).map(l=>l.name)))];
      const lastPaid=paid.length?paid[paid.length-1].created:null;
      return {key,gym:(last.contact&&last.contact.gym)||'(no gym name)',name:(last.contact&&last.contact.name)||'',email:(last.contact&&last.contact.email)||'',
        emails:[...new Set(os.map(o=>o.contact&&o.contact.email).filter(Boolean))],contacts:[...new Set(os.map(o=>o.contact&&o.contact.name).filter(Boolean))],
        phone:ov.phone||[...os].reverse().map(o=>o.contact&&o.contact.phone).find(Boolean)||'',
        website:ov.website||[...os].reverse().map(o=>o.packaging&&o.packaging.website).find(Boolean)||'',
        instagram:ov.instagram||[...os].reverse().map(o=>o.packaging&&o.packaging.instagram).find(Boolean)||'',
        address:[...os].reverse().map(o=>o.ship&&o.ship.address).find(a=>a&&a.line1)||null,
        loc,orders:os,paid,bulk,units,colors,ltv:paid.reduce((s,o)=>s+crmTotal(o),0),first:os[0].created,last:last.created,lastPaid,
        reorderDue:bulk.length&&lastPaid&&(Date.now()-new Date(lastPaid))>150*864e5,
        source:(os[0].attribution&&os[0].attribution.utm_campaign)||'(direct)',status:ov.status||auto,autoStatus:auto,
        notes:ov.notes||'',tags:ov.tags||'',follow_up:ov.follow_up||'',owner:ov.owner||'',size:ov.size||''}});
    const byKey={};list.forEach(c=>byKey[c.key]=c);return {customers:list.sort((a,b)=>a.last<b.last?1:-1),byKey};
  };
  // Live client — talks to /api/crm with the CRM password.
  window.crmLive=function(key){
    const h={'x-crm-key':key};const J=r=>r.ok?r.json():r.json().catch(()=>({})).then(e=>{const x=new Error(e.error||('HTTP '+r.status));x.status=r.status;throw x});
    const post=(op,b)=>fetch('api/crm?op='+op,{method:'POST',headers:{...h,'content-type':'application/json'},body:JSON.stringify(b)}).then(J);
    const cache={};
    return {live:true,list:()=>fetch('api/crm?op=list',{headers:h}).then(J),update:(id,patch,note)=>post('update',{id,patch,note}),customer:(key,patch)=>post('customer',{key,patch}),
      sync:id=>post('sync',{id}),upload:(id,field,name,dataUrl)=>post('upload',{id,field,name,dataUrl}),create:order=>post('create',{order}),
      fileUrl:(o,f)=>{const k=o.id+'/'+f;if(!cache[k])cache[k]=fetch('api/crm?op=file&id='+encodeURIComponent(o.id)+'&field='+f,{headers:h}).then(r=>r.ok?r.blob():null).then(b=>b?URL.createObjectURL(b):null).catch(()=>null);return cache[k]},
      hasFile:(o,f)=>(o.files||[]).includes(f),
      prospects:()=>fetch('api/crm?op=prospects',{headers:h}).then(J),
      prospect:(slug,patch,note,logo,logo_name)=>post('prospect',{slug,patch,note,logo,logo_name}),
      prospectCreate:(prospect,logo,logo_name)=>post('prospect_create',{prospect,logo,logo_name}),
      prospectLogo:slug=>fetch('api/crm?op=prospect_logo&slug='+encodeURIComponent(slug),{headers:h}).then(J).then(j=>j.logo||null,()=>null)};
  };
  window.crmProbe=()=>fetch('api/crm?op=ping').then(r=>{const ct=r.headers.get('content-type')||'';return ct.includes('json')?'live':'demo'},()=>'demo');
  // Demo client — sample data so the CRM can be previewed without the backend.
  window.crmDemo=function(){
    const d=n=>new Date(Date.now()-n*864e5).toISOString();const A='../../assets/';
    const pk=(b,w,i)=>({route:'cobrand',brand_mode:'text',brand_text:b,font:'rounded',caption:true,website:w,instagram:i,tweaks:''});
    const addr=(l1,c,s,z)=>({line1:l1,city:c,state:s,postal_code:z,country:'US'});
    const O=[
      {id:'MS-260712-A7Q2',type:'bulk_order',created:d(96),contact:{name:'Carla Ruiz',gym:'Las Rocas',email:'carla@lasrocasclimbing.com',phone:'+1 305 555 0142'},lines:[{hold:'#16B5BF',name:'Teal',units:324,cartons:9,custom:true,unit_price:13.5}],total:4374,units:324,cartons:9,
        mug:{logo_name:'Las Rocas gecko',logo_url:A+'logo/partners/las-rocas-gecko-white.png',logo_scale:.5,etch:'auto'},packaging:pk('las rocas','lasrocasclimbing.com','@Lasrocasmiami'),attribution:{utm_campaign:'fall-gyms',utm_source:'email'},
        payment:{status:'Paid',amount:4374,paid_at:d(96)},ship:{name:'Las Rocas Climbing',address:addr('2200 NW 7th Ave','Miami','FL','33127')},stage:'Delivered',ship_date:crmDay(d(20)),carrier:'UPS',tracking:'1Z999AA10123456784',manufacturer:'Ningbo factory',mfg_po:'PO-1042',
        history:[{at:d(96),text:'Bulk order submitted from studio'},{at:d(96),text:'Paid via Stripe · $4374'},{at:d(93),text:'Stage → Proof sent'},{at:d(90),text:'Stage → Proof approved'},{at:d(89),text:'Stage → Sent to manufacturer'},{at:d(30),text:'Stage → Shipped'},{at:d(20),text:'Stage → Delivered'}],
        _demoFiles:{logo:A+'logo/partners/las-rocas-gecko-white.png',dieline:A+'packaging/dieline-base.png',box:A+'reference/packaging/photo-b.jpg'}},
      {id:'MS-261002-K3PD',type:'bulk_order',created:d(13),contact:{name:'Carla Ruiz',gym:'Las Rocas',email:'carla@lasrocasclimbing.com',phone:'+1 305 555 0142'},lines:[{hold:'#2141A8',name:'Summit Blue',units:144,cartons:4,custom:false,unit_price:12}],total:1728,units:144,cartons:4,
        mug:{logo_name:'Las Rocas gecko',logo_url:A+'logo/partners/las-rocas-gecko-white.png',logo_scale:.5,etch:'auto'},packaging:pk('las rocas','lasrocasclimbing.com','@Lasrocasmiami'),attribution:{utm_campaign:'reorder'},needed_by:crmDay(new Date(Date.now()+40*864e5).toISOString()),
        payment:{status:'Paid',amount:1728,paid_at:d(13)},ship:{name:'Las Rocas Climbing',address:addr('2200 NW 7th Ave','Miami','FL','33127')},stage:'Proof approved',history:[{at:d(13),text:'Bulk order submitted from studio'},{at:d(13),text:'Paid via Stripe · $1728'},{at:d(10),text:'Stage → Proof sent'},{at:d(8),text:'Stage → Proof approved'}],
        _demoFiles:{logo:A+'logo/partners/las-rocas-gecko-white.png',dieline:A+'packaging/dieline-base.png'}},
      {id:'MS-261006-BR4N',type:'bulk_order',created:d(9),contact:{name:'Devon Park',gym:'Boulder Barn',email:'devon@boulderbarn.com'},lines:[{hold:'#C8102E',name:'Crimp Red',units:72,cartons:2,custom:false,unit_price:12}],total:864,units:72,cartons:2,
        mug:{logo_name:'boulderbarn.png',logo_scale:.55,etch:'auto'},packaging:pk('boulder barn','boulderbarn.com','@boulderbarn'),attribution:{utm_campaign:'agent-denver',utm_source:'agent'},
        payment:{status:'Paid',amount:864,paid_at:d(9)},ship:{name:'Boulder Barn',address:addr('410 Walnut St','Denver','CO','80204')},stage:'Received',history:[{at:d(9),text:'Bulk order submitted from studio'},{at:d(9),text:'Paid via Stripe · $864'}]},
      {id:'MS-261009-T8MX',type:'sample_order',created:d(6),contact:{name:'Priya Shah',gym:'Crux Collective',email:'priya@cruxcollective.co'},lines:[{hold:'#1F7A35',name:'Green',units:1,custom:true,unit_price:100,sample:true}],total:100,units:1,
        mug:{logo_name:'crux-logo.png',logo_scale:.5,etch:'dark'},packaging:pk('crux collective','cruxcollective.co','@cruxcollective'),attribution:{utm_campaign:'agent-austin',utm_source:'agent'},
        payment:{status:'Paid',amount:100,paid_at:d(6)},ship:{name:'Priya Shah',address:addr('1801 E 6th St','Austin','TX','78702')},stage:'In production',history:[{at:d(6),text:'Sample order submitted from studio'}]},
      {id:'MS-261011-Q2ZL',type:'quote_request',created:d(4),contact:{name:'Sam Okafor',gym:'Vertical Hive',email:'sam@verticalhive.com'},lines:[{hold:'#F5C400',name:'Yellow',units:396,cartons:11,custom:true,unit_price:13.5}],total:5346,units:396,cartons:11,
        mug:{logo_name:'hive.svg',logo_scale:.5,etch:'auto'},packaging:{...pk('vertical hive','verticalhive.com','@verticalhive'),route:'custom'},pack_fee:250,notes:'Opening a second location in spring — may double the order.',attribution:{utm_campaign:'fall-gyms',utm_source:'email'},
        geo_ip:{city:'Portland',region:'OR',country:'US'},payment:{status:'Quote'},stage:'Quote',history:[{at:d(4),text:'Quote request submitted from studio'}]},
      {id:'MS-261013-W5HC',type:'bulk_order',created:d(2),contact:{name:'Jordan Lee',gym:'Granite Gym',email:'jordan@granitegym.com'},lines:[{hold:'#2141A8',name:'Summit Blue',units:36,cartons:1,custom:false,unit_price:12}],total:432,units:36,cartons:1,
        mug:{logo_name:'granite.png',logo_scale:.5,etch:'auto'},packaging:pk('granite gym','granitegym.com','@granitegym'),attribution:{utm_campaign:'agent-denver',utm_source:'agent'},
        geo_ip:{city:'Boulder',region:'CO',country:'US'},payment:{status:'Awaiting payment'},stage:'Received',history:[{at:d(2),text:'Bulk order submitted from studio'}]}];
    O.forEach(o=>{o.customer_key=crmKey(o);o.files=Object.keys(o._demoFiles||{})});
    const C={'gym-las-rocas':{notes:'Front desk sells ~40/month. Wants a holiday colorway.',tags:'flagship, florida',follow_up:crmDay(d(-3)),size:'Large (1,500+ members)'},'gym-vertical-hive':{follow_up:crmDay(d(1)),tags:'hot lead'}};
    const later=v=>new Promise(r=>setTimeout(()=>r(v),120));const find=id=>O.find(o=>o.id===id);
    const PD=n=>new Date(Date.now()+n*864e5).toISOString().slice(0,10);
    const P=[{slug:'goat',gym:'GOAT Climbing Gym',password:'goat',town:'Hackensack, NJ',email:'info@goatclimbinggyms.com',phone:'201-402-9343',website:'goatclimbinggym.com',instagram:'@goatclimbinggym',hold:'#F86635',holdName:'GOAT Orange',logo_url:'',brand_text:'goat',note:'Hey GOAT, I grew up in Bergen County…',stage:'Emailed',emailed_at:PD(-6),follow_up:PD(-1),views:2,last_viewed:d(1),history:[{at:d(6),text:'Stage → Emailed'},{at:d(1),text:'Opened their mockup page (Hackensack, NJ)'}],research:'Demo prospect.'},
      {slug:'method',gym:'Method Climbing + Fitness',password:'method',town:'Newark, NJ',email:'info@methodclimb.com',website:'methodclimb.com',instagram:'@methodclimb',hold:'#B8421C',holdName:'Method Rust',brand_text:'method',note:'Hi Method…',stage:'Mockup ready',history:[],research:'Demo prospect.'}];
    const pfind=s=>P.find(p=>p.slug===s);
    return {live:false,
      prospects:()=>later({prospects:JSON.parse(JSON.stringify(P)),stages:CRM_PSTAGES}),
      prospect:(slug,patch,note)=>{const p=pfind(slug);const h=[];if(patch.stage&&patch.stage!==p.stage){h.push('Stage → '+patch.stage);if(patch.stage==='Emailed'){p.emailed_at=PD(0);p.follow_up=PD(5)}if(patch.stage==='Follow-up 1 sent')p.follow_up=PD(7)}Object.assign(p,patch);p.history=[...(p.history||[]),...h.map(t=>({at:new Date().toISOString(),text:t})),...(note?[{at:new Date().toISOString(),text:note,note:true}]:[])];return later({prospect:JSON.parse(JSON.stringify(p))})},
      prospectCreate:x=>{const p={...x,slug:x.slug||String(x.gym||'').toLowerCase().replace(/[^a-z0-9]/g,''),stage:'Researching',history:[{at:new Date().toISOString(),text:'Added in CRM'}]};P.push(p);return later({prospect:p})},
      prospectLogo:()=>Promise.resolve(null),
      list:()=>later({orders:JSON.parse(JSON.stringify(O)),customers:JSON.parse(JSON.stringify(C))}),
      update:(id,patch,note)=>{const o=find(id);const h=[];if(patch.stage&&patch.stage!==o.stage)h.push('Stage → '+patch.stage);if(patch.payment_status){o.payment={...o.payment,status:patch.payment_status};h.push('Payment → '+patch.payment_status);delete patch.payment_status}
        Object.assign(o,patch);o.history=[...o.history,...h.map(t=>({at:new Date().toISOString(),text:t})),...(note?[{at:new Date().toISOString(),text:note,note:true}]:[])];return later({order:JSON.parse(JSON.stringify(o))})},
      customer:(key,patch)=>{C[key]={...(C[key]||{}),...patch};return later({customer:C[key]})},
      sync:id=>later({order:JSON.parse(JSON.stringify(find(id))),changed:false}),
      upload:(id,field,name,dataUrl)=>{const o=find(id);o._demoFiles={...(o._demoFiles||{}),[field]:dataUrl};o.files=Object.keys(o._demoFiles);return later({ok:true})},
      create:order=>{const o={...order,id:'MS-'+new Date().toISOString().slice(2,10).replace(/-/g,'')+'-'+Math.random().toString(36).slice(2,6).toUpperCase(),created:new Date().toISOString(),source:'manual',payment:{status:order.payment_status||'Invoiced'},stage:'Received',history:[{at:new Date().toISOString(),text:'Created manually in CRM'}],files:[]};o.customer_key=crmKey(o);O.push(o);return later({order:o})},
      fileUrl:(o,f)=>{const x=find(o.id);return Promise.resolve(x&&x._demoFiles&&x._demoFiles[f]||null)},hasFile:(o,f)=>(o.files||[]).includes(f)};
  };
  const csvCell=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
  window.crmCSV=(rows,name)=>{const ks=Object.keys(rows[0]||{});const t=[ks.join(','),...rows.map(r=>ks.map(k=>csvCell(r[k])).join(','))].join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:'text/csv'}));a.download=name;a.click()};
})();
