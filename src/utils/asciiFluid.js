/**
 * ASCII Stable-Fluid Simulation & Glyph Engine
 * Reverse-engineered & enhanced from OpenAI Codex ASCII background architecture.
 *
 * All simulation arrays are standard Float32Array buffers.
 * Zero Vue reactivity overhead on animation frames.
 */

export const maskDefaults = Object.freeze({
  enabled: true,
  resolutionScale: 0.6,
  velocityDissipation: 1.2,
  densityDissipation: 0.8,
  diffusion: 0.2,
  iterations: 3,
  forceScale: 0.5,
  hoverRadiusPx: 28,
  strength: 0.6,
  project: true,
  projectIterations: 8,
  splashRangePx: 184,
  splashVelocityScale: 3,
  splashForceScale: 2,
  splashDensity: 0.12,
  splashRandomness: 0.14,
  splashThicknessPx: 100,
  splashTravelEasePower: 2.5,
  splashForceDecayPower: 1.2,
  splashDensityDecayPower: 2,
  dragBoostScale: 0.03,
  dragBoostMaxPx: 60,
  dragThresholdPx: 6
})

export const DEFAULT_FONT_FAMILY = 'SF Mono, Consolas, Liberation Mono, ui-monospace, monospace'
export const DEFAULT_CELL_ASPECT_RATIO = 5 / 3

export function clamp(v, low, high) {
  return Math.min(high, Math.max(low, v))
}

export function clamp01(v) {
  return clamp(v, 0, 1)
}

export function smoothstep(t) {
  const c = clamp01(t)
  return c * c * (3 - 2 * c)
}

export function resolveMaskOptions(options = {}) {
  const resolved = { ...maskDefaults, ...options }
  if (options.densityDissipation === undefined && Number.isFinite(options.decayMs)) {
    resolved.densityDissipation = options.decayMs > 0 ? 1000 / options.decayMs : 0
  }
  for (const [key, fallback] of Object.entries(maskDefaults)) {
    if (typeof fallback === 'number') resolved[key] = Number.isFinite(resolved[key]) ? Math.max(0, resolved[key]) : fallback
  }
  resolved.resolutionScale = clamp(resolved.resolutionScale, .2, 1)
  resolved.iterations = Math.min(20, Math.round(resolved.iterations))
  resolved.projectIterations = Math.min(40, Math.round(resolved.projectIterations))
  resolved.strength = clamp01(resolved.strength)
  resolved.splashRandomness = clamp01(resolved.splashRandomness)
  resolved.splashDensity = clamp01(resolved.splashDensity)
  return resolved
}

/** Pixel-space input; converted to grid-space by the component. */
export function pointerImpulse(dx, dy, seconds, dragging, options) {
  const dt = clamp(seconds, .001, .05)
  const speed = Math.min(2000, Math.hypot(dx, dy) / dt)
  const boost = dragging ? Math.min(options.dragBoostMaxPx, speed * options.dragBoostScale) : 0
  const scale = Math.min(1, 2000 / Math.max(1, Math.hypot(dx, dy) / dt))
  return {
    vx: dx / dt * options.forceScale * scale,
    vy: dy / dt * options.forceScale * scale,
    radius: options.hoverRadiusPx + boost,
    density: options.strength * (dragging ? 1.5 : 1)
  }
}

/**
 * Bilinear interpolation on a 1D flattened 2D grid
 */
export function sampleBilinear(field, cols, rows, x, y) {
  const cx = clamp(x, 0, cols - 1)
  const cy = clamp(y, 0, rows - 1)
  const x0 = Math.floor(cx)
  const y0 = Math.floor(cy)
  const x1 = Math.min(x0 + 1, cols - 1)
  const y1 = Math.min(y0 + 1, rows - 1)
  const tx = cx - x0
  const ty = cy - y0

  const i00 = y0 * cols + x0
  const i10 = y0 * cols + x1
  const i01 = y1 * cols + x0
  const i11 = y1 * cols + x1

  const top = field[i00] + (field[i10] - field[i00]) * tx
  const bottom = field[i01] + (field[i11] - field[i01]) * tx
  return top + (bottom - top) * ty
}

/**
 * Gauss-Seidel iterative diffusion solver matching Codex kod.js
 */
