<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import {
  FluidMask, resolveMaskOptions, pointerImpulse, computeSafeAreaAlpha,
  calculateCellDimensions, createGlyphAtlas, mapLumaToCharIndex,
  generateProceduralLuma, DEFAULT_FONT_FAMILY, clamp, clamp01
} from '@/utils/asciiFluid.js'
import { createVideoSampler } from '@/utils/asciiVideo.js'

const props = defineProps({
  fullWidth: Boolean,
  charset: {type:String, default:'—>o'},
  color: {type:String, default:'var(--aura-muted, currentColor)'},
  opacity: {type:Number, default:.65},
  charWidth: {type:Number, default:14},
  fontSize: Number,
  cellHeight: Number,
  cellPadding: {type:[Number,Object], default:0},
  fps: {type:Number, default:30},
  fluid: {type:Object, default:()=>({})},
  safeArea: {type:Object, default:()=>({enabled:false, className:'ascii-safe-area', fadeSize:24})},
  contrast: {type:Number, default:1},
  gamma: {type:Number, default:1},
  invertLuma: Boolean,
  mapping: Function,
  lumaOverride: Number,
  videoSelector: {type:String, default:'video'},
  disableHover: Boolean,
  disableClick: Boolean,
  disableDrag: Boolean,
  isVisible: {type:Boolean, default:true}
})
const emit = defineEmits(['video-fallback'])
const containerRef = ref(null), canvasRef = ref(null)
let ctx, atlas, atlasCtx, fluid, video, resizeObserver, intersectionObserver, mutationObserver, motion
let lumaOptions, settings, options, geometry, density, luminance, charset, safeAlpha
let raf = null, lastFrame = 0, lastRender = 0, inView = true, disposed = false, layoutDirty = true
let pointer = null, pressed = null, dragging = false
let splashes = [], atlasKey = '', safeDirty = true
let diagnosticPanel, diagnosticTimer, pointerEvents = 0, injections = 0, pointerType = 'none'
const safeCache = {enabled:false, fadeSize:24, rects:[]}
const finite = (value, fallback) => Number.isFinite(value) ? value : fallback
const state = value => {if(canvasRef.value) canvasRef.value.dataset.asciiState = value}
const allowed = () => !disposed && ctx && fluid && options.enabled && settings.isVisible && inView && !document.hidden && !motion.matches
const clearCanvas = () => {if(ctx && geometry)ctx.clearRect(0,0,geometry.widthCss,geometry.heightCss)}

