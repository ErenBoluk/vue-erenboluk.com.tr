import { Hono } from 'hono'
import type { Server } from 'bun'
import { readConfig } from './security.ts'
import { createHireService } from './hire-service.ts'

const config=readConfig(process.env)
const service=createHireService(config)
const app=new Hono<{Bindings:{remoteAddress?:string}}>()

app.all('*',c=>service.fetch(c.req.raw,{remoteAddress:c.env?.remoteAddress}))
app.onError(()=>{
  console.error('hire.adapter-error')
  return Response.json({error:'Mesaj gonderilemedi. Lutfen daha sonra tekrar deneyin.'},{status:500,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})
})

export default {
  port:config.port,
  fetch(request:Request,server:Server<unknown>){
    // Direct connections use the socket peer. Railway mode is selected separately
    // by validated configuration and trusts only its edge-supplied X-Real-IP.
    return app.fetch(request,{remoteAddress:server?.requestIP(request)?.address})
  }
}
