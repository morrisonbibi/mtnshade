// PUBLIC: uploads one image for a just-created order (logo, renders, dieline). Only within 3h of the order being created.
const L=require('../lib/crm.js');
const FIELDS=['logo','lid_logo','mug','box','dieline'];
exports.handler=async e=>{
  if(e.httpMethod!=='POST')return L.res({error:'POST only'},405);L.connectLambda(e);
  const b=L.body(e);if(!b||!L.ID.test(b.id||'')||!FIELDS.includes(b.field))return L.res({error:'bad field'},400);
  const o=await L.orderStore().get(b.id,{type:'json'});if(!o)return L.res({error:'no order'},404);
  if(Date.now()-new Date(o.created).getTime()>3*3600e3)return L.res({error:'too late'},403);
  const m=/^data:(image\/[\w.+-]+);base64,(.+)$/.exec(b.dataUrl||'');if(!m)return L.res({error:'not an image'},400);
  const buf=Buffer.from(m[2],'base64');if(buf.length>5.5e6)return L.res({error:'file too large'},413);
  await L.fileStore().set(b.id+'/'+b.field,L.toBuf(buf),{metadata:{type:m[1],name:String(b.name||b.field).slice(0,120),size:buf.length}});
  return L.res({ok:true});
};
