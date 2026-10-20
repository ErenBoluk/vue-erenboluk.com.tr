export interface LimitResult {allowed:boolean;retryAfterMs:number;capacity:boolean}
// Bounded, process-local storage. Suitable for the confirmed single-instance service.
export class WindowLimiter {
  private entries=new Map<string,{count:number;expires:number}>()
  private nextPrune=0
  private max:number
  private windowMs:number
  private maxEntries:number
  constructor(max:number,windowMs:number,maxEntries:number){this.max=max;this.windowMs=windowMs;this.maxEntries=maxEntries}
  get size(){return this.entries.size}
  take(key:string,now:number):LimitResult {
    if(now>=this.nextPrune){
      for(const [id,entry] of this.entries)if(entry.expires<=now)this.entries.delete(id)
      this.nextPrune=now+Math.min(this.windowMs,60000)
    }
    let entry=this.entries.get(key)
    if(entry && entry.expires<=now){this.entries.delete(key);entry=undefined}
    if(entry){
      if(entry.count>=this.max)return{allowed:false,retryAfterMs:Math.max(1,entry.expires-now),capacity:false}
      entry.count++;return{allowed:true,retryAfterMs:0,capacity:false}
    }
    // Do not evict live entries: that would let high cardinality reset protection.
    if(this.entries.size>=this.maxEntries)return{allowed:false,retryAfterMs:Math.min(this.windowMs,60000),capacity:true}
    this.entries.set(key,{count:1,expires:now+this.windowMs})
    return{allowed:true,retryAfterMs:0,capacity:false}
  }
}
