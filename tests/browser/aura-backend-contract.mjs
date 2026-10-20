// Browser -> real hardening service -> mocked Resend. No live provider calls.
import {createRequire} from 'node:module'
import assert from 'node:assert/strict'
import {readConfig} from '../../backend-hireme/security.ts'
import {createHireService} from '../../backend-hireme/hire-service.ts'
const require=createRequire(import.meta.url),{chromium}=require('playwright-core')
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true})
try{
 for(const scenario of ['success','validation','provider-error-and-rate-limit']){
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),deliveries=[]
  const service=createHireService(readConfig({RESEND_API_KEY:'audit-placeholder',RATE_LIMIT_MAX:scenario==='provider-error-and-rate-limit'?'1':'2'}),{
   fetch:async(_url,init)=>{deliveries.push(JSON.parse(init.body));return new Response('{}',{status:scenario==='provider-error-and-rate-limit'?400:200})},logger:{warn(){},error(){}}
  })
  await page.route('**/*',async route=>{
   const incoming=route.request(),url=new URL(incoming.url())
   if(url.pathname.endsWith('/api/hire')){
    const response=await service.fetch(new Request(incoming.url(),{method:incoming.method(),headers:await incoming.allHeaders(),...(incoming.method()==='POST'?{body:incoming.postData()}: {})}),{remoteAddress:'203.0.113.20'})
    await route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:await response.text()});return
   }
   if(incoming.method()==='POST'){await route.abort();return}
   await route.continue()
  })
  await page.goto('http://127.0.0.1:5177/tr/hireme',{waitUntil:'domcontentloaded'});await page.locator('#contact-name').fill(scenario==='validation'?'x'.repeat(121):'Audit Browser');await page.locator('#contact-email').fill('browser@example.test');await page.locator('#contact-message').fill('Local browser test; never delivered')
  await page.locator('.contact-submit').click()
  if(scenario==='success'){
   await page.locator('.contact-success').waitFor();assert.equal(deliveries.length,1);assert.equal(deliveries[0].reply_to,'browser@example.test');assert.equal(deliveries[0].to,'erenboluk.dev@gmail.com')
  }else{
   await page.locator('.form-error').waitFor();assert.equal(await page.locator('#contact-message').inputValue(),'Local browser test; never delivered')
   if(scenario==='validation')assert.equal(deliveries.length,0)
   else {await page.locator('.contact-submit').click();await page.locator('.form-notice h2').waitFor();assert.equal(await page.locator('#contact-name').isDisabled(),true);assert.equal(deliveries.length,1);assert.ok(await page.evaluate(()=>Number(localStorage.getItem('hireMeTimeoutUntil'))>Date.now()))}
  }
  console.log('PASS real frontend/backend contract: '+scenario);await context.close()
 }
}finally{await browser.close()}
