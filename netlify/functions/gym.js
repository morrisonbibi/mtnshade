// PUBLIC: private mockup pages at /g/<slug>.
// GET  ?slug=goat               → {exists:true|false}   (never reveals the gym name or design)
// POST {slug, password}         → the gym's mockup config + logo (data URL) when the password matches; logs the view for the CRM.
const L=require('../lib/crm.js'),P=require('../lib/prospects.js');
exports.handler=async e=>{
  L.connectLambda(e);
  if(e.httpMethod==='GET'){const s=((e.queryStringParameters||{}).slug||'').toLowerCase();return L.res({exists:!!(await P.getProspect(s))})}
  if(e.httpMethod!=='POST')return L.res({error:'GET or POST'},405);
  const b=L.body(e)||{};const slug=String(b.slug||'').toLowerCase();
  const p=await P.getProspect(slug);if(!p)return L.res({error:'not found'},404);
  if(!P.pwOk(p,b.password))return L.res({error:'Wrong password'},401);
  // Views from Morrison's own browser (anyone who has signed into the CRM on that device) aren't counted.
  if(!b.owner)await P.logView(slug,L.geo(e)).catch(()=>{});
  const logo=await P.getLogo(p);
  return L.res({ok:true,gym:Object.assign(P.publicView(p),{logo})});
};
