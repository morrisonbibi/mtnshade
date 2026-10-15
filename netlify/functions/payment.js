// PUBLIC: links a Stripe Checkout Session to an order and records payment. Verified with Stripe, never trusted from the browser.
const L=require('../lib/crm.js');
exports.handler=async e=>{
  if(e.httpMethod!=='POST')return L.res({error:'POST only'},405);L.connectLambda(e);
  const b=L.body(e);if(!b||!L.ID.test(b.id||'')||!/^cs_\w+$/.test(b.session_id||''))return L.res({error:'bad input'},400);
  const st=L.orderStore();const o=await st.get(b.id,{type:'json'});if(!o)return L.res({error:'no order'},404);
  const u=await L.syncStripe(o,b.session_id);if(u){Object.assign(o,u);await st.setJSON(o.id,o)}
  return L.res({ok:true,status:(o.payment||{}).status});
};
