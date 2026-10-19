<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { latencyColor, type Probe } from '@/api/ping'

const props = defineProps<{ probes: Probe[] }>()
const hovered = shallowRef<{ id: string, index: number, x: number, y: number } | null>(null)
const tip = ref<HTMLDivElement>()
const position = ref({ left: 0, top: 0 })
const sample = computed(() => {
  const h = hovered.value
  const probe = h && props.probes.find(p => p.id === h.id)
  if (!h || !probe || h.index >= probe.recent.length) return null
  return { name: probe.name, value: probe.recent[h.index]! }
})

async function showSample(event: PointerEvent, id: string, index: number) {
  if (event.pointerType === 'touch') return
  const h = { id, index, x: event.clientX, y: event.clientY }
  hovered.value = h
  await nextTick()
  if (hovered.value !== h || !tip.value) return
  const { width, height } = tip.value.getBoundingClientRect()
  position.value = {
    left: Math.max(8, Math.min(h.x + 12, window.innerWidth - width - 8)),
    top: h.y >= height + 20 ? h.y - height - 12 : h.y + 12,
  }
}

const hideTip = () => { hovered.value = null }
const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') hideTip() }
onMounted(() => {
  window.addEventListener('scroll', hideTip, true)
  window.addEventListener('resize', hideTip)
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', hideTip, true)
  window.removeEventListener('resize', hideTip)
  window.removeEventListener('keydown', onKey)
})

const ms = (v: number | null) => (v === null ? '超时' : `${Math.round(v)}ms`)
const loss = (v: number) => (v > 0 && v < 1 ? '<1%' : `${Math.round(v)}%`)
/** Bar height in 2px steps, capped at 300 ms so one slow route does not flatten the rest. */
const height = (v: number | null) => (v === null ? 100 : Math.max(17, Math.min(100, Math.ceil((v / 300) * 6) * (100 / 6))))
</script>

<template>
  <div class="ping">
    <div v-for="p in probes" :key="p.id" class="row" :title="`${p.name} · 平均 ${ms(p.avg)} · 1 小时丢包 ${loss(p.loss)}`">
      <span class="name">{{ p.name }}</span>
      <span class="strip" :class="{ inspecting: hovered?.id === p.id }" title="" aria-hidden="true" @pointerleave="hideTip">
        <span
          v-for="(v, i) in p.recent"
          :key="i" class="sample"
          :class="{ active: hovered?.id === p.id && hovered.index === i }"
          @pointerenter="showSample($event, p.id, i)"
          @pointermove="showSample($event, p.id, i)"
        >
          <i :style="{ height: `${height(v)}%`, background: latencyColor(v) }" />
        </span>
      </span>
      <span class="ms num" :style="{ color: latencyColor(p.latest) }">{{ ms(p.latest) }}</span>
      <span class="loss num" :class="{ bad: p.loss >= 5 }">{{ loss(p.loss) }}</span>
    </div>
  </div>
  <Teleport to="body">
    <div
      v-if="sample" ref="tip" class="ping-tip box" role="tooltip"
      :style="{ left: `${position.left}px`, top: `${position.top}px` }"
    >
      <span class="tip-name">{{ sample.name }}</span>
      <span class="num" :style="{ color: latencyColor(sample.value) }">{{ ms(sample.value) }}</span>
    </div>
  </Teleport>
</template>

<style scoped>
.ping {
  display: grid;
  gap: 4px;
}

.row {
  display: grid;
  grid-template-columns: minmax(0, 64px) minmax(0, 1fr) 42px 32px;
  align-items: center;
  gap: 8px;
}

.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.strip {
  display: flex;
  align-items: flex-end;
  gap: 1px;
  height: 12px;
  overflow: hidden;
}

.sample {
  position: relative;
  display: flex;
  align-items: flex-end;
  flex: 1 1 0;
  min-width: 0;
  height: 100%;
  transition: opacity 80ms steps(2, end);
}

.sample i {
  width: 100%;
}

.strip.inspecting .sample:not(.active) {
  opacity: 0.45;
}

.sample.active {
  background: var(--track);
}

/* Frame the full sample slot so even a low-latency bar is easy to locate. */
.sample.active::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid var(--ink);
  pointer-events: none;
  animation: sample-focus 160ms steps(2, end);
}

.sample.active i {
  animation: sample-flash 160ms steps(2, end);
}

@keyframes sample-focus {
  from { opacity: 0.3; }
  to { opacity: 1; }
}

@keyframes sample-flash {
  from { filter: brightness(1.7); }
  to { filter: brightness(1); }
}

@media (prefers-reduced-motion: reduce) {
  .sample { transition: none; }
  .sample.active::after,
  .sample.active i { animation: none; }
}

.ping-tip {
  position: fixed;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: calc(100vw - 16px);
  padding: 4px 8px;
  font: var(--fs) / 1.5 var(--font);
  color: var(--ink);
  pointer-events: none;
}

.tip-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ping-tip .num {
  flex: none;
}

.ms,
.loss {
  text-align: right;
  white-space: nowrap;
}

.loss {
  color: var(--muted);
}

.loss.bad {
  color: var(--red);
}
</style>
