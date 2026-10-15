// Order capture (Formspree), Stripe checkout hand-off, and outreach attribution.
(function(){
  var C=window.MC_CONFIG,AK='mtnshade-attribution-v1';
  // First-touch attribution from outreach links: ?utm_source=&utm_campaign=&gym=&name=&email=
  var q=new URLSearchParams(location.search),keys=['utm_source','utm_medium','utm_campaign','utm_content','gym','name','email'],hit={};
  keys.forEach(function(k){if(q.get(k))hit[k]=q.get(k)});
  var saved={};try{saved=JSON.parse(localStorage.getItem(AK))||{}}catch(e){}
  if(Object.keys(hit).length){saved=Object.assign({},hit.utm_campaign?{}:saved,hit,{landed:new Date().toISOString()});try{localStorage.setItem(AK,JSON.stringify(saved))}catch(e){}}
  window.mcAttribution=function(){return saved};
  window.mcOrderId=function(){var d=new Date(),p=function(n){return String(n).padStart(2,'0')},r=Math.random().toString(36).slice(2,6).toUpperCase();return 'MS-'+String(d.getFullYear()).slice(2)+p(d.getMonth()+1)+p(d.getDate())+'-'+r};
  function blob(dataUrl){try{var a=dataUrl.split(','),m=a[0].match(/:(.*?);/)[1],b=atob(a[1]),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return new Blob([u],{type:m})}catch(e){return null}}
  function body(fields,files){var fd=new FormData();Object.keys(fields).forEach(function(k){if(fields[k]!==undefined&&fields[k]!==null)fd.append(k,fields[k])});(files||[]).forEach(function(f){var b=f.src&&blob(f.src);if(b)fd.append(f.field,b,f.name)});return fd}
  // POST to Formspree. File uploads need a paid Formspree plan — if rejected, retries without files.
  window.mcSubmit=function(fields,files){
    var a=saved,f=Object.assign({utm_source:a.utm_source||'',utm_medium:a.utm_medium||'',utm_campaign:a.utm_campaign||'(direct)',utm_content:a.utm_content||'',submitted_from:location.href.split('?')[0]},fields);
    var post=function(withFiles){return fetch(C.formspree,{method:'POST',headers:{Accept:'application/json'},body:body(f,withFiles?files:[])})};
    return post(true).then(function(r){if(r.ok||!(files&&files.length))return r;return post(false)}).then(function(r){if(!r.ok)throw new Error('Formspree '+r.status);return r.json()});
  };
  // Saves the full order + images to the CRM backend (Netlify Blobs). Never blocks checkout if it fails.
  window.mcSaveOrder=function(order,files){
    var post=function(p,b){return fetch('api/'+p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)})};
    return post('order',order).then(function(r){if(!r.ok)throw new Error('crm '+r.status);
      return Promise.all((files||[]).filter(function(f){return f.src&&/^data:image\//.test(f.src)&&f.src.length<7.3e6}).map(function(f){return post('order-file',{id:order.id,field:f.field,name:f.name,dataUrl:f.src}).catch(function(){})}))})
      .then(function(){return true},function(){return false});
  };
  window.mcLinkPayment=function(id,sid){if(!id||!sid)return Promise.resolve();return fetch('api/payment',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:id,session_id:sid})}).catch(function(){})};
  // Asks the serverless function for a Stripe Checkout URL (prices are recomputed server-side).
  window.mcCheckout=function(payload){
    return fetch(C.checkoutEndpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({returnPath:location.pathname,returnUrl:location.origin+location.pathname},payload))})
      .then(function(r){return r.ok?r.json():Promise.reject(new Error('checkout '+r.status))}).then(function(j){if(!j.url)throw new Error(j.error||'no url');return window.mcLinkPayment(payload.orderId,j.id).then(function(){return j.url})});
  };
})();
