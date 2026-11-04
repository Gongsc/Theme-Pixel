<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { speedHistory } from '@/api/nodes'
import type { Node } from '@/api/types'
import { axisTop, bytes, rate } from '@/lib/format'
import PixelChart from './PixelChart.vue'
import PixelIcon from './PixelIcon.vue'
import PixelGuardian from './PixelGuardian.vue'
import PixelWelcome from './PixelWelcome.vue'
import ExpiryReminder from './ExpiryReminder.vue'

const props = defineProps<{ nodes: Node[], group: string | null }>()

const online = computed(() => props.nodes.filter(n => n.online).length)
const heartGrid = ref<HTMLElement>()
const heartColumns = ref(8)
let heartObserver: ResizeObserver | undefined
onMounted(() => {
  heartObserver = new ResizeObserver(([entry]) => {
    if (entry) heartColumns.value = Math.max(1, Math.floor((entry.contentRect.width + 4) / 24))
  })
  if (heartGrid.value) heartObserver.observe(heartGrid.value)
})
onBeforeUnmount(() => heartObserver?.disconnect())
// Three rows; reserve enough cells for the overflow count only when needed.
const heartLayout = computed(() => {
  const capacity = heartColumns.value * 3
  if (props.nodes.length <= capacity) return { count: props.nodes.length, overflowColumns: 0 }
  let columns = 1
  while (columns < heartColumns.value) {
    const remaining = props.nodes.length - (capacity - columns)
    if (String(remaining).length * 9 + 9 <= columns * 24 - 4) break
    columns++
  }
  return { count: capacity - columns, overflowColumns: columns }
})
const hearts = computed(() => [...props.nodes].sort((a, b) => Number(b.online) - Number(a.online)).slice(0, heartLayout.value.count))
const speed = computed(() => props.nodes.reduce((t, n) => {
  if (n.online && n.metrics) { t.rx += n.metrics.net_rx; t.tx += n.metrics.net_tx }
  return t
}, { rx: 0, tx: 0 }))
const month = computed(() => props.nodes.reduce((t, n) => ({ rx: t.rx + n.month_rx, tx: t.tx + n.month_tx }), { rx: 0, tx: 0 }))
const total = computed(() => props.nodes.reduce((t, n) => ({ rx: t.rx + n.total_rx, tx: t.tx + n.total_tx }), { rx: 0, tx: 0 }))

const history = computed(() => speedHistory.value.get(props.group) ?? [])
// Samples are evenly spaced pushes; their order is all the axis needs.
const times = computed(() => history.value.map((_, i) => i))
const series = computed(() => [
  { name: '下载', color: '--green', values: history.value.map(p => p.rx) },
  { name: '上传', color: '--blue', values: history.value.map(p => p.tx) },
])
const top = computed(() => axisTop(Math.max(0, ...history.value.map(p => Math.max(p.rx, p.tx))), 1024 * 64, 1024))
</script>

<template>
  <section class="overview box" aria-labelledby="overview-title">
    <header class="overview-heading">
      <PixelGuardian :size="36" aria-hidden="true" />
      <h2 id="overview-title">概览</h2>
      <span class="scope muted">{{ group === null ? '全部节点' : group || '未分组' }}</span>
    </header>
    <div class="summary">
      <div class="tile">
        <span class="label muted">在线节点</span>
        <div class="party">
          <span class="big display num">{{ online }}<small>/{{ nodes.length }}</small></span>
          <div ref="heartGrid" class="hearts" aria-hidden="true" title="一颗爱心表示一台节点的在线状态">
            <PixelIcon
              v-for="n in hearts" :key="n.id" :name="n.online ? 'heart' : 'heart-empty'"
              :size="20" :class="{ connected: n.online }"
            />
            <span v-if="nodes.length > hearts.length" class="muted num heart-overflow" :style="{ gridColumn: `span ${heartLayout.overflowColumns}` }">+{{ nodes.length - hearts.length }}</span>
          </div>
        </div>
        <span class="muted">{{ !nodes.length ? '等待节点加入' : nodes.length - online ? `${nodes.length - online} 台离线` : '全部在线' }}</span>
      </div>
      <div class="tile">
        <span class="label muted">实时速率</span>
        <span class="speed num">
          <span><PixelIcon name="down" :size="12" class="rx" />{{ rate(speed.rx) }}</span>
          <span><PixelIcon name="up" :size="12" class="tx" />{{ rate(speed.tx) }}</span>
        </span>
        <PixelChart
          v-if="history.length > 1" class="spark" :times="times" :series="series" :top="top" :format="rate"
          :axes="false" :height="36" :px="2"
        />
        <div v-else class="spark wait" />
      </div>
      <div class="tile">
        <span class="label muted">本月流量</span>
        <span class="speed num">
          <span><PixelIcon name="down" :size="12" class="rx" />{{ bytes(month.rx) }}</span>
          <span><PixelIcon name="up" :size="12" class="tx" />{{ bytes(month.tx) }}</span>
        </span>
        <span class="muted">累计 ↓{{ bytes(total.rx) }} ↑{{ bytes(total.tx) }}</span>
      </div>
    </div>
    <ExpiryReminder :nodes="nodes" :group="group" />
    <PixelWelcome :nodes="nodes" />
  </section>
</template>

<style scoped>
.overview { min-width: 0; }

.overview-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 2px solid var(--track);
}

.overview-heading h2 {
  margin: 0;
  font-size: 20px;
  font-weight: normal;
}

.scope {
  margin-left: auto;
  overflow-wrap: anywhere;
  text-align: right;
}

.summary {
  display: grid;
  gap: 0;
  grid-template-columns: 1fr;
}

@media (min-width: 720px) {
  .summary {
    grid-template-columns: fit-content(32%) minmax(0, 1fr) fit-content(30%);
  }
}

.tile {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  min-width: 0;
  padding: 14px 20px;
}

.tile + .tile {
  border-left: 2px solid var(--track);
}

.big {
  font-size: 24px;
  line-height: 1.2;
  margin: 0;
}

.big small {
  font-size: 16px;
  color: var(--muted);
}

.party {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
}

.hearts {
  display: grid;
  grid-template-columns: repeat(auto-fill, 20px);
  grid-auto-rows: 20px;
  align-items: center;
  gap: 4px;
  color: var(--muted);
  width: 188px;
  max-width: 100%;
}

.heart-overflow { white-space: nowrap; font-size: 14px; }

.connected {
  color: var(--green);
  filter: drop-shadow(1px 1px 0 var(--ink));
}

.speed {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 16px;
  font-size: 24px;
  line-height: 1.2;
}

.speed span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.rx {
  color: var(--green);
}

.tx {
  color: var(--blue);
}

.spark {
  margin-top: 4px;
}

.wait {
  height: 36px;
  border-bottom: 2px dashed var(--track);
}

@media (max-width: 719px) {
  .summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .overview-heading { padding: 12px; }

  .tile:first-child {
    grid-column: 1 / -1;
    border-bottom: 2px solid var(--track);
  }

  .tile:nth-child(2) { border-left: 0; }

  .tile {
    padding: 14px 12px;
  }

  .big,
  .speed {
    font-size: 20px;
    gap: 4px 8px;
  }
}
@media (max-width: 420px) {
  .summary { grid-template-columns: minmax(0, 1fr); }

  .tile + .tile {
    border-left: 0;
    border-top: 2px solid var(--track);
  }

  .tile:first-child { border-bottom: 0; }
}
</style>
