<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, isNavigationFailure, NavigationFailureType } from 'vue-router'
import { useI18n } from 'vue-i18n'
const router=useRouter(),{t}=useI18n()
const visible=ref(false),complete=ref(false)
let revealTimer,hideTimer,target=null,disposed=false
function start(to) {
  target=to;clearTimeout(revealTimer);clearTimeout(hideTimer);complete.value=false
  if(!visible.value)revealTimer=window.setTimeout(()=>{if(!disposed)visible.value=true},120)
}
function finish() {
  target=null
  clearTimeout(revealTimer)
  if(visible.value){complete.value=true;hideTimer=window.setTimeout(()=>{if(!disposed)visible.value=false},180)}
}
const removeBefore=router.beforeEach(to=>{start(to)})
const removeAfter=router.afterEach((to,_from,failure)=>{if(to===target || isNavigationFailure(failure,NavigationFailureType.duplicated))finish()})
const removeError=router.onError((_error,to)=>{if(!to || to===target)finish()})
onMounted(()=>{
  if(!router.currentRoute.value.matched.length)start(null)
  router.isReady().then(()=>{if(!disposed && (!target || target===router.currentRoute.value))finish()}).catch(()=>{if(!disposed)finish()})
})
onBeforeUnmount(()=>{disposed=true;clearTimeout(revealTimer);clearTimeout(hideTimer);removeBefore();removeAfter();removeError()})
</script>
<template>
  <div v-show="visible" data-route-loader class="route-loader" :class="{'route-complete':complete}" role="progressbar" :aria-label="t('loading.page')" :aria-valuetext="t('loading.page')">
    <span></span>
  </div>
  <span v-if="visible" class="sr-only" role="status">{{ t('loading.page') }}</span>
</template>
<style scoped>
.route-loader { position:fixed; inset:0 0 auto; height:2px; z-index:20000; pointer-events:none; overflow:hidden; }
.route-loader > span { display:block; height:100%; width:100%; background:var(--aura-accent); transform-origin:left; transform:scaleX(.1); animation:route-loading 6s cubic-bezier(.1,.4,.1,1) forwards; }
.route-loader.route-complete > span { animation:none; transform:scaleX(1); }
@keyframes route-loading { to { transform:scaleX(.85); } }
@media(prefers-reduced-motion:reduce) { .route-loader > span { animation:none; transform:scaleX(.4); } }
</style>
