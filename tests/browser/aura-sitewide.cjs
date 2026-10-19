const {chromium}=require('playwright-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const base=process.env.AURA_BASE_URL||'http://localhost:5175';
const copy=JSON.parse(fs.readFileSync('src/localize/langs/en.json','utf8'));
(async()=>{const browser=await chromium.launch({executablePath:process.env.AURA_CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/en/portfolio');await page.locator('.project-card').first().waitFor();
 for(const mode of ['list','showcase']){
  await page.locator('.view-switch').getByRole('button',{name:copy.portfolio.view_modes[mode],exact:true}).click();
  for(const category of ['all','backend','mobile','web']){
   await page.locator('.project-filters').getByRole('button',{name:new RegExp(copy.portfolio.filters[category].replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))}).click();
   const expected=copy.portfolio.projects.filter(p=>category==='all'||p.category===category);
   await page.waitForFunction(n=>document.querySelectorAll('.project-card').length===n,expected.length);
   assert.deepEqual(await page.locator('.project-card h2').allTextContents(),expected.map(p=>p.title));
   const trigger=page.locator('.project-card').first().getByRole('button',{name:/view details/i});await trigger.click();const dialog=page.getByRole('dialog');await dialog.waitFor();assert.equal(await dialog.getByRole('heading',{name:expected[0].title,exact:true}).count(),1);await page.keyboard.press('Tab');assert.equal(await dialog.evaluate(e=>e.contains(document.activeElement)),true);await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});assert.equal(await trigger.evaluate(e=>e===document.activeElement),true);
  }
 }
 console.log('PASS both portfolio modes, all four filters, exact project inventories and dialog focus');
 await page.locator('.project-filters').getByRole('button',{name:/All/}).click();const trigger=page.locator('.project-card').first().getByRole('button',{name:/view details/i});await trigger.click();await page.locator('.project-filters button').nth(2).evaluate(e=>e.click());await page.getByRole('dialog').waitFor({state:'hidden'});assert.equal(await page.locator('#portfolio-heading').evaluate(e=>e===document.activeElement),true);console.log('PASS removed dialog trigger falls back to portfolio heading');
 for(const route of ['about','hireme','portfolio','home']){await page.locator('.navigation-links').getByRole('link',{name:copy.sidebar[route],exact:true}).click();await page.waitForURL(new RegExp('/en'+(route==='home'?'':'/'+route)+'$'));}
 await page.locator('.graphite-hero').waitFor();assert.deepEqual(errors,[]);console.log('PASS repeated route changes without runtime errors');await page.close();
 const touch=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});await touch.goto(base+'/tr/about');await touch.locator('h1').waitFor();const toggle=touch.getByRole('button',{name:'Gezinmeyi a\u00e7',exact:true});await toggle.click();const drawer=touch.getByRole('dialog');await drawer.waitFor();await touch.keyboard.press('Shift+Tab');assert.equal(await drawer.evaluate(e=>e.contains(document.activeElement)),true);await drawer.getByRole('link',{name:'Portf\u00f6y\u00fcm',exact:true}).click();await touch.waitForURL(/\/tr\/portfolio$/);assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert.equal(await touch.locator('[data-aura-cursor]').isVisible(),false);console.log('PASS touch drawer, focus containment, route close and no pointer follower');await touch.close();
 for(const lang of ['en','tr'])for(const route of ['home','about','portfolio','hireme']){const p=await browser.newPage({viewport:{width:720,height:500},reducedMotion:'reduce'});await p.goto(base+'/'+lang+(route==='home'?'':'/'+route));await p.locator('main h1').waitFor();const data=JSON.parse(fs.readFileSync('src/localize/langs/'+lang+'.json','utf8'));assert.equal(await p.title(),data.seo[route].title);assert.equal(await p.locator('meta[name=description]').getAttribute('content'),data.seo[route].description);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.match(await p.locator('link[hreflang=tr]').getAttribute('href'),new RegExp('/tr'+(route==='home'?'/':'/'+route)+'$'));await p.close();}console.log('PASS eight localized metadata/deep routes and effective 200%-zoom viewport (720px)');
}finally{await browser.close()}})().catch(error=>{console.error(error);process.exitCode=1});
