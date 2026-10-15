// PUBLIC: the studio posts every order / sample / quote here. Creates the order once; never lets the public overwrite it.
const L=require('../lib/crm.js');
exports.handler=async e=>{
  if(e.httpMethod!=='POST')return L.res({error:'POST only'},405);L.connectLambda(e);
  const b=L.body(e);if(!b||!L.ID.test(b.id||''))return L.res({error:'bad input'},400);
  if(JSON.stringify(b).length>60000)return L.res({error:'too big'},413);
  ['payment','stage','history','ship','internal_notes','archived','created','geo_ip'].forEach(k=>delete b[k]);
  const st=L.orderStore();if(await st.get(b.id))return L.res({ok:true,existing:true});
  const g=L.geo(e);const quote=b.type==='quote_request';
  const o=Object.assign({},b,{created:L.now(),customer_key:L.customerKey(b),
    geo_ip:{city:g.city||'',region:(g.subdivision&&(g.subdivision.code||g.subdivision.name))||'',country:(g.country&&g.country.code)||'',lat:g.latitude||null,lng:g.longitude||null},
    payment:{status:quote?'Quote':'Awaiting payment'},stage:quote?'Quote':'Received',
    history:[{at:L.now(),text:(quote?'Quote request':b.type==='sample_order'?'Sample order':'Bulk order')+' submitted from studio'}]});
  await st.setJSON(o.id,o);return L.res({ok:true});
};
