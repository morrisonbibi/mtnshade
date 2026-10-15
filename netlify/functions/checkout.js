// Creates a Stripe Checkout Session with exact totals. Needs env var STRIPE_SECRET_KEY (Netlify → Site settings → Environment variables).
// ⚠ Keep these numbers in sync with ui_kits/mug-customizer/mc-config.js — the server is the source of truth for what gets charged.
const C={carton:36,standard:12,custom:13.5,moq:300,standardColors:['#2141a8','#c8102e'],sample:{standard:100,custom:100},pack:{perUnit:1,cap:250},countries:['US','CA']};
const isCustom=h=>!C.standardColors.includes(String(h||'').toLowerCase());
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Math.floor(+n||0)));
const clean=s=>String(s||'').replace(/[^\w\s#·×.,'&()-]/g,'').slice(0,120);
exports.handler=async e=>{
  if(e.httpMethod!=='POST')return {statusCode:405,body:'POST only'};
  if(!process.env.STRIPE_SECRET_KEY)return {statusCode:500,body:JSON.stringify({error:'STRIPE_SECRET_KEY not set'})};
  let b;try{b=JSON.parse(e.body||'{}')}catch(_){return {statusCode:400,body:'bad json'}}
  const orderId=/^MS-\d{6}-[A-Z0-9]{4}$/.test(b.orderId)?b.orderId:'MS-UNKNOWN';
  const items=[];
  if(b.kind==='sample'){
    const custom=isCustom(b.hold);items.push({name:'Sample Crimp Mug — '+clean(b.holdName)+' hold'+(custom?' (custom color)':''),cents:(custom?C.sample.custom:C.sample.standard)*100,qty:clamp(b.qty,1,5)});
  }else{
    let units=0;
    for(const l of (b.lines||[]).slice(0,12)){const custom=isCustom(l.hold);const k=C.carton,raw=clamp(l.units!=null?l.units:(+l.cartons||1)*k,0,3564);let u;if(!custom)u=Math.max(k,Math.ceil(raw/k)*k);else{const f=Math.ceil(C.moq/k)*k;u=raw<=C.moq?C.moq:raw<=f?f:f+Math.ceil((raw-f)/k)*k}units+=u;
      items.push({name:'Custom Crimp Mug — '+clean(l.name)+' hold',cents:Math.round((custom?C.custom:C.standard)*100),qty:u})}
    if(!items.length)return {statusCode:400,body:JSON.stringify({error:'empty order'})};
    if(b.packCustom)items.push({name:'Custom packaging design (one-time)',cents:Math.min(units*C.pack.perUnit,C.pack.cap)*100,qty:1});
  }
  let ru;try{ru=new URL(b.returnUrl||'')}catch(_){ru=null}
  const okHost=ru&&ru.protocol==='https:'&&(/(^|\.)mtnshade\.com$/.test(ru.hostname)||/\.netlify\.app$/.test(ru.hostname));
  const site=okHost?ru.origin:(process.env.PUBLIC_URL||process.env.URL||('https://'+e.headers.host));if(okHost)b.returnPath=ru.pathname;const path=/^\/[\w\-./%]*$/.test(b.returnPath||'')?b.returnPath:'/';
  const p=new URLSearchParams({mode:'payment',client_reference_id:orderId,success_url:site+path+'?paid='+orderId+'&session_id={CHECKOUT_SESSION_ID}',cancel_url:site+path+'?canceled='+orderId,'phone_number_collection[enabled]':'true','billing_address_collection':'required','metadata[order_id]':orderId,'metadata[gym]':clean(b.gym),'metadata[kind]':b.kind==='sample'?'sample':'bulk','payment_intent_data[metadata][order_id]':orderId,'payment_intent_data[description]':'MTNShade '+orderId+' · '+clean(b.gym)});
  if(/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.email||''))p.set('customer_email',b.email);
  C.countries.forEach((c,i)=>p.set('shipping_address_collection[allowed_countries]['+i+']',c));
  items.forEach((it,i)=>{const k='line_items['+i+']';p.set(k+'[quantity]',it.qty);p.set(k+'[price_data][currency]','usd');p.set(k+'[price_data][unit_amount]',it.cents);p.set(k+'[price_data][product_data][name]',it.name)});
  const r=await fetch('https://api.stripe.com/v1/checkout/sessions',{method:'POST',headers:{Authorization:'Bearer '+process.env.STRIPE_SECRET_KEY,'Content-Type':'application/x-www-form-urlencoded'},body:p});
  const j=await r.json();
  if(!r.ok)return {statusCode:502,body:JSON.stringify({error:(j.error&&j.error.message)||'stripe error'})};
  return {statusCode:200,headers:{'Content-Type':'application/json'},body:JSON.stringify({url:j.url,id:j.id})};
};
