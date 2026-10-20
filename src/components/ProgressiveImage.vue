<script setup>
import { computed, ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
const props = defineProps({
  src:{type:String,required:true},alt:{type:String,required:true},
  width:{type:[Number,String],default:640},height:{type:[Number,String],default:400},
  aspectRatio:String,fit:{type:String,default:'cover'},
  eager:Boolean,fetchpriority:{type:String,default:'auto'}
})
const emit = defineEmits(['load','error'])
const {t} = useI18n()
const root = ref(null),image = ref(null),status = ref('idle'),requested = ref(props.eager)
const ratio = computed(()=>props.aspectRatio || `${props.width} / ${props.height}`)
let observer,near = false,disposed = false,version = 0
async function loaded(event) {
  const token = version,element = event?.target || image.value
  if(!element?.naturalWidth)return
  try {await element.decode?.()}catch{/* A successfully loaded image can still display if decode is unavailable. */}
  if(disposed || token!==version || status.value==='loaded')return
  status.value = 'loaded';emit('load',element)
}
function failed(event) {if(!disposed){status.value='error';emit('error',event)}}
function request() {if(!requested.value){requested.value=true;status.value='loading'}}
watch(()=>props.src,async()=>{
  version++;status.value='idle';requested.value=props.eager || near
  if(requested.value)status.value='loading'
  await nextTick()
  if(!disposed && image.value?.complete && image.value.naturalWidth)loaded()
},{flush:'post'})
onMounted(()=>{
  if(requested.value)status.value='loading'
  if('IntersectionObserver' in window){
    observer = new IntersectionObserver(entries=>{
      near = entries[0].isIntersecting
      if(near)request()
    },{rootMargin:'240px 0px'})
    observer.observe(root.value)
  }else request()
  if(image.value?.complete && image.value.naturalWidth)loaded()
})
onBeforeUnmount(()=>{disposed=true;version++;observer?.disconnect()})
</script>
<template>
  <span ref="root" class="progressive-image" :data-image-state="status" :aria-busy="status==='loading'" :style="{aspectRatio:ratio,'--image-fit':fit}">
    <span class="image-placeholder" aria-hidden="true">
      <svg class="image-mark" viewBox="0 0 40 32" fill="none"><rect x="1" y="1" width="38" height="30" rx="3"/><path d="m3 26 10-10 7 6 7-12 10 16"/><circle cx="12" cy="9" r="2"/></svg>
      <span v-if="status==='error'" class="image-unavailable">{{ t('loading.imageError') }}</span>
      <span class="image-sheen"></span>
    </span>
    <img ref="image" :src="requested ? src : undefined" :alt="alt" :width="width" :height="height" :loading="eager?'eager':'lazy'" :fetchpriority="fetchpriority" decoding="async" @load="loaded" @error="failed" />
  </span>
</template>
<style scoped>
.progressive-image { position:relative; display:block; width:100%; overflow:hidden; isolation:isolate; }
.progressive-image > img { position:relative; display:block; width:100%; height:100%; object-fit:var(--image-fit); opacity:0; transition:opacity 300ms ease; }
.progressive-image[data-image-state=loaded] > img { opacity:1; }
.image-placeholder { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; overflow:hidden; background:var(--aura-surface); color:var(--aura-muted); opacity:1; transition:opacity 300ms ease; }
.progressive-image[data-image-state=loaded] .image-placeholder { opacity:0; }
.image-mark { width:32px; height:26px; opacity:.3; stroke:currentColor; stroke-width:1; }
.image-sheen { position:absolute; inset:0; transform:translateX(-100%); background:linear-gradient(105deg,transparent 25%,rgb(244 244 245 / .045) 50%,transparent 75%); }
.progressive-image[data-image-state=loading] .image-sheen { animation:image-sheen 1.4s ease-in-out 3; }
.image-unavailable { font-size:12px; line-height:1.5; }
@keyframes image-sheen { to { transform:translateX(100%); } }
@media(prefers-reduced-motion:reduce) { .progressive-image > img,.image-placeholder { transition:none; } .progressive-image[data-image-state=loading] .image-sheen { animation:none; } }
</style>
