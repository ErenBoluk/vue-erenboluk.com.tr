import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  FluidMask,
  resolveMaskOptions,
  sampleBilinear,
  computeSafeAreaAlpha,
  calculateCellDimensions,
  mapLumaToCharIndex,
  generateProceduralLuma
} from '../../src/utils/asciiFluid.js'

const max = array => array.reduce((a, b) => Math.max(a, Math.abs(b)), 0)

test('empty mask stays empty, typed fields and bilinear sampling', () => {
  const f = new FluidMask(30, 20)
  for (const name of ['density', 'density0', 'velX', 'velY', 'velX0', 'velY0', 'pressure', 'divergence']) {
    assert.ok(f[name] instanceof Float32Array)
  }
  f.step(0.03)
  assert.equal(max(f.density), 0)
  assert.equal(sampleBilinear(new Float32Array([0, 2, 2, 4]), 2, 2, 0.5, 0.5), 2)
})

test('hover advects density, remains finite and decays completely', () => {
  const f = new FluidMask(40, 30)
  f.inject(12, 15, 3, 10, 0, 0.8)
  assert.ok(max(f.density) > 0)
  const before = f.density.slice()
  f.step(0.033)
  assert.notDeepEqual(f.density, before)
  for (let i = 0; i < 700; i++) f.step(0.033)
  assert.equal(max(f.density), 0)
  assert.ok(f.velX.every(Number.isFinite))
})

test('projection reduces divergence and dt is bounded', () => {
  const f = new FluidMask(40, 30, { densityDissipation: 0 })
  f.inject(20, 15, 4, 20, 10, 1)
  const divergence = () => {
    let sum = 0
    for (let y = 1; y < f.rows - 1; y++) {
      for (let x = 1; x < f.cols - 1; x++) {
        const i = y * f.cols + x
        sum += Math.abs(f.velX[i + 1] - f.velX[i - 1] + f.velY[i + f.cols] - f.velY[i - f.cols])
      }
    }
    return sum
  }
  const before = divergence()
  f.projectVelocity()
  assert.ok(divergence() < before)

  const a = new FluidMask(40, 30)
  const b = new FluidMask(40, 30)
  a.inject(20, 15, 3, 10, 2, 1)
  b.inject(20, 15, 3, 10, 2, 1)
  a.step(100)
  b.step(0.1)
  assert.deepEqual(a.density, b.density)
})

test('decayMs only supplies dissipation when not explicitly provided', () => {
  assert.equal(resolveMaskOptions({ decayMs: 2000 }).densityDissipation, 0.5)
  assert.equal(resolveMaskOptions({ decayMs: 2000, densityDissipation: 2 }).densityDissipation, 2)
  assert.equal(resolveMaskOptions({ decayMs: 0 }).densityDissipation, 0)
})

test('injectSplashRing adds outward velocity and density within ring band', () => {
  const f = new FluidMask(50, 40)
  f.injectSplashRing(25, 20, 5, 0.6, 60, 20, 0.1, 42, 10, 10, 0.5)
  assert.ok(max(f.density) > 0)
  assert.ok(max(f.velX) > 0)
  assert.ok(max(f.velY) > 0)
})

test('resampleDensity projects simulation density to target cell grid', () => {
  const f = new FluidMask(20, 20)
  f.inject(10, 10, 4, 0, 0, 1)
  const target = new Float32Array(40 * 40)
  f.resampleDensity(target, 40, 40)
  assert.ok(max(target) > 0)
})

test('computeSafeAreaAlpha returns 0 inside protected rect and smooth falloff outside', () => {
  const safeArea = {
    enabled: true,
    fadeSize: 20,
    rects: [{ left: 50, top: 50, right: 150, bottom: 100 }]
  }
  assert.equal(computeSafeAreaAlpha(safeArea, 80, 80), 0)
  assert.equal(computeSafeAreaAlpha(safeArea, 50, 50), 0)
  assert.equal(computeSafeAreaAlpha(safeArea, 170, 75), 1) // 20px away = dist / 20 = 1
  assert.equal(computeSafeAreaAlpha(safeArea, 160, 75), 0.5) // 10px away = 0.5
})

test('mapLumaToCharIndex correctly respects contrast, gamma and mapping', () => {
  const len = 8
  assert.equal(mapLumaToCharIndex(0, len), 0)
  assert.equal(mapLumaToCharIndex(1, len), 7)
  assert.equal(mapLumaToCharIndex(0.5, len), 4)
  assert.equal(mapLumaToCharIndex(0, len, { invert: true }), 7)
  assert.equal(mapLumaToCharIndex(1, len, { invert: true }), 0)
})

test('calculateCellDimensions handles font and padding correctly', () => {
  const geom = calculateCellDimensions({ fontSize: 20, charWidth: 12, cellAspectRatio: 5 / 3, cellPadding: { x: 2, y: 3 } })
  assert.equal(geom.glyphHeight, 20)
  assert.equal(geom.glyphWidth, 12)
  assert.equal(geom.cellWidth, 16)
  assert.equal(geom.cellHeight, 26)
})

test('generateProceduralLuma returns stable bounded luminance', () => {
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const luma = generateProceduralLuma(c, r, 10, 10, 0)
      assert.ok(luma >= 0 && luma <= 1)
    }
  }
})

test('pointer impulse respects disabled effects and boosts a fast drag', async () => {
  const { pointerImpulse } = await import('../../src/utils/asciiFluid.js')
  const normal = pointerImpulse(100, 0, .05, false, resolveMaskOptions())
  const drag = pointerImpulse(100, 0, .05, true, resolveMaskOptions())
  assert.ok(normal.vx > 0)
  assert.ok(drag.radius > normal.radius)
  assert.ok(drag.density > normal.density)
  const disabled = pointerImpulse(100, 0, .05, true, resolveMaskOptions({forceScale:0,strength:0,hoverRadiusPx:0,dragBoostMaxPx:0}))
  assert.equal(disabled.vx,0);assert.equal(disabled.density,0);assert.equal(disabled.radius,0)
})

test('invalid physical options are bounded and custom mapping returns integer indices', () => {
  const options=resolveMaskOptions({iterations:Infinity,strength:NaN,resolutionScale:0,projectIterations:-4})
  assert.ok(Number.isFinite(options.iterations));assert.ok(Number.isFinite(options.strength))
  assert.ok(options.resolutionScale>=.2);assert.equal(options.projectIterations,0)
  assert.equal(mapLumaToCharIndex(.5,4,{mapping:()=>1.7}),1)
  assert.equal(mapLumaToCharIndex(.5,4,{mapping:()=>NaN}),0)
})
