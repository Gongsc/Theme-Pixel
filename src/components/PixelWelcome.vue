<script setup lang="ts">
import { computed } from 'vue'
import type { Node } from '@/api/types'
import { runtimeProgress } from '@/lib/runtime'

const props = defineProps<{ nodes: Node[] }>()

const milestones = [
  { id: 'battery', label: '≥ 24H', seconds: 24 * 60 * 60 },
  { id: 'shield', label: '≥ 72H', seconds: 72 * 60 * 60 },
  { id: 'tower', label: '≥ 7D', seconds: 7 * 24 * 60 * 60 },
] as const

const badges = computed(() => milestones.map(milestone => ({
  ...milestone,
  count: props.nodes.filter(node =>
    node.online && node.metrics &&
    runtimeProgress(node.metrics.uptime) !== null && node.metrics.uptime >= milestone.seconds,
  ).length,
})))
</script>

<template>
  <div class="runtime" role="group" aria-label="在线节点本次启动的运行时长统计">
    <span class="runtime-label">本次运行</span>
    <div class="badge-grid">
      <div
        v-for="badge in badges" :key="badge.id" class="milestone"
        :class="{ earned: badge.count > 0 }"
        :title="`${badge.label}：${badge.count} 台在线节点本次启动的运行时长达到要求；系统重启后重新累计。`"
      >
        <svg class="medal" viewBox="4 4 16 18" shape-rendering="crispEdges" aria-hidden="true" focusable="false">
          <g v-if="badge.id === 'battery'">
            <path class="glyph" d="M7 7h8V5h2v2h1v10H6V7z" />
            <path class="glyph-inner" d="M8 9h8v6H8z" />
            <path class="accent" d="M9 10h2v4H9zM13 10h2v4h-2z" />
          </g>
          <g v-else-if="badge.id === 'shield'">
            <path class="glyph" d="M6 6h12v9h-2v2h-2v2h-4v-2H8v-2H6z" />
            <path class="glyph-inner" d="M8 8h8v6h-2v2h-4v-2H8z" />
            <path class="accent" d="M9 11h2v2h2v-2h2V9h1v3h-2v2h-3v-1H9z" />
          </g>
          <g v-else>
            <path class="glyph" d="M11 5h2v2h2v2h-2v3h2v2h1v2h1v2h2v2H5v-2h2v-2h1v-2h1v-2h2V9H9V7h2zM6 6h2v4H6zM16 6h2v4h-2z" />
            <path class="glyph-inner" d="M11 14h2v2h-2zM9 18h6v1H9z" />
            <path class="accent" d="M11 7h2v2h-2zM4 7h1v2H4zM19 7h1v2h-1z" />
          </g>
        </svg>
        <span class="milestone-label">{{ badge.label }}</span>
        <span class="milestone-count num">{{ badge.count }} 台</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.runtime {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 24px;
  padding: 12px 20px;
  border-top: 2px dashed var(--track);
}

.runtime-label {
  color: var(--muted);
}

.badge-grid {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 12px 28px;
}

.milestone {
  --medal-color: var(--muted);
  display: flex;
  align-items: center;
  gap: 8px;
}

.milestone.earned:nth-child(1) { --medal-color: var(--green); }
.milestone.earned:nth-child(2) { --medal-color: var(--blue); }
.milestone.earned:nth-child(3) { --medal-color: var(--purple); }

.medal {
  display: block;
  width: 20px;
  height: 24px;
}

.glyph, .accent { fill: var(--medal-color); }
.glyph-inner { fill: var(--panel); }

.milestone-label, .milestone-count {
  white-space: nowrap;
}

.milestone-count { color: var(--muted); }

@media (max-width: 719px) {
  .runtime { padding: 12px; gap: 8px; }
  .runtime-label { flex-basis: 100%; }
  .badge-grid { justify-content: space-between; gap: 8px; }
  .milestone { gap: 4px; }
  .medal { width: 16px; height: 18px; }
}
</style>
