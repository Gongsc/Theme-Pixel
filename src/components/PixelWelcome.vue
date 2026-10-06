<script setup lang="ts">
import { computed } from 'vue'
import type { Node } from '@/api/types'
import PixelGuardian from './PixelGuardian.vue'
import { runtimeProgress } from '@/lib/runtime'

const props = defineProps<{ nodes: Node[] }>()

const milestones = [
  { id: 'battery', label: '运行 24H', seconds: 24 * 60 * 60 },
  { id: 'shield', label: '运行 72H', seconds: 72 * 60 * 60 },
  { id: 'tower', label: '运行 7D', seconds: 7 * 24 * 60 * 60 },
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
  <section class="welcome box" aria-label="像素守卫与运行时长成就">
    <div class="intro">
      <PixelGuardian :size="72" />
      <div class="intro-copy">
        <h2>像素守卫</h2>
        <p>每一台节点，都是你的值守伙伴</p>
      </div>
    </div>

    <div class="milestones">
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
          <span class="milestone-count num">{{ badge.count }} 台达成</span>
        </div>
      </div>
      <p class="milestone-note">按本次系统启动时长统计，重启后重新累计</p>
    </div>
  </section>
</template>

<style scoped>
.welcome {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 20px;
}

.intro {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
  min-width: 0;
}

.intro-copy {
  min-width: 0;
}

h2 {
  margin: 0 0 6px;
  font-family: var(--font);
  font-size: 24px;
  font-weight: normal;
  line-height: 1.3;
}

.intro-copy p {
  margin: 0;
  color: var(--ink);
}

.milestones {
  width: 460px;
  flex: none;
  padding-left: 24px;
  border-left: 2px dashed var(--track);
}

.badge-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.milestone {
  --medal-color: var(--muted);
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  align-items: center;
  gap: 0 8px;
  min-width: 0;
  padding: 10px 8px;
  border: 2px solid var(--ink);
  box-shadow: 2px 2px 0 var(--shadow);
}

.milestone.earned:nth-child(1) { --medal-color: var(--green); }
.milestone.earned:nth-child(2) { --medal-color: var(--blue); }
.milestone.earned:nth-child(3) { --medal-color: var(--purple); }

.medal {
  display: block;
  width: 32px;
  height: 36px;
  grid-row: span 2;
}

.glyph {
  fill: var(--medal-color);
}

.glyph-inner {
  fill: var(--panel);
}

.accent {
  fill: var(--medal-color);
}

.milestone-label {
  white-space: nowrap;
  line-height: 1.4;
}

.milestone-count {
  color: var(--muted);
  white-space: nowrap;
  line-height: 1.4;
}

.milestone-note {
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.5;
  text-align: center;
}

@media (max-width: 959px) {
  .welcome {
    flex-wrap: wrap;
    gap: 16px;
  }

  .intro {
    flex-basis: 100%;
  }

  .milestones {
    width: 100%;
    padding: 16px 0 0;
    border-left: 0;
    border-top: 2px dashed var(--track);
  }
}

@media (max-width: 479px) {
  .welcome {
    padding: 12px;
    gap: 12px;
  }

  .intro {
    gap: 12px;
  }

  .intro > svg {
    width: 56px;
    height: 56px;
  }

  .milestones {
    padding-top: 12px;
  }

  h2 {
    font-size: 22px;
  }

  .intro-copy p {
    max-width: 18em;
    line-height: 1.6;
  }

  .badge-grid {
    gap: 6px;
  }

  .milestone {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px 4px;
    gap: 2px;
  }

  .medal {
    width: 24px;
    height: 27px;
  }

  .milestone-note {
    margin-top: 8px;
  }
}
</style>
