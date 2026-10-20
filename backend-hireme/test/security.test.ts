import {test} from 'node:test'
import assert from 'node:assert/strict'
import {readConfig,validatePayload,clientIp,isAllowedOrigin} from '../security.ts'
import {WindowLimiter} from '../rate-limit.ts'

test('configuration defaults preserve existing contract and detect Railway proxy explicitly',()=>{
 const config=readConfig({})
 assert.equal(config.rateMax,2);assert.equal(config.rateWindowMs,300000);assert.equal(config.trustProxy,'none')
 assert.equal(readConfig({RAILWAY_ENVIRONMENT_ID:'env',RAILWAY_SERVICE_ID:'svc'}).trustProxy,'railway')
 assert.equal(readConfig({TRUST_PROXY:'none',RAILWAY_ENVIRONMENT_ID:'env',RAILWAY_SERVICE_ID:'svc'}).trustProxy,'none')
 for(const env of [{RATE_LIMIT_MAX:'NaN'},{RATE_LIMIT_WINDOW_MS:'0'},{RESEND_TIMEOUT_MS:'Infinity'},{TRUST_PROXY:'yes'},{PORT:'3000oops'},{NODE_ENV:'production',ALLOWED_ORIGINS:'http://erenboluk.com.tr'}])assert.throws(()=>readConfig(env))
})
test('origin policy uses exact production origins and parsed dev loopback only',()=>{
 const dev=readConfig({}),prod=readConfig({NODE_ENV:'production'})
 for(const origin of ['https://erenboluk.com.tr','https://www.erenboluk.com.tr'])assert.equal(isAllowedOrigin(origin,prod),true)
 for(const origin of ['https://noterenboluk.com.tr','https://erenboluk.com.tr.evil.test','null','http://localhost:5176'])assert.equal(isAllowedOrigin(origin,prod),false)
 assert.equal(isAllowedOrigin('http://127.0.0.1:5176',dev),true)
 assert.equal(isAllowedOrigin('http://localhost:5176.evil.test',dev),false)
})
test('IP identity ignores XFF, canonicalizes valid addresses and never shares unknown_ip',()=>{
 const request=new Request('https://backend.test',{headers:{'x-forwarded-for':'1.2.3.4','x-real-ip':'198.51.100.10'}})
 assert.equal(clientIp(request,'203.0.113.10','none'),'203.0.113.10')
 assert.equal(clientIp(request,'203.0.113.10','railway'),'198.51.100.10')
 assert.equal(clientIp(new Request('https://backend.test'),undefined,'none'),null)
 assert.equal(clientIp(new Request('https://backend.test'), '127.0.0.1','railway'),null)
 assert.equal(clientIp(new Request('https://backend.test',{headers:{'x-real-ip':'1.2.3.4, 5.6.7.8'}}),'127.0.0.1','railway'),null)
 assert.equal(clientIp(request,'::ffff:203.0.113.10','none'),'203.0.113.10')
})
test('payload accepts Unicode names and multiline messages, rejects unsafe shapes/headers/lengths',()=>{
 const valid={name:'  Eren B\u00f6l\u00fck  ',email:'hello+work@example.test',message:'  Hello\nSecond line  '}
 assert.deepEqual(validatePayload(valid),{name:'Eren B\u00f6l\u00fck',email:'hello+work@example.test',message:'Hello\nSecond line'})
 for(const value of [null,[],{...valid,name:{}},{...valid,email:['a@example.test']},{...valid,message:'   '},{...valid,email:'a\r\nBcc:b@example.test'},{...valid,name:'a\r\nb'},{...valid,email:'a..b@example.test'},{...valid,name:'a'.repeat(121)},{...valid,message:'x'.repeat(5001)},{...valid,to:'someone@example.test'}])assert.equal(validatePayload(value),null)
})
test('fixed windows expire, retain retry duration and cap storage without evicting active protection',()=>{
 const limiter=new WindowLimiter(2,100,2)
 assert.equal(limiter.take('a',1000).allowed,true);assert.equal(limiter.take('a',1010).allowed,true)
 assert.deepEqual(limiter.take('a',1020),{allowed:false,retryAfterMs:80,capacity:false})
 assert.equal(limiter.take('b',1020).allowed,true);assert.equal(limiter.take('c',1020).capacity,true)
 assert.equal(limiter.size,2);assert.equal(limiter.take('c',1200).allowed,true);assert.equal(limiter.size,1)
})

test('email parsing rejects URL delimiters instead of silently normalizing a malformed domain',()=>{
 for(const email of ['a@example.test/path','a@example.test?x=y','a@example.test#fragment','a@example.test:443'])assert.equal(validatePayload({name:'Audit',email,message:'Hello'}),null)
})
test('canonical IPv6 spellings share the same identity',()=>{
 const request=new Request('https://backend.test')
 assert.equal(clientIp(request,'2001:0DB8:0000:0000:0000:0000:0000:0001','none'),clientIp(request,'2001:db8::1','none'))
})

import fs from 'node:fs'
test('dependency lock agrees with manifest and contains no unused Nodemailer packages',()=>{
 const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'))
 const lock=JSON.parse(fs.readFileSync(new URL('../bun.lock',import.meta.url),'utf8').replace(/,\s*([}\]])/g,'$1'))
 assert.deepEqual(lock.workspaces[''].dependencies,pkg.dependencies)
 assert.deepEqual(lock.workspaces[''].devDependencies,pkg.devDependencies)
 assert.equal(lock.packages.nodemailer,undefined);assert.equal(lock.packages['@types/nodemailer'],undefined)
 assert.equal(lock.packages.hono[0],'hono@4.13.8')
})
