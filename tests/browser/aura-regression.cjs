/* Run with NODE_PATH pointing to isolated browser tools; see validation documentation. */
const { chromium } = require('playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.AURA_BASE_URL || 'http://127.0.0.1:5174';
const group = process.argv[2] || 'all';
const browserPath = process.env.AURA_CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const results = [];
let browser;
async function test(name, fn) {
  try { await fn(); results.push({name, status:'pass'}); console.log('PASS ' + name); }
  catch (error) { results.push({name,status:'fail',error:error.message}); console.log('FAIL ' + name + ': ' + error.message); }
}
async function pageAt(route, opts={}) {
  const context = await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',...opts});
  const page=await context.newPage();page.setDefaultTimeout(7000);
  await page.goto(base+route); await page.locator('h1').first().waitFor();
  return {page,context};
}
(async()=>{
  browser=await chromium.launch({executablePath:browserPath,headless:true});
  if(group==='controls'||group==='all') {
    await test('explicit Turkish deep route wins over saved English preference', async()=>{
      const context=await browser.newContext();
      try{await context.addInitScript(()=>localStorage.setItem('user-locale','en'));const page=await context.newPage();await page.goto(base+'/tr/about');await page.locator('h1').first().waitFor();assert.equal(await page.locator('html').getAttribute('lang'),'tr');assert.match(page.url(),/\/tr\/about$/);}finally{await context.close();}
    });
    await test('mobile drawer is named, closed links unfocusable, Escape returns focus',async()=>{
      const {page,context}=await pageAt('/en',{viewport:{width:390,height:844}});
      try{
        const toggle=page.getByRole('button',{name:/open.*(menu|navigation)|menu.*open/i});
        assert.equal(await toggle.count(),1,'mobile toggle needs an accessible open-menu name');
        const hiddenLinks=await page.locator('aside a').evaluateAll(els=>els.filter(el=>!el.closest('[inert]')&&getComputedStyle(el).visibility!=='hidden'&&el.getClientRects().length>0&&el.tabIndex>=0).length);
        assert.equal(hiddenLinks,0,'closed drawer leaves keyboard-focusable links');
        await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'true');
        await page.keyboard.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');assert.equal(await toggle.evaluate(el=>el===document.activeElement),true);
      } finally{await context.close();}
    });
    await test('CV dialog has named semantics, keyboard dismissal and actual PDFs on deep routes',async()=>{
      const {page,context}=await pageAt('/en/about');
      try{
        await page.getByRole('button',{name:/download cv/i}).first().click();
        const dialog=page.getByRole('dialog');assert.equal(await dialog.count(),1,'CV modal needs dialog semantics');await dialog.waitFor();
        assert.ok(await dialog.getAttribute('aria-labelledby')||await dialog.getAttribute('aria-label'),'dialog needs accessible name');
        await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});
        const requests=[];page.on('request',r=>{if(r.url().includes('.pdf'))requests.push(r.url())});
        await page.getByRole('button',{name:/download cv/i}).first().click();
        const download=page.waitForEvent('download');await page.getByRole('button',{name:/english|download.*en/i}).last().click();await download;
        assert.ok(requests.some(url=>url.endsWith('/assets/cv/cv-english.pdf')&&!url.includes('/en/assets/')),'PDF URL must resolve at configured base');
      }finally{await context.close();}
    });
  }
  if(group==='home'||group==='all') {
    await test('Home hire action retains Turkish route',async()=>{
      const {page,context}=await pageAt('/tr');try{await page.locator('#hire-me-button').click();await page.waitForURL(/\/tr\/hireme$/);}finally{await context.close();}
    });
    await test('clipboard rejection never announces false success',async()=>{
      const {page,context}=await pageAt('/en');try{await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(new Error('denied'))},configurable:true}));await page.locator('#copy-email-button').click();await page.waitForTimeout(150);assert.doesNotMatch(await page.locator('#copy-email-button').innerText(),/copied/i);assert.equal(await page.getByRole('status').filter({hasText:'Could not copy the email address.'}).count(),1,'clipboard failure needs truthful Home feedback');}finally{await context.close();}
    });
  }
  if(group==='contact'||group==='all') {
    await test('contact labels name fields and mocked failure preserves retry',async()=>{
      const {page,context}=await pageAt('/en/hireme');try{
        const name=page.getByRole('textbox',{name:/name/i});assert.equal(await name.count(),1,'Name field requires associated visible label');
        await name.fill('AURA local test');await page.getByRole('textbox',{name:/email/i}).fill('test@example.invalid');await page.getByRole('textbox',{name:/message/i}).fill('Local intercepted test. Never sent.');
        let calls=0;await page.route('**/api/hire',r=>{calls++;return r.fulfill({status:500,contentType:'application/json',body:'{}'})});
        page.on('dialog',d=>d.dismiss());await page.locator('form button[type=submit]').click();await page.waitForTimeout(200);assert.equal(calls,1);assert.equal(await page.locator('form button[type=submit]').isEnabled(),true);assert.equal(await name.inputValue(),'AURA local test');
      }finally{await context.close();}
    });
  }
  if(group==='portfolio'||group==='all') {
    await test('portfolio detail dialog has focus semantics and Escape returns to trigger',async()=>{
      const {page,context}=await pageAt('/en/portfolio');try{
        const detail=page.getByRole('button',{name:/detail|view project/i}).first();
        await detail.click();const dialog=page.getByRole('dialog');assert.equal(await dialog.count(),1,'project detail needs dialog semantics');
        await dialog.waitFor();assert.equal(await dialog.evaluate(el=>el.contains(document.activeElement)),true,'dialog must receive focus');
        await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});assert.equal(await detail.evaluate(el=>el===document.activeElement),true,'dialog must return focus to trigger');
      }finally{await context.close();}
    });
  }
  if(group==='shell'||group==='all') {
    await test('route navigation starts the persistent scroll region at the top',async()=>{
      const {page,context}=await pageAt('/en/portfolio');try{
        const scroller=page.locator('[data-aura-scroll]');await scroller.evaluate(el=>el.scrollTop=600);assert.ok(await scroller.evaluate(el=>el.scrollTop)>100,'fixture needs scrollable portfolio');
        await page.getByRole('link',{name:'About',exact:true}).click();await page.waitForURL(/\/en\/about$/);await page.locator('h1').waitFor();assert.equal(await scroller.evaluate(el=>el.scrollTop),0,'new route should start at top');
      }finally{await context.close();}
    });
  }
  if(group==='motion'||group==='all') {
    await test('global cursor respects reduced motion initially and when changed live',async()=>{
      const {page,context}=await pageAt('/en',{reducedMotion:'reduce'});try{
        await page.mouse.move(600,400);await page.waitForTimeout(220);
        const visibleFollower=()=>page.locator('[data-aura-cursor],.cursor-dot,.cursor-outline').evaluateAll(els=>els.some(el=>{const s=getComputedStyle(el);return s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>.01&&el.getClientRects().length>0}));
        assert.equal(await visibleFollower(),false,'reduced-motion users must not get a follower');
        await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));await page.mouse.move(650,420);await page.waitForTimeout(240);
        assert.equal(await visibleFollower(),true,'eligible fine pointer should get the refined global alternative');
        await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(50);assert.equal(await visibleFollower(),false,'live preference change must hide follower');
        const invisible=await page.locator('h1,p').evaluateAll(els=>els.some(el=>el.getClientRects().length&&getComputedStyle(el).opacity==='0'));assert.equal(invisible,false,'reduced-motion content remains visible');
      }finally{await context.close();}
    });
  }
  if(group==='contact-states'||group==='all') {
    await test('mocked contact success keeps payload, duplicate guard and reset',async()=>{
      const {page,context}=await pageAt('/en/hireme');try{
        const copy=JSON.parse(fs.readFileSync(path.resolve('src/localize/langs/en.json'),'utf8')).hireme;
        let count=0,payload;await page.route('**/api/hire',async r=>{count++;payload=r.request().postDataJSON();await new Promise(resolve=>setTimeout(resolve,200));await r.fulfill({status:200,contentType:'application/json',body:'{}'})});
        await page.locator('input[type=text]').fill('AURA local test');await page.locator('input[type=email]').fill('test@example.invalid');await page.locator('textarea').fill('Intercepted only');
        await page.locator('form button[type=submit]').evaluate(el=>{el.click();el.click()});await page.getByText(copy.success_title,{exact:true}).waitFor();assert.equal(count,1);assert.deepEqual(payload,{name:'AURA local test',email:'test@example.invalid',message:'Intercepted only'});
        await page.getByRole('button',{name:copy.send_another||copy.reset||copy.send_again||/another|again|new message/i}).click();await page.locator('form').waitFor();assert.equal(await page.locator('textarea').inputValue(),'');
      }finally{await context.close();}
    });
    await test('mocked 429 persists cooldown across refresh then expires',async()=>{
      const {page,context}=await pageAt('/en/hireme');try{
        await page.route('**/api/hire',r=>r.fulfill({status:429,contentType:'application/json',body:JSON.stringify({retryAfterMs:2200})}));
        await page.locator('input[type=text]').fill('AURA local test');await page.locator('input[type=email]').fill('test@example.invalid');await page.locator('textarea').fill('Intercepted only');await page.locator('form button[type=submit]').click();
        await page.waitForFunction(()=>Number(localStorage.getItem('hireMeTimeoutUntil'))>Date.now());await page.reload();await page.locator('h1').waitFor();assert.ok(await page.evaluate(()=>Number(localStorage.getItem('hireMeTimeoutUntil'))>Date.now()));
        await page.waitForFunction(()=>!localStorage.getItem('hireMeTimeoutUntil'),{},{timeout:6000});
      }finally{await context.close();}
    });
  }
  if(group==='cv-focus'||group==='all') {
    await test('selecting a CV returns focus to its opener during a delayed request',async()=>{
      const {page,context}=await pageAt('/en/about');let release;
      try{
        await page.route('**/*.pdf',async r=>{await new Promise(resolve=>release=resolve);await r.fulfill({status:404,body:'not found'})});
        const opener=page.locator('.cv-control > button').first();await opener.click();await page.getByRole('button',{name:/download english cv/i}).click();
        await page.waitForTimeout(100);assert.equal(await opener.evaluate(el=>el===document.activeElement),true,'download selection must not strand focus on body');
      }finally{release?.();await context.close();}
    });
  }
  await browser.close();
  const reportDir=process.env.AURA_REPORT_DIR;
  if(reportDir){fs.mkdirSync(reportDir,{recursive:true});fs.writeFileSync(path.join(reportDir,'browser-'+group+'.json'),JSON.stringify(results,null,2));}
  if(results.some(r=>r.status==='fail'))process.exitCode=1;
})().catch(async e=>{console.error(e);if(browser)await browser.close();process.exitCode=1;});