import { isIP } from 'node:net'
import { domainToASCII } from 'node:url'

export interface Config {
  port:number; production:boolean; trustProxy:'none'|'railway'; origins:Set<string>;
  rateMax:number; rateWindowMs:number; rateMaxEntries:number;
  globalRateMax:number; globalRateWindowMs:number; maxInFlight:number;
  bodyLimitBytes:number; bodyTimeoutMs:number; resendTimeoutMs:number;
  resendApiKey:string; receiverEmail:string;
}
function integer(env:Record<string,string|undefined>,key:string,fallback:number,min:number,max:number) {
  const raw=env[key]
  if(raw===undefined)return fallback
  if(!/^\d+$/.test(raw) || !Number.isSafeInteger(Number(raw)) || Number(raw)<min || Number(raw)>max)throw new Error(`Invalid configuration: ${key}`)
  return Number(raw)
}
export function readConfig(env:Record<string,string|undefined>):Config {
  const production=env.NODE_ENV==='production' || !!env.RAILWAY_ENVIRONMENT_ID
  const proxy=env.TRUST_PROXY ?? (env.RAILWAY_ENVIRONMENT_ID && env.RAILWAY_SERVICE_ID ? 'railway':'none')
  if(proxy!=='none' && proxy!=='railway')throw new Error('Invalid configuration: TRUST_PROXY')
  const origins=new Set(['https://erenboluk.com.tr','https://www.erenboluk.com.tr'])
  if(env.ALLOWED_ORIGINS!==undefined){
    origins.clear()
    for(const value of env.ALLOWED_ORIGINS.split(',').map(s=>s.trim())){
      let url:URL
      try{url=new URL(value)}catch{throw new Error('Invalid configuration: ALLOWED_ORIGINS')}
      if(!['https:','http:'].includes(url.protocol) || (production && url.protocol!=='https:') || url.username || url.password || url.pathname!=='/' || url.search || url.hash)throw new Error('Invalid configuration: ALLOWED_ORIGINS')
      origins.add(url.origin)
    }
  }
  const receiverEmail=emailAddress(env.RECEIVER_EMAIL ?? 'erenboluk.dev@gmail.com')
  if(!receiverEmail)throw new Error('Invalid configuration: RECEIVER_EMAIL')
  return {
    port:integer(env,'PORT',3000,1,65535),production,trustProxy:proxy,origins,
    rateMax:integer(env,'RATE_LIMIT_MAX',2,1,10000),rateWindowMs:integer(env,'RATE_LIMIT_WINDOW_MS',300000,1000,86400000),
    rateMaxEntries:integer(env,'RATE_LIMIT_MAX_ENTRIES',10000,1,100000),
    globalRateMax:integer(env,'GLOBAL_RATE_LIMIT_MAX',20,1,10000),globalRateWindowMs:integer(env,'GLOBAL_RATE_LIMIT_WINDOW_MS',3600000,1000,86400000),
    maxInFlight:integer(env,'MAX_IN_FLIGHT',2,1,20),bodyLimitBytes:integer(env,'BODY_LIMIT_BYTES',16384,1024,65536),
    bodyTimeoutMs:integer(env,'BODY_TIMEOUT_MS',5000,1000,30000),resendTimeoutMs:integer(env,'RESEND_TIMEOUT_MS',10000,1000,30000),
    resendApiKey:(env.RESEND_API_KEY ?? '').trim(),receiverEmail
  }
}
export function isAllowedOrigin(origin:string,config:Config) {
  if(config.origins.has(origin))return true
  if(config.production)return false
  try{
    const url=new URL(origin)
    return url.origin===origin && ['http:','https:'].includes(url.protocol) && ['localhost','127.0.0.1','[::1]'].includes(url.hostname)
  }catch{return false}
}
function canonicalIp(value:string|undefined|null) {
  if(!value || value.includes('%') || value!==value.trim())return null
  if(/^::ffff:\d+\.\d+\.\d+\.\d+$/i.test(value))value=value.slice(7)
  const family=isIP(value)
  if(family===4)return value
  if(family===6){try{return new URL(`http://[${value}]/`).hostname.slice(1,-1)}catch{return null}}
  return null
}
export function clientIp(request:Request,remoteAddress:string|undefined,trustProxy:Config['trustProxy']) {
  // Only opt-in/detected Railway edge headers are trusted. XFF is never a key.
  return canonicalIp(trustProxy==='railway' ? request.headers.get('x-real-ip') : remoteAddress)
}
function emailAddress(value:unknown):string|null {
  if(typeof value!=='string')return null
  const email=value.trim()
  if(email.length>254 || /[\s\u0000-\u001f\u007f]/.test(email))return null
  const parts=email.split('@')
  if(parts.length!==2)return null
  const [local,domain]=parts
  if(!local || local.length>64 || local.startsWith('.') || local.endsWith('.') || local.includes('..') || !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local))return null
  if (/[\/\\?#:%[\]]/.test(domain))return null
  const ascii=domainToASCII(domain).toLowerCase(),labels=ascii.split('.')
  if(!ascii || labels.length<2 || labels.some(label=>! /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label)))return null
  return `${local}@${ascii}`
}
export function validatePayload(input:unknown):{name:string;email:string;message:string}|null {
  if(!input || typeof input!=='object' || Array.isArray(input))return null
  const body=input as Record<string,unknown>
  if(Object.keys(body).some(key=>!['name','email','message'].includes(key)))return null
  if(typeof body.name!=='string' || typeof body.message!=='string')return null
  const name=body.name.trim(),message=body.message.trim(),email=emailAddress(body.email)
  if(!name || name.length>120 || /[\u0000-\u001f\u007f]/.test(name) || !message || message.length>5000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(message) || !email)return null
  return {name,email,message}
}
export class InputError extends Error {
  status:number
  constructor(status:number){super('Invalid request');this.status=status}
}
export async function readJson(request:Request,maxBytes:number,timeoutMs:number):Promise<unknown> {
  const length=request.headers.get('content-length')
  if(length!==null && (!/^\d+$/.test(length) || Number(length)>maxBytes)){
    void request.body?.cancel().catch(()=>{})
    throw new InputError(/^\d+$/.test(length)?413:400)
  }
  if(!request.body)throw new InputError(400)
  const reader=request.body.getReader(),decoder=new TextDecoder('utf-8',{fatal:true})
  let total=0,text='',timer:ReturnType<typeof setTimeout>|undefined
  const deadline=new Promise<never>((_resolve,reject)=>{timer=setTimeout(()=>reject(new InputError(408)),timeoutMs)})
  try{
    while(true){
      const {value,done}=await Promise.race([reader.read(),deadline])
      if(done)break
      total+=value.byteLength
      if(total>maxBytes)throw new InputError(413)
      text+=decoder.decode(value,{stream:true})
    }
    text+=decoder.decode()
    return JSON.parse(text)
  }catch(error){
    void reader.cancel().catch(()=>{})
    if(error instanceof InputError)throw error
    throw new InputError(400)
  }finally{clearTimeout(timer);reader.releaseLock()}
}
