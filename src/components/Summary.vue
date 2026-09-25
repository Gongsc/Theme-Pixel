<script setup lang="ts">
import { computed } from 'vue'
import { speedHistory } from '@/api/nodes'
import type { Node } from '@/api/types'
import { axisTop, bytes, rate } from '@/lib/format'
import PixelChart from './PixelChart.vue'
import PixelIcon from './PixelIcon.vue'

const props = defineProps<{ nodes: Node[], group: string | null }>()

const online = computed(() => props.nodes.filter(n => n.online).length)
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
  <section class="summary">
    <div class="tile box">
      <span class="label muted">在线节点</span>
      <span class="big display num">{{ online }}<small>/{{ nodes.length }}</small></span>
      <span class="muted">{{ nodes.length - online ? `${nodes.length - online} 台离线` : '全部在线' }}</span>
    </div>
    <div class="tile box">
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
    <div class="tile box">
      <span class="label muted">本月流量</span>
      <span class="speed num">
        <span><PixelIcon name="down" :size="12" class="rx" />{{ bytes(month.rx) }}</span>
        <span><PixelIcon name="up" :size="12" class="tx" />{{ bytes(month.tx) }}</span>
      </span>
      <span class="muted">累计 ↓{{ bytes(total.rx) }} ↑{{ bytes(total.tx) }}</span>
    </div>
  </section>
</template>

<style scoped>
.summary {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
}

@media (min-width: 720px) {
  .summary {
    grid-template-columns: 1fr 1.4fr 1.2fr;
  }
}

.tile {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding: 12px 14px;
}

.big {
  font-size: 32px;
  line-height: 1;
  margin: 4px 0;
}

.big small {
  font-size: 16px;
  color: var(--muted);
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
</style>
