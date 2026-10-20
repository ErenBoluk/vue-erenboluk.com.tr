const {chromium}=require('playwright-core'),assert=require('node:assert/strict')
const base=process.env.AURA_BASE_URL || 'http://127.0.0.1:5176'
;(async()=>{const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});let failures=0;try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'no-preference'})
 await page.goto(base+'/tr',{waitUntil:'domcontentloaded'});await page.locator('[data-ascii-overlay]').waitFor();await page.waitForTimeout(900)
 try{assert.equal(await page.locator('[data-aura-cursor]').count(),0,'Home does not mount the ring cursor');console.log('PASS Home ring absent')}catch(e){console.error(e.message);failures++}
 const box=await page.locator('.hero-actions').boundingBox(),canvas=page.locator('[data-ascii-overlay]')
 await page.mouse.move(box.x+box.width-180,box.y+box.height/2)
 for(let i=0;i<20;i++){await page.mouse.move(box.x+box.width-180+i*4,box.y+box.height/2);await page.waitForTimeout(16)}
 const visible=await canvas.evaluate((c,b)=>{const r=c.getBoundingClientRect(),scale=c.width/r.width,d=c.getContext('2d').getImageData((b.x+b.width-190-r.x)*scale,(b.y+4-r.y)*scale,120*scale,(b.height-8)*scale).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i])n++;return n},box)
 try{assert.ok(visible>20,'ASCII visible in empty space beside buttons');console.log('PASS button-row whitespace has visible ASCII: '+visible)}catch(e){console.error(e.message);failures++}
 await page.screenshot({path:'docs/aura/review/ascii/button-row-fixed.png'})
 await page.locator('#hire-me-button').click();await page.waitForURL(/\/tr\/hireme$/);await page.locator('[data-ascii-overlay]').waitFor({state:'detached'})
 await page.mouse.move(800,400);await page.waitForTimeout(150)
 assert.equal(await page.locator('[data-aura-cursor]').count(),1)
 assert.equal(await page.locator('[data-aura-cursor]').evaluate(e=>getComputedStyle(e).opacity),'1')
 console.log('PASS hire link and ring restored on another route')
 await page.getByRole('link',{name:'Ana Sayfa',exact:true}).click();await page.locator('[data-ascii-overlay]').waitFor();assert.equal(await page.locator('[data-aura-cursor]').count(),0)
 console.log('PASS return Home removes ring')
 }finally{await browser.close()}if(failures)process.exitCode=1
})().catch(e=>{console.error(e);process.exitCode=1})
