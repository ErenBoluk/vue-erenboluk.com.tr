import { type Config, clientIp, isAllowedOrigin, validatePayload, readJson, InputError } from './security.ts'
import { WindowLimiter } from './rate-limit.ts'
interface Dependencies {
  fetch?:typeof globalThis.fetch
  now?:()=>number
  logger?:Pick<Console,'error'|'warn'>
}
const invalid='G\u00f6nderilen bilgiler ge\u00e7ersiz.'
const unavailable='Mesaj g\u00f6nderilemedi. L\u00fctfen daha sonra tekrar deneyin.'
const limited='\u00c7ok fazla istek g\u00f6nderdiniz. L\u00fctfen daha sonra tekrar deneyin.'
export function createHireService(config:Config,dependencies:Dependencies={}) {
  const fetcher=dependencies.fetch ?? globalThis.fetch,now=dependencies.now ?? Date.now,logger=dependencies.logger ?? console
  const ips=new WindowLimiter(config.rateMax,config.rateWindowMs,config.rateMaxEntries)
  const globalBudget=new WindowLimiter(config.globalRateMax,config.globalRateWindowMs,1)
  let inFlight=0
  return {
    async fetch(request:Request,connection:{remoteAddress?:string}={}):Promise<Response> {
      const origin=request.headers.get('origin'),allowed=!origin || isAllowedOrigin(origin,config)
      const requestId=crypto.randomUUID()
      const headers=new Headers({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Request-ID':requestId,'Vary':'Origin'})
      if(origin && allowed)headers.set('Access-Control-Allow-Origin',origin)
      const json=(body:unknown,status:number,extra:Record<string,string>={})=>Response.json(body,{status,headers:{...Object.fromEntries(headers),...extra}})
      const throttle=(result:{retryAfterMs:number;capacity:boolean})=>json(result.capacity?{error:unavailable}:{error:limited,retryAfterMs:result.retryAfterMs},result.capacity?503:429,{'Retry-After':String(Math.max(1,Math.ceil(result.retryAfterMs/1000)))})
      try{
        if(!allowed)return json({error:'Origin not allowed'},403)
        const path=new URL(request.url).pathname
        if((path==='/' || path==='/health') && request.method==='GET')return new Response(path==='/health'?'OK':'HireMe Form Backend is running on Bun + Hono!',{headers})
        if(path!=='/api/hire')return json({error:'Not found'},404)
        if(request.method==='OPTIONS'){
          const method=request.headers.get('access-control-request-method')
          const requested=request.headers.get('access-control-request-headers')?.split(',').map(s=>s.trim().toLowerCase()) ?? []
          if((method && method!=='POST') || requested.some(value=>value!=='content-type'))return json({error:invalid},403)
          return new Response(null,{status:204,headers:{...Object.fromEntries(headers),'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600','Vary':'Origin, Access-Control-Request-Method, Access-Control-Request-Headers'}})
        }
        if(request.method!=='POST')return json({error:'Method not allowed'},405,{'Allow':'POST, OPTIONS'})
        if(request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()!=='application/json' || !['identity',''].includes(request.headers.get('content-encoding') ?? ''))return json({error:invalid},415)
        const ip=clientIp(request,connection.remoteAddress,config.trustProxy)
        if(!ip)return json({error:unavailable},503,{'Retry-After':'60'})
        const ipLimit=ips.take(ip,now())
        if(!ipLimit.allowed)return throttle(ipLimit)
        let body:unknown
        try{body=await readJson(request,config.bodyLimitBytes,config.bodyTimeoutMs)}catch(error){
          if(error instanceof InputError)return json({error:invalid},error.status)
          throw error
        }
        const data=validatePayload(body)
        if(!data)return json({error:invalid},400)
        if(!config.resendApiKey)return json({error:unavailable},503)
        if(inFlight>=config.maxInFlight)return json({error:unavailable},503,{'Retry-After':'1'})
        const budget=globalBudget.take('mail',now())
        if(!budget.allowed)return throttle(budget)
        inFlight++
        const controller=new AbortController()
        let timedOut=false
        const cancel=()=>controller.abort()
        if(request.signal.aborted)cancel()
        else request.signal.addEventListener('abort',cancel,{once:true})
        const timer=setTimeout(()=>{timedOut=true;controller.abort()},config.resendTimeoutMs)
        try{
          const response=await fetcher('https://api.resend.com/emails',{
            method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${config.resendApiKey}`},signal:controller.signal,
            body:JSON.stringify({from:'Portfolio Form <onboarding@resend.dev>',to:config.receiverEmail,reply_to:data.email,subject:`Yeni \u0130\u015f Teklifi: ${data.name} (Portfolio)`,text:`\u0130sim: ${data.name}\nE-posta: ${data.email}\n\nMesaj:\n${data.message}`})
          })
          // Neither provider response bodies nor user content/credentials enter logs.
          void response.body?.cancel().catch(()=>{})
          if(!response.ok){logger.warn('hire.provider-failure',{requestId,status:response.status});return json({error:unavailable},502)}
          return json({success:true,message:'Mesaj ba\u015far\u0131yla g\u00f6nderildi'},200)
        }catch{
          logger.warn(timedOut?'hire.provider-timeout':'hire.provider-failure',{requestId})
          return json({error:unavailable},timedOut?504:502)
        }finally{
          clearTimeout(timer);request.signal.removeEventListener('abort',cancel);inFlight--
        }
      }catch{
        logger.error('hire.internal-error',{requestId})
        return json({error:unavailable},500)
      }
    }
  }
}
