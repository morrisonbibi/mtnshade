// Builds dist/ from src/: inlines the design-system CSS and every local script into each page,
// rewrites ../../assets/ → assets/, and copies assets. No dependencies. Netlify runs this on every deploy.
import {readFileSync as r,writeFileSync as w,mkdirSync,cpSync,rmSync} from 'node:fs';
import {join} from 'node:path';
const SRC='src',APP='src/ui_kits/mug-customizer',OUT='dist',PAGES=['index.html','crm.html'];
rmSync(OUT,{recursive:true,force:true});mkdirSync(OUT,{recursive:true});
let css='';for(const m of r(join(SRC,'styles.css'),'utf8').matchAll(/@import url\("([^"]+)"\)/g))css+=r(join(SRC,m[1]),'utf8')+'\n';
const fonts=[...css.matchAll(/@import url\("([^"]+)"\);?/g)].map(m=>m[1]);css=css.replace(/@import url\("[^"]+"\);?/g,'');
const esc=s=>s.replace(/<\/script/gi,'<\\/script');const fix=s=>s.split('../../assets/').join('assets/');
for(const page of PAGES){
  let h=r(join(APP,page),'utf8').replace(/<template id="__bundler_thumbnail">[\s\S]*?<\/template>/,'');
  h=h.replace('<link rel="stylesheet" href="../../styles.css">',()=>fonts.map(u=>'<link rel="stylesheet" href="'+u+'">').join('')+'<style>'+css+'</style>');
  h=h.replace(/<script( type="text\/babel")? src="(?!https?:)([^"]+)"><\/script>/g,(_,t,src)=>{const p=src.startsWith('../../')?join(SRC,src.slice(6)):join(APP,src);return '<script'+(t||'')+'>'+esc(fix(r(p,'utf8')))+'</script>'});
  w(join(OUT,page),fix(h));console.log('built',page,(h.length/1024|0)+'KB');
}
cpSync(join(SRC,'assets'),join(OUT,'assets'),{recursive:true});
