// Shared helpers for the Mug CRM backend (Netlify Functions + Netlify Blobs — no extra accounts needed).
const {getStore,connectLambda}=require('@netlify/blobs');
const store=name=>getStore({name});
const orderStore=()=>store('mug-orders'),fileStore=()=>store('mug-order-files'),customerStore=()=>store('mug-customers');
const ID=/^MS-\d{6}-[A-Z0-9]{4}$/;
const res=(o,s)=>({statusCode:s||200,headers:{'content-type':'application/json','cache-control':'no-store'},body:JSON.stringify(o)});
const now=()=>new Date().toISOString();
const body=e=>{try{return JSON.parse(e.isBase64Encoded?Buffer.from(e.body||'','base64').toString('utf8'):(e.body||'{}'))}catch(_){return null}};
const geo=e=>{try{return JSON.parse(Buffer.from(e.headers['x-nf-geo']||'','base64').toString('utf8'))}catch(_){return {}}};
const slug=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80);
// One customer per gym (several staff can order for the same gym); falls back to email.
const customerKey=o=>{const c=o.contact||{};const g=slug(c.gym);if(g)return 'gym-'+g;const m=slug(c.email);return m?'em-'+m:'unknown'};
const toBuf=b=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);
// Pulls a Checkout Session from Stripe; returns fields to merge into the order, or null if nothing changed.
async function syncStripe(o,sid){
  sid=sid||(o.payment&&o.payment.session);const key=process.env.STRIPE_SECRET_KEY;if(!sid||!key)return null;
  const r=await fetch('https://api.stripe.com/v1/checkout/sessions/'+encodeURIComponent(sid),{headers:{Authorization:'Bearer '+key}});if(!r.ok)return null;
  const s=await r.json();if(s.client_reference_id!==o.id)return null;
  const prev=o.payment||{};const pay=Object.assign({},prev,{session:sid});const out={payment:pay};
  if(s.payment_status==='paid'&&prev.status!=='Paid'){
    pay.status='Paid';pay.amount=(s.amount_total||0)/100;pay.paid_at=now();pay.intent=s.payment_intent||'';
    const sd=s.shipping_details||(s.collected_information&&s.collected_information.shipping_details)||{};const cd=s.customer_details||{};
    out.ship={name:sd.name||cd.name||'',address:sd.address||cd.address||{}};
    out.contact=Object.assign({},o.contact||{},{phone:cd.phone||(o.contact||{}).phone||'',billing_name:cd.name||''});
    out.history=(o.history||[]).concat([{at:now(),text:'Paid via Stripe · $'+pay.amount}]);
  }
  return pay.status!==prev.status||pay.session!==prev.session?out:null;
}
module.exports={connectLambda,orderStore,fileStore,customerStore,ID,res,now,body,geo,customerKey,toBuf,syncStripe};