function diffuseField(target, source, rate, iterations, width, height) {
  if (iterations <= 0 || rate <= 0) {
    target.set(source)
    return
  }
  target.set(source)
  const denom = 1 / (1 + 4 * rate)
  for (let iter = 0; iter < iterations; iter++) {
    for (let y = 0; y < height; y++) {
      const yOffset = y * width
      const upOffset = Math.max(0, y - 1) * width
      const downOffset = Math.min(height - 1, y + 1) * width
      for (let x = 0; x < width; x++) {
        const left = target[yOffset + Math.max(0, x - 1)]
        const right = target[yOffset + Math.min(width - 1, x + 1)]
        const up = target[upOffset + x]
        const down = target[downOffset + x]
        target[yOffset + x] = (source[yOffset + x] + rate * (left + right + up + down)) * denom
      }
    }
  }
}

/**
 * Pressure solve & divergence reduction (Poisson solver)
 */
function projectField(velX, velY, pressure, divergence, iterations, width, height) {
  if (iterations <= 0) return

  // Calculate divergence
  for (let y = 0; y < height; y++) {
    const yOffset = y * width
    const upOffset = Math.max(0, y - 1) * width
    const downOffset = Math.min(height - 1, y + 1) * width
    for (let x = 0; x < width; x++) {
      const right = velX[yOffset + Math.min(width - 1, x + 1)]
      const left = velX[yOffset + Math.max(0, x - 1)]
      const down = velY[downOffset + x]
      const up = velY[upOffset + x]
      divergence[yOffset + x] = -0.5 * (right - left + down - up)
      pressure[yOffset + x] = 0
    }
  }

  // Gauss-Seidel pressure relaxation
  for (let iter = 0; iter < iterations; iter++) {
    for (let y = 0; y < height; y++) {
      const yOffset = y * width
      const upOffset = Math.max(0, y - 1) * width
      const downOffset = Math.min(height - 1, y + 1) * width
      for (let x = 0; x < width; x++) {
        const left = pressure[yOffset + Math.max(0, x - 1)]
        const right = pressure[yOffset + Math.min(width - 1, x + 1)]
        const up = pressure[upOffset + x]
        const down = pressure[downOffset + x]
        pressure[yOffset + x] = (divergence[yOffset + x] + left + right + up + down) * 0.25
      }
    }
  }

  // Subtract gradient of pressure from velocity field
  for (let y = 0; y < height; y++) {
    const yOffset = y * width
    const upOffset = Math.max(0, y - 1) * width
    const downOffset = Math.min(height - 1, y + 1) * width
    for (let x = 0; x < width; x++) {
      const right = pressure[yOffset + Math.min(width - 1, x + 1)]
      const left = pressure[yOffset + Math.max(0, x - 1)]
      const down = pressure[downOffset + x]
      const up = pressure[upOffset + x]
      velX[yOffset + x] -= 0.5 * (right - left)
      velY[yOffset + x] -= 0.5 * (down - up)
    }
  }
}

/**
 * Semi-Lagrangian Advection
 */
function advectField(target, source, u, v, dt, width, height) {
  for (let y = 0; y < height; y++) {
    const yOffset = y * width
    for (let x = 0; x < width; x++) {
      const idx = yOffset + x
      const prevX = x - u[idx] * dt
      const prevY = y - v[idx] * dt
      target[idx] = sampleBilinear(source, width, height, prevX, prevY)
    }
  }
}

/**
 * Low-resolution 2D Stable-Fluid Solver
 */
export class FluidMask {
  constructor(cols, rows, options) {
    this.cols = Math.max(3, Math.floor(cols))
    this.rows = Math.max(3, Math.floor(rows))
    this.size = this.cols * this.rows
    this.options = resolveMaskOptions(options)

    for (const key of ['density', 'density0', 'velX', 'velY', 'velX0', 'velY0', 'pressure', 'divergence']) {
      this[key] = new Float32Array(this.size)
    }
    this.active = false
  }

  get width() {
    return this.cols
  }

  get height() {
    return this.rows
  }

  clear() {
    for (const key of ['density', 'density0', 'velX', 'velY', 'velX0', 'velY0', 'pressure', 'divergence']) {
      this[key].fill(0)
    }
    this.active = false
  }

