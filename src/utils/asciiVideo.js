// Video is optional: it only provides glyph luminance, never a visible backdrop.
export function videoPlacement(sourceWidth, sourceHeight, width, height, fit = 'cover', position = '50% 50%') {
  let drawWidth = width, drawHeight = height
  if (fit !== 'fill') {
    let scale = fit === 'contain' ? Math.min(width / sourceWidth, height / sourceHeight)
      : Math.max(width / sourceWidth, height / sourceHeight)
    if (fit === 'none') scale = 1
    if (fit === 'scale-down') scale = Math.min(1, width / sourceWidth, height / sourceHeight)
    drawWidth = sourceWidth * scale; drawHeight = sourceHeight * scale
  }
  const parts = position.trim().split(/\s+/)
  if (parts.length === 1 && /^(top|bottom)$/.test(parts[0])) parts.unshift('50%')
  if (/^(top|bottom)$/.test(parts[0]) && /^(left|right|center)$/.test(parts[1])) parts.reverse()
  const offset = (value = '50%', extra) => {
    if (value.endsWith('px')) return parseFloat(value) || 0
    const fraction = {left:0,top:0,center:.5,right:1,bottom:1}[value]
    return extra * (fraction ?? (value.endsWith('%') ? (parseFloat(value) || 0) / 100 : .5))
  }
  return {x:offset(parts[0], width-drawWidth), y:offset(parts[1], height-drawHeight), width:drawWidth, height:drawHeight}
}

export function createVideoSampler(container, warn, viewport = container) {
  let video, frameId = null, paused = true, dirty = true, tainted = false, pixels = null
  const scratch = document.createElement('canvas')
  let ctx = scratch.getContext('2d', {willReadFrequently:true})
  const cancel = () => {
    if (frameId !== null) video?.cancelVideoFrameCallback?.(frameId)
    frameId = null
  }
  const schedule = () => {
    if (paused || frameId !== null || !video?.requestVideoFrameCallback || tainted) return
    frameId = video.requestVideoFrameCallback(() => {frameId = null;dirty = true;schedule()})
  }
  return {
    get state() { return tainted ? 'fallback-tainted' : video?.readyState >= 2 ? 'video' : 'procedural' },
    resume() {paused = false;schedule()},
    pause() {paused = true;cancel()},
    invalidate() {dirty = true},
    sample(cols, rows, selector = 'video') {
      let found
      try {found = container.querySelector(selector)} catch {return null}
      if (found?.tagName !== 'VIDEO') found = null
      if (found !== video) {cancel();video = found;tainted = false;dirty = true;pixels = null;schedule()}
      if (!ctx || !video || video.readyState < 2 || !video.videoWidth || tainted) return null
      if (scratch.width !== cols || scratch.height !== rows) {scratch.width = cols;scratch.height = rows;dirty = true}
      if (!dirty && video.requestVideoFrameCallback) return pixels
      dirty = false
      try {
        const bounds = viewport.getBoundingClientRect(), box = video.getBoundingClientRect()
        if (!bounds.width || !bounds.height || !box.width || !box.height) return null
        const style = getComputedStyle(video)
        const fit = videoPlacement(video.videoWidth, video.videoHeight, box.width, box.height, style.objectFit, style.objectPosition)
        ctx.setTransform(cols / bounds.width, 0, 0, rows / bounds.height, 0, 0)
        ctx.clearRect(0, 0, bounds.width, bounds.height)
        ctx.save()
        ctx.beginPath();ctx.rect(box.left-bounds.left,box.top-bounds.top,box.width,box.height);ctx.clip()
        ctx.drawImage(video,box.left-bounds.left+fit.x,box.top-bounds.top+fit.y,fit.width,fit.height)
        ctx.restore()
        pixels = ctx.getImageData(0, 0, cols, rows).data
        return pixels
      } catch (error) {
        tainted = true;pixels = null;cancel()
        // Resizing also restores origin-clean state after a CORS-tainted video.
        scratch.width = 0;scratch.height = 0
        warn?.({reason:error.name === 'SecurityError' ? 'cross-origin-video' : 'video-sampling', error})
        return null
      }
    },
    destroy() {paused = true;cancel();video = null;pixels = null;scratch.width = 0;scratch.height = 0;ctx = null}
  }
}
