<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { dark } from '@/lib/theme'

export type Series = {
  name: string
  /** A CSS custom property, e.g. '--green', resolved at draw time so it follows the palette. */
  color: string
  values: (number | null)[]
}

const props = withDefaults(defineProps<{
  /** Epoch milliseconds, ascending, one per value. */
  times: number[]
  series: Series[]
  top: number
  format: (v: number) => string
  xFormat?: (ms: number) => string
  ticks?: number[]
  height?: number
  /** Chart pixel size in CSS pixels: every stroke lands on this grid. */
  px?: number
  axes?: boolean
  /** Dithered fill beneath the first series. */
  fill?: boolean
}>(), { height: 160, px: 2, axes: true, fill: true })

const plot = ref<HTMLDivElement>()
const canvas = ref<HTMLCanvasElement>()
const size = shallowRef({ w: 0, h: 0 })
const hover = ref<number | null>(null)

const from = computed(() => props.times[0] ?? 0)
const to = computed(() => props.times.at(-1) ?? 1)

/** Samples farther apart than this are a gap in reporting, not a flat line. */
const maxGap = computed(() => {
  const deltas = props.times.slice(1).map((t, i) => t - props.times[i]!).sort((a, b) => a - b)
  return (deltas[deltas.length >> 1] ?? Infinity) * 3
})

function draw() {
  const el = canvas.value
  const { w, h } = size.value
  if (!el || !w || !h) return
  const W = Math.floor(w / props.px)
  const H = Math.floor(h / props.px)
  el.width = W
  el.height = H
  el.style.width = `${W * props.px}px`
  el.style.height = `${H * props.px}px`
  const ctx = el.getContext('2d')!
  ctx.clearRect(0, 0, W, H)
  const css = getComputedStyle(el)

  // Dotted quarter lines.
  if (props.axes) {
    ctx.fillStyle = css.getPropertyValue('--track')
    for (const f of [0.25, 0.5, 0.75]) {
      const y = Math.round((H - 1) * (1 - f))
      for (let x = 0; x < W; x += 3) ctx.fillRect(x, y, 1, 1)
    }
  }

  const span = to.value - from.value || 1
  const colOf = (t: number) => Math.round(((t - from.value) / span) * (W - 1))
  const rowOf = (v: number) => (H - 1) - Math.round(Math.min(1, Math.max(0, v / (props.top || 1))) * (H - 1))

  // Later series draw first so the primary one sits on top.
  props.series.map((s, index) => ({ s, index })).reverse().forEach(({ s, index }) => {
    // Average the samples sharing a column.
    const cols: { x: number, t: number, sum: number, n: number, gap: boolean }[] = []
    props.times.forEach((t, i) => {
      const x = colOf(t)
      const v = s.values[i]
      let last = cols.at(-1)
      if (!last || last.x !== x) cols.push(last = { x, t, sum: 0, n: 0, gap: false })
      if (v === null || v === undefined || !Number.isFinite(v)) last.gap = true
      else { last.sum += v; last.n++ }
    })
    const color = css.getPropertyValue(s.color) || s.color
    ctx.fillStyle = color
    const dither = props.fill && index === 0
    const column = (x: number, y: number, width: number) => {
      ctx.fillRect(x, y, width, 1)
      if (!dither) return
      ctx.globalAlpha = 0.45
      for (let cx = x; cx < x + width; cx++)
        for (let cy = y + 1 + ((cx + y + 1) % 2); cy < H; cy += 2) ctx.fillRect(cx, cy, 1, 1)
      ctx.globalAlpha = 1
    }
    for (let i = 0; i < cols.length; i++) {
      const a = cols[i]!
      if (!a.n) continue
      const ya = rowOf(a.sum / a.n)
      const b = cols[i + 1]
      if (b && b.n && !a.gap && b.t - a.t <= maxGap.value) {
        // Stair step: hold the level, then climb or fall in the next column.
        column(a.x, ya, Math.max(1, b.x - a.x))
        const yb = rowOf(b.sum / b.n)
        ctx.fillRect(b.x, Math.min(ya, yb), 1, Math.abs(yb - ya) + 1)
      }
      else {
        column(a.x, ya, 1)
      }
    }
  })
}

