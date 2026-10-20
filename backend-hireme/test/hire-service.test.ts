import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readConfig} from '../security.ts'
import {createHireService} from '../hire-service.ts'
const payload={name:'Audit User',email:'sender@example.test',message:'Hello from local tests'}
const peer={remoteAddress:'203.0.113.10'}
function request(body=payload,headers={},method='POST'){
 return new Request('https://backend.example.test/api/hire',{method,headers:{origin:'https://erenboluk.com.tr','content-type':'application/json',...headers},...(method==='OPTIONS'?{}:{body:typeof body==='string'?body:JSON.stringify(body)})})
}
function setup(env={},fetcher=async()=>new Response('{}',{status:200})){
 const deliveries=[],logs=[];const config=readConfig({RESEND_API_KEY:'audit-placeholder',RECEIVER_EMAIL:'owner@example.test',...env})
 const service=createHireService(config,{fetch:async(url,init)=>{deliveries.push({url,init});return fetcher(url,init)},logger:{error:(...args)=>logs.push(args),warn:(...args)=>logs.push(args)}})
 return{service,deliveries,logs,config}
}
test('valid request preserves fixed recipient, text content and success contract',async()=>{
 const {service,deliveries}=setup();const response=await service.fetch(request(),peer)
 assert.equal(response.status,200);assert.equal((await response.json()).success,true)
 const sent=JSON.parse(deliveries[0].init.body)
 assert.equal(sent.to,'owner@example.test');assert.equal(sent.reply_to,payload.email);assert.equal(sent.html,undefined);assert.match(sent.text,/local tests/)
 assert.ok(deliveries[0].init.signal instanceof AbortSignal);assert.equal(response.headers.get('cache-control'),'no-store')
})
test('disallowed origins and content types cannot trigger provider calls; preflight remains usable',async()=>{
 const {service,deliveries}=setup({NODE_ENV:'production'})
 assert.equal((await service.fetch(request(payload,{origin:'https://noterenboluk.com.tr'}),peer)).status,403)
 assert.equal((await service.fetch(request(payload,{'content-type':'text/plain'}),peer)).status,415)
 const preflight=await service.fetch(request(undefined,{'access-control-request-method':'POST','access-control-request-headers':'content-type'},'OPTIONS'),peer)
 assert.equal(preflight.status,204);assert.equal(preflight.headers.get('access-control-allow-origin'),'https://erenboluk.com.tr');assert.equal(deliveries.length,0)
})
test('malformed, oversized and invalid schema input is rejected before provider calls',async()=>{
 for(const [body,headers,status] of [['{',{},400],[{...payload,message:' '.repeat(20)},{},400],[{...payload,message:'x'.repeat(20000)},{},413],[payload,{'content-length':'999999'},413],[{...payload,email:['a@example.test']},{},400]]){
  const {service,deliveries}=setup();const response=await service.fetch(request(body,headers),peer);assert.equal(response.status,status);assert.equal(deliveries.length,0)
 }
})
test('untrusted forwarded headers cannot reset rate budget and missing identity fails closed',async()=>{
 const {service}=setup();for(let i=0;i<3;i++){
  const response=await service.fetch(request(payload,{'x-forwarded-for':String(i),'x-real-ip':`198.51.100.${i}`}),peer)
  assert.equal(response.status,i<2?200:429)
  if(i===2){assert.ok(Number(response.headers.get('retry-after'))>0);assert.ok((await response.json()).retryAfterMs>0)}
 }
 assert.equal((await setup().service.fetch(request(),{})).status,503)
})
test('provider failures and missing config never leak details or secrets',async()=>{
 const {service,logs}=setup({},async()=>new Response(JSON.stringify({message:'sensitive-provider-detail'}),{status:400}))
 const response=await service.fetch(request(),peer);assert.equal(response.status,502);assert.doesNotMatch(await response.text(),/sensitive|audit-placeholder|API.Key/)
 assert.doesNotMatch(JSON.stringify(logs),/sensitive|audit-placeholder|sender@example|Hello from/)
 const missing=setup({RESEND_API_KEY:''});assert.equal((await missing.service.fetch(request(),peer)).status,503);assert.equal(missing.deliveries.length,0)
})
test('global quota and in-flight limits bound work across distinct IPs',async()=>{
 const {service}=setup({GLOBAL_RATE_LIMIT_MAX:'1'});assert.equal((await service.fetch(request(),peer)).status,200)
 assert.equal((await service.fetch(request(),{remoteAddress:'203.0.113.11'})).status,429)
 let release;const gate=new Promise(resolve=>release=resolve);const busy=setup({MAX_IN_FLIGHT:'1'},async()=>{await gate;return new Response('{}')})
 const first=busy.service.fetch(request(),peer);await new Promise(resolve=>setTimeout(resolve,10))
 const second=await busy.service.fetch(request(),{remoteAddress:'203.0.113.12'});assert.equal(second.status,503);assert.equal(busy.deliveries.length,1);release();assert.equal((await first).status,200)
})
test('provider deadline aborts work and returns a generic timeout',async()=>{
 const config=readConfig({RESEND_API_KEY:'audit-placeholder'});config.resendTimeoutMs=20
 let aborted=false
 const service=createHireService(config,{fetch:async(_url,init)=>new Promise((_resolve,reject)=>{init.signal.addEventListener('abort',()=>{aborted=true;reject(new DOMException('sensitive-timeout','AbortError'))},{once:true})}),logger:{error(){},warn(){}}})
 const response=await service.fetch(request(),peer);assert.equal(response.status,504);assert.equal(aborted,true);assert.doesNotMatch(await response.text(),/sensitive-timeout/)
})

