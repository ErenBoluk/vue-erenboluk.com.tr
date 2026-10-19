const { chromium } = require('playwright-core');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('node:fs');
const path = require('node:path');
const base=process.env.AURA_BASE_URL||'http://127.0.0.1:5174';
const out=process.env.AURA_REPORT_DIR||path.resolve('docs/aura/review');
const capture=process.argv.includes('--screenshots');
const results=[];
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.AURA_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
 try{
 for(const width of [320,390,768,1440])for(const lang of ['en','tr'])for(const route of ['','about','portfolio','hireme']){
  const context=await browser.newContext({viewport:{width,height:width<768?844:1000},reducedMotion:'reduce'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const name=lang+'-'+(route||'home')+'-'+width;
  try{
   await page.goto(base+'/'+lang+(route?'/'+route:''));await page.locator('h1').first().waitFor();await page.waitForFunction(()=>{const main=document.querySelector('main');return main&&Number(getComputedStyle(main).opacity)===1});await page.evaluate(()=>document.fonts.ready);
   const geometry=await page.evaluate(()=>({bodyOverflow:document.documentElement.scrollWidth>innerWidth+1,lang:document.documentElement.lang,heading:[...document.querySelectorAll('h1')].filter(e=>e.getClientRects().length).length,scrollRoot:!!document.querySelector('[data-aura-scroll]'),invisibleText:[...document.querySelectorAll('h1,p')].filter(e=>e.getClientRects().length&&getComputedStyle(e).opacity==='0').length}));
   const entry={name,...geometry,errors};
   if(width===390||width===1440){const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();entry.violations=axe.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));}
   if(capture&&(width===390||width===1440))await page.evaluate(()=>Promise.all([...document.querySelectorAll('main img')].filter(img=>img.getBoundingClientRect().top<innerHeight&&img.getBoundingClientRect().bottom>0).map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.addEventListener('load',resolve,{once:true});img.addEventListener('error',resolve,{once:true});setTimeout(resolve,4000)}))));if(capture&&(width===390||width===1440))await page.screenshot({path:path.join(out,name+'.png'),animations:'disabled'});
   entry.pass=!entry.bodyOverflow&&entry.lang===lang&&entry.heading===1&&entry.scrollRoot&&entry.invisibleText===0&&errors.length===0&&!(entry.violations||[]).length;
   results.push(entry);console.log((entry.pass?'PASS ':'FAIL ')+name+(entry.violations?.length?' axe:'+entry.violations.map(x=>x.id).join(','):''));
  }catch(e){results.push({name,pass:false,error:e.message});console.log('FAIL '+name+': '+e.message)}finally{await context.close()}
 }
 }finally{await browser.close();fs.writeFileSync(path.join(out,'responsive-accessibility.json'),JSON.stringify(results,null,2));}
 if(results.some(r=>!r.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});