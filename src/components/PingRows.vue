<script setup lang="ts">
import { latencyColor, type Probe } from '@/api/ping'

defineProps<{ probes: Probe[] }>()

const ms = (v: number | null) => (v === null ? '超时' : `${Math.round(v)}ms`)
const loss = (v: number) => (v > 0 && v < 1 ? '<1%' : `${Math.round(v)}%`)
/** Bar height in 2px steps, capped at 300 ms so one slow route does not flatten the rest. */
const height = (v: number | null) => (v === null ? 100 : Math.max(17, Math.min(100, Math.ceil((v / 300) * 6) * (100 / 6))))
</script>

<template>
  <div class="ping">
    <div v-for="p in probes" :key="p.id" class="row" :title="`${p.name} · 平均 ${ms(p.avg)} · 1 小时丢包 ${loss(p.loss)}`">
      <span class="name">{{ p.name }}</span>
      <span class="strip" aria-hidden="true">
        <i v-for="(v, i) in p.recent" :key="i" :style="{ height: `${height(v)}%`, background: latencyColor(v) }" />
      </span>
      <span class="ms num" :style="{ color: latencyColor(p.latest) }">{{ ms(p.latest) }}</span>
      <span class="loss num" :class="{ bad: p.loss >= 5 }">{{ loss(p.loss) }}</span>
    </div>
  </div>
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
  justify-content: flex-end;
  gap: 1px;
  height: 12px;
  overflow: hidden;
}

.strip i {
  flex: 0 0 4px;
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