test('streamed bodies are byte-bounded even without Content-Length',async()=>{
 const {service,deliveries}=setup();const body=new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode(JSON.stringify({...payload,message:'\u00e9'.repeat(10000)})));controller.close()}})
 const req=new Request('https://backend.test/api/hire',{method:'POST',headers:{origin:'https://erenboluk.com.tr','content-type':'application/json'},body,duplex:'half'})
 assert.equal((await service.fetch(req,peer)).status,413);assert.equal(deliveries.length,0)
})
test('slow upload deadline cancels the body without provider calls',async()=>{
 const config=readConfig({RESEND_API_KEY:'audit-placeholder'});config.bodyTimeoutMs=20
 let cancelled=false,calls=0
 const service=createHireService(config,{fetch:async()=>{calls++;return new Response('{}')}})
 const req=new Request('https://backend.test/api/hire',{method:'POST',headers:{'content-type':'application/json'},body:new ReadableStream({cancel(){cancelled=true}}),duplex:'half'})
 const response=await service.fetch(req,peer);assert.equal(response.status,408);assert.equal(cancelled,true);assert.equal(calls,0)
})
test('trusted Railway identity uses only one valid edge IP and no fallback bucket',async()=>{
 const {service}=setup({TRUST_PROXY:'railway'})
 assert.equal((await service.fetch(request(),peer)).status,503)
 for(let i=0;i<3;i++){const response=await service.fetch(request(payload,{'x-real-ip':'198.51.100.1','x-forwarded-for':`fake-${i}`}),peer);assert.equal(response.status,i<2?200:429)}
})

test('client disconnect aborts provider work and releases the concurrency slot',async()=>{
 let aborted=false,requests=0
 const {service}=setup({MAX_IN_FLIGHT:'1'},async(_url,init)=>{
  requests++
  if(requests>1)return new Response('{}')
  return new Promise((_resolve,reject)=>init.signal.addEventListener('abort',()=>{aborted=true;reject(Error('client cancelled'))},{once:true}))
 })
 const controller=new AbortController(),base=request()
 const pending=service.fetch(new Request(base,{signal:controller.signal}),peer)
 await new Promise(resolve=>setTimeout(resolve,10));controller.abort()
 assert.equal((await pending).status,502);assert.equal(aborted,true)
 assert.equal((await service.fetch(request(),{remoteAddress:'203.0.113.12'})).status,200)
})
test('capacity is bounded and expiry restores service without key eviction',async()=>{
 const config=readConfig({RESEND_API_KEY:'audit-placeholder',RATE_LIMIT_MAX_ENTRIES:'1'});let now=1000000
 const service=createHireService(config,{now:()=>now,fetch:async()=>new Response('{}')})
 assert.equal((await service.fetch(request(),peer)).status,200)
 const full=await service.fetch(request(),{remoteAddress:'203.0.113.12'});assert.equal(full.status,503);assert.ok(full.headers.has('retry-after'))
 now+=config.rateWindowMs+1
 assert.equal((await service.fetch(request(),{remoteAddress:'203.0.113.12'})).status,200)
})
test('health/method responses are safe and do not contact the mail provider',async()=>{
 const {service,deliveries}=setup()
 assert.equal((await service.fetch(new Request('https://backend.test/health'))).status,200)
 const wrong=await service.fetch(new Request('https://backend.test/api/hire'));assert.equal(wrong.status,405);assert.equal(wrong.headers.get('allow'),'POST, OPTIONS')
 assert.equal((await service.fetch(request(payload,{'content-encoding':'gzip'}),peer)).status,415)
 assert.equal(deliveries.length,0)
})