let observer: ResizeObserver | undefined
onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    const r = entry!.contentRect
    size.value = { w: Math.floor(r.width), h: Math.floor(r.height) }
  })
  observer.observe(plot.value!)
})
onBeforeUnmount(() => observer?.disconnect())

// The palette lives in CSS, so a theme flip must repaint; wait a frame for the class to land.
watch([size, () => props.series, () => props.times, () => props.top], draw, { flush: 'post' })
watch(dark, () => requestAnimationFrame(draw))

function nearest(ms: number): number {
  let lo = 0
  let hi = props.times.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (props.times[mid]! < ms) lo = mid + 1
    else hi = mid
  }
  if (lo > 0 && ms - props.times[lo - 1]! < props.times[lo]! - ms) lo--
  return lo
}

function onMove(e: PointerEvent) {
  if (!props.times.length || !plot.value) return
  const r = plot.value.getBoundingClientRect()
  const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width))
  hover.value = nearest(from.value + f * (to.value - from.value))
}

const hoverX = computed(() => hover.value === null ? 0 : ((props.times[hover.value]! - from.value) / ((to.value - from.value) || 1)) * 100)
const yLabels = computed(() => [1, 0.75, 0.5, 0.25, 0].map(f => ({ f, text: props.format(props.top * f) })))
const xLabels = computed(() => (props.ticks ?? []).map(t => ({ left: ((t - from.value) / ((to.value - from.value) || 1)) * 100, text: props.xFormat?.(t) ?? '' })))
</script>

<template>
  <div class="chart" :class="{ axes }">
    <div v-if="axes" class="y">
      <span v-for="l in yLabels" :key="l.f" :style="{ top: `${(1 - l.f) * 100}%` }">{{ l.text }}</span>
    </div>
    <div
      ref="plot" class="plot" :style="{ height: `${height}px` }"
      @pointermove="onMove" @pointerleave="hover = null"
    >
      <canvas ref="canvas" />
      <template v-if="hover !== null">
        <i class="cursor" :style="{ left: `${hoverX}%` }" />
        <div class="tip box" :class="{ flip: hoverX > 60 }" :style="{ left: `${hoverX}%` }">
          <div v-if="xFormat" class="muted">{{ xFormat(times[hover]!) }}</div>
          <div v-for="s in series" :key="s.name" class="row">
            <i :style="{ background: `var(${s.color})` }" />
            <span>{{ s.name }}</span>
            <b class="num">{{ s.values[hover] == null ? '—' : format(s.values[hover]!) }}</b>
          </div>
        </div>
      </template>
    </div>
    <div v-if="axes" class="x">
      <span v-for="l in xLabels" :key="l.left" :style="{ left: `${l.left}%` }">{{ l.text }}</span>
    </div>
  </div>
</template>

<style scoped>
.chart {
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
}

.chart.axes {
  grid-template-columns: auto 1fr;
  column-gap: 6px;
}

.y {
  position: relative;
  min-width: 44px;
  color: var(--muted);
  font-size: 12px;
  text-align: right;
}

.y span {
  position: absolute;
  right: 0;
  transform: translateY(-50%);
  white-space: nowrap;
  line-height: 1;
}

.plot {
  position: relative;
  border-left: 2px solid var(--ink);
  border-bottom: 2px solid var(--ink);
  touch-action: pan-y;
  cursor: crosshair;
}

.chart:not(.axes) .plot {
  border: 0;
}

canvas {
  position: absolute;
  inset: 0;
  display: block;
}

.x {
  grid-column: 2;
  position: relative;
  height: 18px;
  color: var(--muted);
  font-size: 12px;
}

.x span {
  position: absolute;
  top: 4px;
  transform: translateX(-50%);
  white-space: nowrap;
}

.cursor {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: repeating-linear-gradient(var(--ink) 0 4px, transparent 4px 8px);
  pointer-events: none;
}

.tip {
  position: absolute;
  top: 4px;
  z-index: 2;
  margin-left: 10px;
  padding: 4px 8px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 3px 3px 0 var(--shadow);
}

.tip.flip {
  transform: translateX(-100%);
  margin-left: -10px;
}

.row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.row i {
  width: 8px;
  height: 8px;
  flex: none;
}

.row b {
  margin-left: auto;
  padding-left: 12px;
  font-weight: normal;
}
</style>