function stop(clear = true) {
  if(raf !== null)cancelAnimationFrame(raf)
  raf = null;lastFrame = 0;lastRender = 0;pointer = null;pressed = null;dragging = false
  video?.pause()
  if(clear){fluid?.clear();splashes.length = 0;clearCanvas()}
  state('paused')
}
function wake() {
  if(!allowed() || raf !== null || (!fluid.active && !splashes.length))return
  lastFrame = performance.now();lastRender = 0
  video.resume();state('running');raf = requestAnimationFrame(frame)
}
function updateSafeAreas() {
  safeDirty = false
  safeCache.enabled = !!settings.safeArea?.enabled
  safeCache.fadeSize = Math.max(0,finite(settings.safeArea?.fadeSize,24))
  safeCache.rects.length = 0
  if(safeCache.enabled){
    const root = containerRef.value.parentElement, bounds = containerRef.value.getBoundingClientRect()
    const selector = settings.safeArea.selector || `.${CSS.escape(settings.safeArea.className || 'ascii-safe-area')}`
    try {
      const append = box => {
        if(box.width && box.height)safeCache.rects.push({left:box.left-bounds.left,top:box.top-bounds.top,right:box.right-bounds.left,bottom:box.bottom-bounds.top})
      }
      for(const element of root.querySelectorAll(selector)){
        if(settings.safeArea.textSelector && element.matches(settings.safeArea.textSelector)){
          // Block elements span their whole column. Protect actual text fragments,
          // leaving the empty space beside headings available for the effect.
          const walker = document.createTreeWalker(element,NodeFilter.SHOW_TEXT)
          const range = document.createRange()
          let node
          while((node = walker.nextNode())){
            if(!node.textContent.trim())continue
            range.selectNodeContents(node)
            for(const box of range.getClientRects())append(box)
          }
        } else append(element.getBoundingClientRect())
      }
    } catch { /* Invalid caller selector disables the mask, never the page. */ }
  }
  // Reuse per-cell alpha values rather than scanning DOM rectangles in the draw loop.
  for(let y=0;y<geometry.rows;y++)for(let x=0;x<geometry.cols;x++){
    safeAlpha[y*geometry.cols+x] = computeSafeAreaAlpha(safeCache,(x+.5)*geometry.cellWidth,(y+.5)*geometry.cellHeight)
  }
}
function rebuildAtlas() {
  if(!geometry)return
  const color = getComputedStyle(canvasRef.value).color
  const key = JSON.stringify([settings.charset,geometry.tileW,geometry.tileH,color])
  if(key === atlasKey)return
  atlasKey = key
  charset = Array.from(settings.charset || '—>o').slice(0,128)
  createGlyphAtlas({atlasCanvas:atlas,atlasCtx,charset,layout:geometry,fill:color})
}
function resize() {
  if(disposed || !ctx)return
  const box = containerRef.value.getBoundingClientRect()
  if(box.width<=0 || box.height<=0){stop();return}
  const dpr = Math.min(window.devicePixelRatio || 1,2)
  ctx.font = `100px ${DEFAULT_FONT_FAMILY}`
  const metrics = ctx.measureText('M')
  const aspect = ((metrics.actualBoundingBoxAscent || 80)+(metrics.actualBoundingBoxDescent || 20))/(metrics.width || 60)
  const cells = calculateCellDimensions({fontSize:settings.fontSize,charWidth:Math.max(4,finite(settings.charWidth,14)),cellPadding:settings.cellPadding,cellAspectRatio:aspect})
  const cellWidth = Math.max(cells.cellWidth,box.width/220)
  const cellHeight = Math.max(finite(settings.cellHeight,cells.cellHeight),4,box.height/160)
  const cols = Math.max(1,Math.ceil(box.width/cellWidth)),rows = Math.max(1,Math.ceil(box.height/cellHeight))
  geometry = {...cells,widthCss:box.width,heightCss:box.height,dpr,cols,rows,cellWidth,cellHeight,
    tileW:Math.max(1,Math.ceil(cells.drawCellWidth*dpr)),tileH:Math.max(1,Math.ceil(cells.drawCellHeight*dpr))}
  const canvas = canvasRef.value
  canvas.width = Math.max(1,Math.round(box.width*dpr));canvas.height = Math.max(1,Math.round(box.height*dpr))
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.imageSmoothingEnabled = false
  fluid = new FluidMask(Math.min(160,Math.max(3,Math.ceil(cols*options.resolutionScale))),Math.min(100,Math.max(3,Math.ceil(rows*options.resolutionScale))),options)
  density = new Float32Array(cols*rows);luminance = new Float32Array(cols*rows);safeAlpha = new Float32Array(cols*rows)
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)luminance[y*cols+x] = generateProceduralLuma(x,y,cols,rows)
  splashes.length = 0;pointer = null;pressed = null;safeDirty = true;layoutDirty = false
  video?.invalidate();rebuildAtlas();updateSafeAreas()
  if(raf === null)state(allowed() ? 'idle' : 'paused')
}
function advanceSplashes(now,dt) {
  const cellW = geometry.widthCss/(fluid.cols-1),cellH = geometry.heightCss/(fluid.rows-1)
  let count = 0
  for(let i=0;i<splashes.length;i++){
    const splash = splashes[i],duration = splash.radius/Math.max(1,240*options.splashVelocityScale)*1000
    const progress = clamp01((now-splash.start)/duration)
    if(progress>=1)continue
    const fade = 1-progress
    const radius = (1-Math.pow(fade,Math.max(.1,options.splashTravelEasePower)))*splash.radius
    const force = options.forceScale*options.splashForceScale*options.splashVelocityScale*Math.pow(fade,options.splashForceDecayPower)*20*dt*30
    const ink = options.splashDensity*Math.pow(fade,options.splashDensityDecayPower)*dt*30
    fluid.injectSplashRing(splash.x*(fluid.cols-1),splash.y*(fluid.rows-1),force,ink,radius,options.splashThicknessPx,options.splashRandomness,splash.seed,cellW,cellH,progress)
    splashes[count++] = splash
  }
  splashes.length = count
}
function draw() {
  const g = geometry
  clearCanvas()
  if(safeDirty)updateSafeAreas()
  const pixels = Number.isFinite(settings.lumaOverride) ? null : video.sample(g.cols,g.rows,settings.videoSelector)
  canvasRef.value.dataset.asciiLuma = Number.isFinite(settings.lumaOverride) ? 'constant' : video.state
  fluid.resampleDensity(density,g.cols,g.rows)
  for(let y=0;y<g.rows;y++)for(let x=0;x<g.cols;x++){
    const i = y*g.cols+x,ink = density[i]
    if(ink<.012 || safeAlpha[i]<=0)continue
    let luma = Number.isFinite(settings.lumaOverride) ? clamp01(settings.lumaOverride) : luminance[i]
    const p = i*4
    if(pixels && pixels[p+3])luma = (.2126*pixels[p]+.7152*pixels[p+1]+.0722*pixels[p+2])/255
    // Fluid density selects the glyph and opacity; no cursor-distance-only glyph zones.
    const index = mapLumaToCharIndex(clamp01(ink*1.8)*(.6+.4*luma),charset.length,lumaOptions)
    ctx.globalAlpha = clamp01(settings.opacity)*safeAlpha[i]*clamp01(ink*2.4)
    ctx.drawImage(atlas,index*g.tileW,0,g.tileW,g.tileH,x*g.cellWidth+g.padX,y*g.cellHeight+g.padY,g.drawCellWidth,g.drawCellHeight)
  }
  ctx.globalAlpha = 1
}
function frame(now) {
  raf = null
  if(!allowed()){stop();return}
  const interval = 1000/clamp(finite(settings.fps,30),1,60)
  if(now-lastRender>=interval){
    const dt = Math.min(.1,Math.max(0,(now-lastFrame)/1000))
    lastFrame = now;lastRender = now-((now-lastRender)%interval)
    advanceSplashes(now,dt);fluid.step(dt);draw()
  }
  if(fluid.active || splashes.length)raf = requestAnimationFrame(frame)
  else {clearCanvas();video.pause();lastFrame = 0;state('idle')}
}
function position(event) {
  if(!allowed() || event.isPrimary === false || document.querySelector('dialog[open]'))return null
  const r = containerRef.value.getBoundingClientRect()
  const x = event.clientX-r.left,y = event.clientY-r.top
  return x>=0 && y>=0 && x<=r.width && y<=r.height ? {x,y,time:event.timeStamp} : null
}
function onMove(event) {
  pointerEvents++;pointerType = event.pointerType || 'unspecified'
  if(event.pointerType && event.pointerType!=='mouse')return // Touch is tap-only; native scroll stays untouched.
  const p = position(event)
  if(!p){pointer = null;return}
  if(pressed && pressed.id===event.pointerId && Math.hypot(p.x-pressed.x,p.y-pressed.y)>=options.dragThresholdPx)dragging = true
  const isDrag = !!pressed && pressed.id===event.pointerId && dragging
  const previous = pointer;pointer = p
  if(!previous || (isDrag ? settings.disableDrag : settings.disableHover))return
  const dx = p.x-previous.x,dy = p.y-previous.y,distance = Math.hypot(dx,dy)
  if(distance<.05)return
  const impulse = pointerImpulse(dx,dy,(p.time-previous.time)/1000,isDrag,options)
  if(impulse.radius<=0 || impulse.density<=0)return
  const sx = (fluid.cols-1)/geometry.widthCss,sy = (fluid.rows-1)/geometry.heightCss
  const steps = Math.min(24,Math.max(1,Math.ceil(distance/Math.max(6,impulse.radius*.5))))
  for(let i=1;i<=steps;i++){
    const t = i/steps
    fluid.inject((previous.x+dx*t)*sx,(previous.y+dy*t)*sy,impulse.radius*Math.min(sx,sy),impulse.vx*sx/steps,impulse.vy*sy/steps,impulse.density/Math.sqrt(steps))
  }
  injections++
  wake()
}
function onDown(event) {
  if(event.button!==0 || (settings.disableClick && settings.disableDrag))return
  const p = position(event)
  if(!p)return
  pressed = {...p,id:event.pointerId};pointer = p;dragging = false
}
function onUp(event) {
  if(!pressed || pressed.id!==event.pointerId)return
  const movement = Math.hypot(event.clientX-containerRef.value.getBoundingClientRect().left-pressed.x,event.clientY-containerRef.value.getBoundingClientRect().top-pressed.y)
  const click = !dragging && movement<Math.max(6,options.dragThresholdPx)
  pressed = null;dragging = false
  const p = position(event)
  if(!click || !p || settings.disableClick || options.splashRangePx<=0 || options.splashVelocityScale<=0)return
  if(splashes.length>=8)splashes.shift()
  splashes.push({x:p.x/geometry.widthCss,y:p.y/geometry.heightCss,start:performance.now(),seed:Math.random()*1000,radius:options.splashRangePx})
  wake()
}
function cancelPointer() {pointer = null;pressed = null;dragging = false}
function invalidate() {safeDirty = true;video?.invalidate();cancelPointer()}
function visibility() {
  if(document.hidden){stop();return}
  if(layoutDirty)resize()
  // A resumed view starts clean, never integrates a long hidden-tab dt.
  state(allowed() ? 'idle' : 'paused')
}
function reducedMotion() {stop();state(allowed() ? 'idle' : 'paused')}
function configure(next) {
  const old = settings
  settings = {...next};options = resolveMaskOptions(settings.fluid)
  lumaOptions = {contrast:finite(settings.contrast,1),gamma:Math.max(.01,finite(settings.gamma,1)),invert:settings.invertLuma,mapping:settings.mapping}
  if(!ctx)return
  const changesSize = !old || old.charWidth!==settings.charWidth || old.cellHeight!==settings.cellHeight || old.fontSize!==settings.fontSize || JSON.stringify(old.cellPadding)!==JSON.stringify(settings.cellPadding) || fluid?.options.resolutionScale!==options.resolutionScale
  if(changesSize)resize()
  else {fluid.options = options;rebuildAtlas();safeDirty = true}
  if(!allowed())stop()
  else {state(fluid.active ? 'running' : 'idle');wake()}
}
function startDiagnostics() {
  if(!new URLSearchParams(location.search).has('asciiDebug'))return
  // Local, opt-in debugging only: no telemetry or persistent storage.
  diagnosticPanel = document.createElement('output')
  diagnosticPanel.dataset.asciiDiagnostics = ''
  diagnosticPanel.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:20000;pointer-events:none;color:var(--aura-text);font:12px/1.6 monospace;white-space:pre-wrap;max-width:calc(100vw - 24px);border:1px solid currentColor;padding:8px;text-shadow:0 1px 3px #000'
  document.body.append(diagnosticPanel)
  const update = () => {
    const reduced = motion?.matches ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const reason = !ctx ? 'Canvas 2D unavailable' : reduced ? 'REDUCED MOTION: system/browser disables animation'
      : document.hidden ? 'Tab hidden' : !inView ? 'Outside visible area' : !settings?.isVisible ? 'isVisible=false'
      : !options?.enabled ? 'fluid.enabled=false' : document.querySelector('dialog[open]') ? 'Dialog open' : 'NONE'
    diagnosticPanel.textContent = ['ASCII diagnostic v2', 'State: '+(canvasRef.value?.dataset.asciiState || 'init'), 'Blocked: '+reason,
      'Pointer events: '+pointerEvents+' ('+pointerType+')', 'Injected movements: '+injections,
      'Canvas: '+(geometry ? Math.round(geometry.widthCss)+' x '+Math.round(geometry.heightCss) : 'no size')].join('\n')
  }
  update();diagnosticTimer = window.setInterval(update,400)
}
onMounted(() => {
  const canvas = canvasRef.value
  startDiagnostics()
  ctx = canvas.getContext('2d',{alpha:true})
  if(!ctx){state('unsupported');return}
  atlas = document.createElement('canvas');atlasCtx = atlas.getContext('2d')
  motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  video = createVideoSampler(containerRef.value.parentElement,detail=>emit('video-fallback',detail),containerRef.value)
  configure({...props})
  resizeObserver = new ResizeObserver(()=>{layoutDirty = true;if(!document.hidden)resize()})
  resizeObserver.observe(containerRef.value)
  intersectionObserver = new IntersectionObserver(entries=>{
    inView = entries[0].isIntersecting
    if(!inView)stop()
    else {if(layoutDirty)resize();state(allowed() ? 'idle' : 'paused')}
  })
  intersectionObserver.observe(containerRef.value)
  mutationObserver = new MutationObserver(invalidate)
  mutationObserver.observe(containerRef.value.parentElement,{childList:true,subtree:true,characterData:true})
  window.addEventListener('pointermove',onMove,{passive:true})
  window.addEventListener('pointerdown',onDown,{passive:true})
  window.addEventListener('pointerup',onUp,{passive:true})
  window.addEventListener('pointercancel',cancelPointer,{passive:true})
  window.addEventListener('blur',cancelPointer)
  window.addEventListener('resize',invalidate,{passive:true})
  document.addEventListener('scroll',invalidate,{passive:true,capture:true})
  document.addEventListener('visibilitychange',visibility)
  motion.addEventListener('change',reducedMotion)
  document.fonts?.ready.then(()=>{if(!disposed)resize()})
})
watch(()=>({...props}),configure,{deep:true,flush:'post'})
onBeforeUnmount(() => {
  disposed = true;stop()
  clearInterval(diagnosticTimer);diagnosticPanel?.remove()
  resizeObserver?.disconnect();intersectionObserver?.disconnect();mutationObserver?.disconnect()
  window.removeEventListener('pointermove',onMove);window.removeEventListener('pointerdown',onDown)
  window.removeEventListener('pointerup',onUp);window.removeEventListener('pointercancel',cancelPointer)
  window.removeEventListener('blur',cancelPointer);window.removeEventListener('resize',invalidate)
  document.removeEventListener('scroll',invalidate,true);document.removeEventListener('visibilitychange',visibility)
  motion?.removeEventListener('change',reducedMotion);video?.destroy()
  if(atlas){atlas.width = 0;atlas.height = 0}
  if(canvasRef.value){canvasRef.value.width = 0;canvasRef.value.height = 0}
  ctx = null;atlasCtx = null;atlas = null;fluid = null;density = null;luminance = null;safeAlpha = null;splashes.length = 0
})
</script>

<template>
  <div ref="containerRef" class="ascii-hover-container" :class="{ 'ascii-full-width': fullWidth }" aria-hidden="true">
    <canvas ref="canvasRef" class="ascii-canvas" data-ascii-overlay data-ascii-revision="diagnostic-v2" data-ascii-state="init" aria-hidden="true" :style="{color}" />
  </div>
</template>

<style scoped>
.ascii-hover-container { position:absolute; inset:0; overflow:hidden; pointer-events:none; z-index:2; }
.ascii-full-width { left:calc(50% - 50vw); right:auto; width:100vw; }
.ascii-canvas { position:absolute; inset:0; display:block; width:100%; height:100%; pointer-events:none; user-select:none; }
</style>
