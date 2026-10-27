// Business rules for the Custom Mug Studio. Edit here — UI reads everything from this object.
window.MC_CONFIG={
  carton:36, // units per carton; bulk orders are whole cartons
  pricing:{standard:12,custom:13.5}, // $ per mug
  customMOQ:200, // minimum units per custom (non MTNShade Blue/Red) color
  standardColors:['#2141A8','#C8102E'], // MTNShade Blue / Red — anything else is a custom color
  sample:{standard:100,custom:100,weeks:2,customExtraWeeks:2},
  production:{weeks:[10,12],customExtraWeeks:2},
  customPackaging:{perUnit:1,cap:250}, // one-time fee for a fully custom box: $1/unit or $250, whichever is lower
  retailDefault:25, // recommended front-desk price
  amazon:[{label:'Blue',hold:'#2141A8',url:'https://www.amazon.com/dp/B0CK2W7TL8?th=1'},{label:'Red',hold:'#C8102E',url:'https://www.amazon.com/dp/B0CK2RZZPX?th=1'}], // ⚠ confirm which ASIN is which color
  contactEmail:'morrisonbibi17@gmail.com',
  formspree:'https://formspree.io/f/xqpedoyo', // every order, quote and sample request lands here
  checkoutEndpoint:'api/checkout', // Stripe Checkout — see DEPLOY.md. Prices are mirrored in netlify/functions/checkout.js
  stages:['Received','Proof sent','Approved','In production','Shipped','Delivered','Canceled']
};
window.mcIsCustom=hex=>!window.MC_CONFIG.standardColors.map(c=>c.toLowerCase()).includes((hex||'').toLowerCase());
window.mcUnitPrice=hex=>window.mcIsCustom(hex)?window.MC_CONFIG.pricing.custom:window.MC_CONFIG.pricing.standard;
window.mcMinCartons=hex=>window.mcIsCustom(hex)?Math.ceil(window.MC_CONFIG.customMOQ/window.MC_CONFIG.carton):1;
// Quantities: standard colors in cartons of 36. Custom colors: 200 MOQ → 216 → then +36.
window.mcSnap=(hex,u)=>{const C=window.MC_CONFIG,k=C.carton,m=C.customMOQ;u=Math.max(0,Math.round(+u||0));if(!window.mcIsCustom(hex))return Math.max(k,Math.ceil(u/k)*k);if(u<=m)return m;const f=Math.ceil(m/k)*k;return u<=f?f:f+Math.ceil((u-f)/k)*k};
window.mcMinUnits=hex=>window.mcSnap(hex,0);
window.mcUnits=l=>l.units!=null?l.units:(l.cartons||1)*window.MC_CONFIG.carton;
window.mcStepUnits=(hex,u,dir)=>{const k=window.MC_CONFIG.carton,min=window.mcMinUnits(hex);if(dir>0)return window.mcSnap(hex,u+1);if(u<=min)return 0;const f=Math.ceil(min/k)*k;return u<=f?min:u-k};
window.mcCartons=u=>Math.ceil(u/window.MC_CONFIG.carton);
window.mcWeeks=custom=>{const p=window.MC_CONFIG.production;const e=custom?p.customExtraWeeks:0;return [p.weeks[0]+e,p.weeks[1]+e]};
window.mcMoney=n=>'$'+(Math.round(n*100)/100).toLocaleString(undefined,{minimumFractionDigits:Number.isInteger(Math.round(n*100)/100)?0:2,maximumFractionDigits:2});
window.mcPackFee=units=>Math.min(units*window.MC_CONFIG.customPackaging.perUnit,window.MC_CONFIG.customPackaging.cap);
