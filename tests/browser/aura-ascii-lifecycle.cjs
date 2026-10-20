const {chromium} = require('playwright-core')
const assert = require('node:assert/strict')
const base=process.env.AURA_BASE_URL || 'http://127.0.0.1:5176'
;(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true})
 try{
  const page=await browser.newPage({viewport:{width:1000,height:900}})
  const errors=[];page.on('pageerror',e=>errors.push(e.message))
  await page.addInitScript(()=>{
   const frames=new Set(),listeners=new Map(),nativeRaf=requestAnimationFrame.bind(window),nativeCancel=cancelAnimationFrame.bind(window)
   let drawCalls=0,fillCalls=0
   const owned=()=>new Error().stack.includes('AsciiHoverBackground.vue')
   window.requestAnimationFrame=fn=>{const track=owned();let id;id=nativeRaf(t=>{frames.delete(id);fn(t)});if(track)frames.add(id);return id}
   window.cancelAnimationFrame=id=>{frames.delete(id);nativeCancel(id)}
   const add=EventTarget.prototype.addEventListener,remove=EventTarget.prototype.removeEventListener
   EventTarget.prototype.addEventListener=function(type,fn,opts){if(owned()){let types=listeners.get(fn);if(!types){types=new Set();listeners.set(fn,types)}types.add(type)}return add.call(this,type,fn,opts)}
   EventTarget.prototype.removeEventListener=function(type,fn,opts){listeners.get(fn)?.delete(type);if(!listeners.get(fn)?.size)listeners.delete(fn);return remove.call(this,type,fn,opts)}
   const draw=CanvasRenderingContext2D.prototype.drawImage,fill=CanvasRenderingContext2D.prototype.fillText
   CanvasRenderingContext2D.prototype.drawImage=function(...args){if(this.canvas.matches('[data-ascii-overlay]'))drawCalls++;return draw.apply(this,args)}
   CanvasRenderingContext2D.prototype.fillText=function(...args){if(this.canvas.matches('[data-ascii-overlay]'))fillCalls++;return fill.apply(this,args)}
   window.asciiProbe=()=>({frames:frames.size,listeners:listeners.size,drawCalls,fillCalls})
  })
  await page.goto(base+'/tr/about');await page.locator('main h1').waitFor()
  await page.evaluate(async()=>{
   const {createApp,h,reactive}=await import('/node_modules/.vite/deps/vue.js')
   const {default:Ascii}=await import('/src/components/AsciiHoverBackground.vue')
   const host=document.createElement('section');host.id='ascii-fixture';host.style.cssText='position:fixed;left:20px;top:140px;width:500px;height:280px;z-index:1000;isolation:isolate'
   document.body.append(host)
   const options=reactive({charset:'—>o',lumaOverride:.7,fluid:{densityDissipation:2},safeArea:{enabled:false}})
   const app=createApp({render:()=>h(Ascii,options)})
   app.mount(host);window.fixture={app,options,host}
  })
  const canvas=page.locator('#ascii-fixture canvas');await canvas.waitFor();await page.waitForTimeout(150)
  const alpha=()=>canvas.evaluate(c=>{let n=0;const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;for(let i=3;i<d.length;i+=4)n+=d[i];return n})
  const gesture=async()=>{await page.mouse.move(50,170);await page.mouse.move(430,180,{steps:20});await page.waitForTimeout(120)}
  assert.equal((await page.evaluate(()=>asciiProbe())).frames,0,'idle schedules no frames')
  await gesture();assert.ok(await alpha()>0)
  assert.equal((await page.evaluate(()=>asciiProbe())).fillCalls,0,'visible canvas uses atlas only')
  await page.evaluate(()=>fixture.options.isVisible=false);await page.waitForTimeout(60);assert.equal(await alpha(),0);assert.equal((await page.evaluate(()=>asciiProbe())).frames,0)
  await page.evaluate(()=>fixture.options.isVisible=true);await gesture();assert.ok(await alpha()>0)
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'))})
  assert.equal(await alpha(),0);assert.equal((await page.evaluate(()=>asciiProbe())).frames,0)
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});await gesture();assert.ok(await alpha()>0)
  await page.evaluate(()=>fixture.host.style.top='2000px');await page.waitForTimeout(150);assert.equal(await canvas.getAttribute('data-ascii-state'),'paused');assert.equal((await page.evaluate(()=>asciiProbe())).frames,0)
  await page.evaluate(()=>fixture.host.style.top='140px');await page.waitForTimeout(100);await gesture();assert.ok(await alpha()>0)
  await page.evaluate(()=>{fixture.host.style.width='320px';fixture.host.style.height='200px'});await page.waitForTimeout(120)
  assert.equal(await canvas.evaluate(c=>Math.round(c.getBoundingClientRect().width)),320)
  await page.evaluate(()=>{fixture.options.color='#ff0000';fixture.options.charset='X'});await gesture()
  assert.ok(await canvas.evaluate(c=>{const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let found=false;for(let i=0;i<d.length;i+=4)if(d[i+3]){if(d[i]<=d[i+1]||d[i]<=d[i+2])return false;found=true}return found}),'live color and charset update')
  await page.evaluate(()=>{
   const protectedArea=document.createElement('span');protectedArea.id='fixture-protected';protectedArea.style.cssText='position:absolute;left:70px;top:10px;width:110px;height:80px';fixture.host.append(protectedArea)
   fixture.options.safeArea={enabled:true,selector:'#fixture-protected',fadeSize:18}
  });await gesture()
  assert.equal(await canvas.evaluate(c=>{const d=c.getContext('2d').getImageData(75,15,100,70).data;return d.some((v,i)=>i%4===3&&v>0)}),false,'protected rectangle is transparent')
  await page.evaluate(async()=>{
   fixture.options.safeArea={enabled:false};fixture.options.lumaOverride=undefined
   fixture.options.onVideoFallback=()=>{fixture.fallbacks=(fixture.fallbacks||0)+1}
   const source=document.createElement('canvas');source.width=64;source.height=32;source.getContext('2d').fillStyle='white';source.getContext('2d').fillRect(0,0,64,32)
   const video=document.createElement('video');video.muted=true;video.playsInline=true;video.style.cssText='position:absolute;inset:0;width:100%;height:100%;opacity:0;object-fit:cover;object-position:right bottom'
   video.srcObject=source.captureStream(10);fixture.host.append(video);await video.play();fixture.video=video;fixture.stream=video.srcObject
  });await gesture();assert.equal(await canvas.getAttribute('data-ascii-luma'),'video','actual video frames sampled')
  await page.evaluate(()=>{
   const original=CanvasRenderingContext2D.prototype.getImageData
   fixture.restoreRead=()=>CanvasRenderingContext2D.prototype.getImageData=original
   CanvasRenderingContext2D.prototype.getImageData=function(...args){if(!this.canvas.matches('[data-ascii-overlay]'))throw new DOMException('simulated CORS','SecurityError');return original.apply(this,args)}
   document.dispatchEvent(new Event('scroll'))
  });await gesture();await page.waitForTimeout(150)
  assert.equal(await canvas.getAttribute('data-ascii-luma'),'fallback-tainted');assert.equal(await page.evaluate(()=>fixture.fallbacks),1)
  await page.evaluate(()=>{fixture.restoreRead();fixture.video.remove();fixture.stream.getTracks().forEach(t=>t.stop())})
  console.log('PASS safe-area transparency, real video luminance and CORS fallback')
  await page.evaluate(()=>fixture.options.fluid={enabled:false});await page.waitForTimeout(60);await gesture();assert.equal(await alpha(),0)
  await page.evaluate(()=>fixture.options.fluid={enabled:true,densityDissipation:3,forceScale:0,splashDensity:0,splashForceScale:0});await page.waitForTimeout(50)
  await page.mouse.click(100,170);await page.waitForTimeout(400);assert.equal(await alpha(),0,'zero splash settings honored')
  await page.evaluate(()=>fixture.app.unmount());await page.waitForTimeout(100)
  const probe=await page.evaluate(()=>asciiProbe());assert.equal(probe.frames,0);assert.equal(probe.listeners,0)
  assert.deepEqual(errors,[])
  console.log('PASS idle RAF sleep, atlas drawing, visibility prop, hidden tab, offscreen pause/resume, resize, live color/charset, disabled/zero settings and listener/RAF cleanup')
  const mobile=await browser.newPage({viewport:{width:390,height:600},isMobile:true,hasTouch:true})
  await mobile.goto(base+'/tr');await mobile.locator('[data-ascii-overlay]').waitFor();await mobile.waitForTimeout(500)
  const scroller=mobile.locator('[data-aura-scroll]'),before=await scroller.evaluate(e=>e.scrollTop)
  await mobile.evaluate(()=>{
   const c=document.querySelector('[data-ascii-overlay]');const r=c.getBoundingClientRect()
   for(const [type,x,y]of [['pointerdown',r.left+10,r.top+100],['pointermove',r.left+12,r.top+200],['pointerup',r.left+12,r.top+200]])window.dispatchEvent(new PointerEvent(type,{pointerType:'touch',pointerId:99,isPrimary:true,clientX:x,clientY:y,button:0}))
  })
  const cdp=await mobile.context().newCDPSession(mobile)
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:500}]})
  for(let y=480;y>=240;y-=30){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y}]});await mobile.waitForTimeout(20)}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await mobile.waitForTimeout(200)
  assert.ok(await scroller.evaluate(e=>e.scrollTop)>before,'native touch scroll is not blocked')
  console.log('PASS touch scrolling through overlay')
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1})