  /**
   * Radial pointer impulse injection (hover / drag)
   */
  inject(cx, cy, radius, vx, vy, density) {
    const { cols, rows } = this
    radius = Math.max(0.8, radius)
    const left = Math.max(0, Math.floor(cx - radius))
    const right = Math.min(cols - 1, Math.ceil(cx + radius))
    const top = Math.max(0, Math.floor(cy - radius))
    const bottom = Math.min(rows - 1, Math.ceil(cy + radius))

    for (let y = top; y <= bottom; y++) {
      const yOffset = y * cols
      for (let x = left; x <= right; x++) {
        const dist = Math.hypot(x - cx, y - cy)
        if (dist >= radius) continue
        const weight = smoothstep(1 - dist / radius)
        const idx = yOffset + x
        this.density[idx] = clamp01(this.density[idx] + density * weight)
        this.velX[idx] = clamp(this.velX[idx] + vx * weight, -120, 120)
        this.velY[idx] = clamp(this.velY[idx] + vy * weight, -120, 120)
        this.active = true
      }
    }
  }

  /**
   * Irregular expanding splash wave ring from Codex kod.js (function w)
   */
  injectSplashRing(cx, cy, force, density, targetRadiusPx, thicknessPx, randomness, seed, cellW, cellH, progress) {
    if (targetRadiusPx <= 0 || thicknessPx <= 0 || (density <= 0 && force <= 0) || cellW <= 0 || cellH <= 0) return

    const { cols, rows, velX, velY, density: dens } = this
    const maxBound = targetRadiusPx * (1 + clamp01(randomness)) + thicknessPx
    const spanX = maxBound / cellW
    const spanY = maxBound / cellH

    const startX = Math.max(0, Math.floor(cx - spanX))
    const endX = Math.min(cols - 1, Math.ceil(cx + spanX))
    const startY = Math.max(0, Math.floor(cy - spanY))
    const endY = Math.min(rows - 1, Math.ceil(cy + spanY))
    const randClamped = clamp01(randomness)

    for (let y = startY; y <= endY; y++) {
      const dyPx = (y - cy) * cellH
      const yOffset = y * cols
      for (let x = startX; x <= endX; x++) {
        const dxPx = (x - cx) * cellW
        const distPx = Math.hypot(dxPx, dyPx)
        const angle = Math.atan2(dyPx, dxPx)

        // Irregular perturbation in wave ring
        const wave = 0.5 * Math.sin(6 * angle + seed) + 0.25 * Math.sin(3 * angle + 0.05 * distPx + 0.3 * seed) + 0.5
        const progressFactor = 0.35 + 0.65 * progress
        const radiusMod = clamp(1 + randClamped * (2 * wave - 1) * progressFactor, 0.6, 1.6)
        const perturbedRadius = targetRadiusPx * radiusMod
        const diffPx = Math.abs(distPx - perturbedRadius)

        if (diffPx > thicknessPx) continue

        const falloff = smoothstep(1 - diffPx / thicknessPx)
        const scale = clamp(1 + randClamped * (2 * wave - 1) * progressFactor, 0.4, 2.2)
        const curForce = force * scale
        const curDensity = density * scale
        const idx = yOffset + x

        if (curForce !== 0 && distPx > 0) {
          const invDist = 1 / distPx
          velX[idx] += dxPx * invDist * curForce * falloff
          velY[idx] += dyPx * invDist * curForce * falloff
        }
        if (curDensity > 0) {
          dens[idx] = clamp01(dens[idx] + curDensity * falloff)
        }
        this.active = true
      }
    }
  }

  projectVelocity() {
    projectField(this.velX, this.velY, this.pressure, this.divergence, this.options.projectIterations, this.cols, this.rows)
  }

