<script setup lang="ts">
import outpostUrl from '@/assets/world/cloud-outpost-base.webp'
import PixelFoliage from './PixelFoliage.vue'

const shrubs = [
  [200, 568, 0.9], [270, 560, 1.2], [352, 550, 1.5], [420, 540, 0.7],
  [866, 540, 0.65], [916, 540, 0.9], [1140, 572, 1.1], [1340, 580, 1.25], [1410, 580, 0.8],
]
const grasses = [
  [116, 570, 0.8], [158, 568, 0.75], [232, 568, 0.9], [306, 560, 0.7],
  [380, 550, 0.9], [470, 548, 0.6], [540, 556, 0.6], [662, 554, 0.5],
  [836, 550, 0.65], [888, 548, 0.8], [970, 574, 0.8], [1048, 576, 0.9],
  [1100, 576, 0.75], [1180, 578, 0.6], [1300, 582, 0.8], [1380, 580, 0.9], [1432, 582, 0.65],
]
const vines = [
  [160, 626, 0.8], [238, 644, 0.7], [340, 652, 0.65], [408, 670, 1.25],
  [690, 646, 0.85], [768, 650, 1.15], [1064, 672, 0.9], [1144, 674, 1.15],
  [1270, 650, 0.85], [1390, 634, 1.15],
]
const wind = (index: number) => ({
  '--sway-duration': `${3.2 + (index % 5) * 0.45}s`,
  '--sway-delay': `${-index * 0.71}s`,
})
</script>

<template>
  <div class="pixel-outpost" aria-hidden="true">
    <img :src="outpostUrl" width="1536" height="1024" alt="" decoding="async" draggable="false">
    <!-- Separate from the artwork so the radio and lamps can animate independently. -->
    <svg class="outpost-lights" viewBox="0 0 1536 1024" focusable="false" shape-rendering="crispEdges">
      <g class="radio" fill="none" stroke="currentColor" stroke-width="6">
        <path class="ring ring-a" d="M1000 36h-12v12h-8v28h8v12h12m56-52h12v12h8v28h-8v12h-12" />
        <path class="ring ring-b" d="M984 16h-16v16h-12v56h12v16h16m88-88h16v16h12v56h-12v16h-16" />
        <path class="ring ring-c" d="M964 0h-16v16h-16v88h16v16h16m128-120h16v16h16v88h-16v16h-16" />
      </g>
      <g class="lamps">
        <path class="lamp lamp-a" d="M536 352h16v16h-16z" />
        <path class="lamp lamp-b" d="M590 352h16v16h-16z" />
        <path class="lamp lamp-c" d="M644 352h16v16h-16z" />
        <path class="beacon" d="M1020 52h16v16h-16z" />
      </g>
      <g class="vegetation">
        <g v-for="([x, y, size], i) in shrubs" :key="`shrub-${i}`" :transform="`translate(${x} ${y}) scale(${size})`">
          <PixelFoliage kind="shrub" :style="wind(i)" />
        </g>
        <g v-for="([x, y, size], i) in grasses" :key="`grass-${i}`" :transform="`translate(${x} ${y}) scale(${size})`">
          <PixelFoliage :style="wind(i + 9)" />
        </g>
        <g v-for="([x, y, size], i) in vines" :key="`vine-${i}`" :transform="`translate(${x} ${y}) scale(${size})`">
          <PixelFoliage kind="vine" :style="wind(i + 26)" />
        </g>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.pixel-outpost {
  position: relative;
  width: 100%;
  max-width: 720px;
  aspect-ratio: 3 / 2;
  pointer-events: none;
  user-select: none;
}

img,
.outpost-lights {
  display: block;
  width: 100%;
  height: 100%;
}

img { object-fit: contain; }

.outpost-lights {
  position: absolute;
  inset: 0;
  overflow: visible;
}

.radio { color: #97bab4; }
.ring { opacity: 0.4; animation: radio-pulse 4.8s steps(6, end) infinite; }
.ring-b { animation-delay: -3.2s; }
.ring-c { animation-delay: -1.6s; }
.lamps { fill: #b4df92; }
.lamp { animation: status-blink 6s steps(2, end) infinite; }
.lamp-b { animation-delay: -2s; }
.lamp-c { animation-delay: -4s; }
.beacon { fill: #fff0bd; animation: status-blink 4.8s steps(2, end) infinite; }

@keyframes radio-pulse {
  0%, 75%, 100% { opacity: 0.12; }
  25%, 50% { opacity: 0.85; }
}

@keyframes status-blink {
  0%, 80%, 100% { opacity: 0.25; }
  20%, 60% { opacity: 0.9; }
}

:root.dark img { filter: brightness(0.65) saturate(0.7); }
:root.dark .vegetation { filter: brightness(0.65) saturate(0.7); }
:root.dark .radio { color: #65968c; }
:root.dark .lamps { fill: #8fba79; }

@media (prefers-reduced-motion: reduce) {
  .pixel-outpost * { animation: none; }
}
</style>