  /**
   * One simulation timestep (seconds)
   */
  step(seconds) {
    if (!this.active) return false

    const dt = clamp(seconds, 0, 0.1)
    const o = this.options

    // 1. Diffuse velocity
    diffuseField(this.velX0, this.velX, o.diffusion, o.iterations, this.cols, this.rows)
    diffuseField(this.velY0, this.velY, o.diffusion, o.iterations, this.cols, this.rows)
    this.velX.set(this.velX0)
    this.velY.set(this.velY0)

    // 2. Project velocity (remove divergence)
    if (o.project) this.projectVelocity()

    // 3. Advect velocity through itself
    this.velX0.set(this.velX)
    this.velY0.set(this.velY)
    advectField(this.velX, this.velX0, this.velX0, this.velY0, dt, this.cols, this.rows)
    advectField(this.velY, this.velY0, this.velX0, this.velY0, dt, this.cols, this.rows)

    // 4. Project velocity again
    if (o.project) this.projectVelocity()

    // 5. Advect density through velocity
    this.density0.set(this.density)
    advectField(this.density, this.density0, this.velX, this.velY, dt, this.cols, this.rows)

    // 6. Exponential dissipation
    const vd = o.velocityDissipation > 0 ? Math.exp(-o.velocityDissipation * dt) : 1
    const dd = o.densityDissipation > 0 ? Math.exp(-o.densityDissipation * dt) : 1

    let peak = 0
    for (let i = 0; i < this.size; i++) {
      this.velX[i] *= vd
      this.velY[i] *= vd
      this.density[i] *= dd
      if (this.density[i] > peak) peak = this.density[i]
    }

    // When fully dissipated, clear completely and allow loop to rest
    if (peak < 0.005) {
      this.clear()
      return false
    }

    return true
  }

  /**
   * Resamples density field to screen ASCII cells
   */
  resampleDensity(destArray, targetCols, targetRows) {
    if (!targetCols || !targetRows) return
    const scaleX = targetCols > 1 ? (this.cols - 1) / (targetCols - 1) : 0
    const scaleY = targetRows > 1 ? (this.rows - 1) / (targetRows - 1) : 0

    for (let r = 0; r < targetRows; r++) {
      const sampleY = r * scaleY
      const rowOffset = r * targetCols
      for (let c = 0; c < targetCols; c++) {
        const sampleX = c * scaleX
        const val = sampleBilinear(this.density, this.cols, this.rows, sampleX, sampleY)
        destArray[rowOffset + c] = clamp01(val)
      }
    }
  }
}

/**
 * Safe Area calculation for elements that should repel or mute the ASCII characters
 */
export function computeSafeAreaAlpha(safeArea, x, y) {
  if (!safeArea || !safeArea.enabled || !safeArea.rects || !safeArea.rects.length) return 1

  const { rects, fadeSize } = safeArea
  let minDistance = Infinity

  for (let i = 0; i < rects.length; i++) {
    const rect = rects[i]
    const dx = x < rect.left ? rect.left - x : x > rect.right ? x - rect.right : 0
    const dy = y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0
    const dist = Math.hypot(dx, dy)
    if (dist === 0) return 0
    if (dist < minDistance) minDistance = dist
  }

  if (fadeSize <= 0) return 1
  return clamp01(minDistance / fadeSize)
}

/**
 * Measure font metrics and calculate grid dimensions
 */
export function calculateCellDimensions({ fontSize, charWidth = 14, cellAspectRatio = DEFAULT_CELL_ASPECT_RATIO, cellPadding = 0 }) {
  const calculatedHeight = typeof fontSize === 'number' && Number.isFinite(fontSize)
    ? fontSize
    : Number.isFinite(charWidth)
      ? charWidth * cellAspectRatio
      : 14 * cellAspectRatio

  const glyphHeight = Math.max(1, calculatedHeight)
  const glyphWidth = Math.max(1, Number.isFinite(calculatedHeight / cellAspectRatio) ? calculatedHeight / cellAspectRatio : 14)

  const padX = Math.max(0, typeof cellPadding === 'object' && Number.isFinite(cellPadding?.x) ? cellPadding.x : (Number.isFinite(cellPadding) ? cellPadding : 0))
  const padY = Math.max(0, typeof cellPadding === 'object' && Number.isFinite(cellPadding?.y) ? cellPadding.y : (Number.isFinite(cellPadding) ? cellPadding : 0))

  const cellWidth = Math.max(1, glyphWidth + 2 * padX)
  const cellHeight = Math.max(1, glyphHeight + 2 * padY)

  return {
    glyphWidth,
    glyphHeight,
    cellWidth,
    cellHeight,
    drawCellWidth: glyphWidth,
    drawCellHeight: glyphHeight,
    padX,
    padY
  }
}

/**
 * Render all characters of charset onto an offscreen atlas canvas
 */
export function createGlyphAtlas({ atlasCanvas, atlasCtx, charset, layout, fill, fontFamily = DEFAULT_FONT_FAMILY }) {
  if (!layout.tileW || !layout.tileH || !charset || charset.length === 0) return false

  atlasCanvas.width = layout.tileW * charset.length
  atlasCanvas.height = layout.tileH
  atlasCtx.clearRect(0, 0, atlasCanvas.width, atlasCanvas.height)
  atlasCtx.imageSmoothingEnabled = false

  const baseFont = `400 ${layout.tileH}px ${fontFamily}`
  atlasCtx.font = baseFont

  const padding = Math.min(1, Math.floor(Math.min(layout.tileW, layout.tileH) / 2))
  const availW = Math.max(1, layout.tileW - 2 * padding)
  const availH = Math.max(1, layout.tileH - 2 * padding)

  let maxW = 0
  let maxAscent = 0
  let maxDescent = 0

  for (let i = 0; i < charset.length; i++) {
    const metrics = atlasCtx.measureText(charset[i])
    const w = metrics.width || 1
    const ascent = Number.isFinite(metrics.actualBoundingBoxAscent) ? metrics.actualBoundingBoxAscent : 0.8 * layout.tileH
    const descent = Number.isFinite(metrics.actualBoundingBoxDescent) ? metrics.actualBoundingBoxDescent : 0.2 * layout.tileH
    if (w > maxW) maxW = w
    if (ascent > maxAscent) maxAscent = ascent
    if (descent > maxDescent) maxDescent = descent
  }

  const totalH = maxAscent + maxDescent
  const scaleX = maxW > 0 ? (0.92 * availW) / maxW : 1
  const scaleY = totalH > 0 ? availH / totalH : 1
  const scale = Math.min(scaleX, scaleY)
  const adjustedFontPx = Number.isFinite(scale) && scale > 0 ? layout.tileH * scale : layout.tileH

  atlasCtx.font = `400 ${adjustedFontPx}px ${fontFamily}`
  atlasCtx.fillStyle = fill
  atlasCtx.textAlign = 'left'
  atlasCtx.textBaseline = 'alphabetic'

  const charMetrics = []
  let globalDescent = 0
  for (let i = 0; i < charset.length; i++) {
    const m = atlasCtx.measureText(charset[i])
    charMetrics[i] = m
    const d = Number.isFinite(m.actualBoundingBoxDescent) ? m.actualBoundingBoxDescent : 0
    if (d > globalDescent) globalDescent = d
  }

  const baselineY = Math.max(padding, Math.floor(padding + availH - globalDescent))

  for (let i = 0; i < charset.length; i++) {
    const char = charset[i]
    const m = charMetrics[i]
    const charW = m.width || 0
    const charLeft = Number.isFinite(m.actualBoundingBoxLeft) ? m.actualBoundingBoxLeft : 0
    const destX = Math.round(i * layout.tileW + padding + (availW - charW) / 2 + charLeft)
    atlasCtx.fillText(char, destX, baselineY)
  }

  return true
}

/**
 * Maps a 0..1 luminance value to a character index in charset
 */
export function mapLumaToCharIndex(luma, charsetLength, { contrast = 1, gamma = 1, invert = false, mapping = null } = {}) {
  let v = luma
  if (contrast !== 1) v = (v - 0.5) * contrast + 0.5
  v = clamp01(v)
  if (gamma !== 1) v = Math.pow(v, gamma)
  v = clamp01(v)
  if (invert) v = 1 - v

  const maxIndex = Math.max(0, charsetLength - 1)
  const index = mapping ? mapping(v) : Math.floor(v * (maxIndex + 1))
  return Number.isFinite(index) ? Math.floor(clamp(index, 0, maxIndex)) : 0
}

/**
 * Procedural luminance generator when no video element is present
 * Creates natural, organic distribution of glyphs
 */
export function generateProceduralLuma(col, row, cols, rows, timeSeconds = 0) {
  const normX = cols > 1 ? col / (cols - 1) : 0.5
  const normY = rows > 1 ? row / (rows - 1) : 0.5

  // Spatial harmonics
  const w1 = Math.sin(normX * 12.0 + timeSeconds * 0.2)
  const w2 = Math.cos(normY * 10.0 - timeSeconds * 0.15)
  const w3 = Math.sin((normX + normY) * 8.0 + timeSeconds * 0.25)
  const radial = Math.hypot(normX - 0.5, normY - 0.5) * 1.5

  // Combine into a balanced 0.2..0.85 luma spread
  const base = 0.5 + 0.22 * w1 * w2 + 0.15 * w3 - 0.1 * radial
  return clamp01(base)
}
