<script setup lang="ts">
import valleyUrl from '@/assets/world/cloud-valley-base.webp'
import PixelCloud from './PixelCloud.vue'
import PixelFoliage from './PixelFoliage.vue'

// Every cloud/tree is separate from the clean terrain plate. No baked-in duplicates.
const clouds = [
  [40, 500, 0.9], [300, 550, 0.8], [520, 490, 1.15], [820, 560, 0.7],
  [1040, 480, 1.2], [1320, 550, 0.7], [1600, 520, 0.95], [1890, 460, 1.25], [2110, 540, 0.9],
]
const nearClouds = [[270, 648, 0.9], [940, 660, 1.15], [1500, 678, 1.3], [1960, 620, 1.1]]
const trees = [
  [40, 600, 0.8, 'pine'], [112, 600, 0.65, 'birch'], [230, 628, 0.5, 'oak'], [356, 670, 0.7, 'willow'],
  [486, 650, 0.6, 'cypress'], [636, 620, 0.7, 'oak'], [766, 598, 0.95, 'pine'], [880, 654, 0.55, 'birch'],
  [1010, 706, 0.65, 'willow'], [1170, 722, 0.7, 'cypress'], [1330, 724, 0.75, 'oak'], [1480, 724, 0.85, 'birch'],
  [1640, 716, 0.7, 'pine'], [1780, 680, 0.6, 'willow'], [1920, 650, 0.65, 'oak'], [2040, 606, 0.8, 'cypress'], [2140, 580, 0.65, 'pine'],
  [1294, 596, 0.35, 'birch'], [1514, 594, 0.4, 'cypress'],
] as const
const grasses = [
  [70, 594], [180, 620], [310, 652], [430, 654], [570, 638], [710, 606],
  [840, 638], [950, 686], [1090, 714], [1240, 724], [1410, 724], [1550, 720],
  [1710, 700], [1840, 666], [1970, 638], [2090, 594],
]
const cloudWind = (index: number, near = false) => ({
  '--cloud-duration': `${(near ? 18 : 26) + (index % 4) * 3}s`,
  '--cloud-delay': `${-index * 6.7 - 4}s`,
  '--cloud-travel': near ? '140px' : '100px',
})
const plantWind = (index: number) => ({
  '--sway-duration': `${3.6 + (index % 6) * 0.35}s`,
  '--sway-delay': `${-index * 0.63}s`,
})
</script>

<template>
  <svg class="pixel-valley" viewBox="0 0 2172 724" preserveAspectRatio="xMidYMax slice" focusable="false" shape-rendering="crispEdges" aria-hidden="true">
    <image class="terrain-plate" :href="valleyUrl" width="2172" height="724" />
    <g class="far-clouds">
      <g v-for="([x, y, size], i) in clouds" :key="i" :transform="`translate(${x} ${y}) scale(${size})`">
        <PixelCloud :style="cloudWind(i)" />
      </g>
    </g>
    <g class="valley-vegetation">
      <g v-for="([x, y, size, treeStyle], i) in trees" :key="`tree-${i}`" :transform="`translate(${x} ${y}) scale(${size})`">
        <PixelFoliage kind="tree" :tree-style="treeStyle" :style="plantWind(i)" />
      </g>
      <g v-for="([x, y], i) in grasses" :key="`grass-${i}`" :transform="`translate(${x} ${y}) scale(0.65)`">
        <PixelFoliage :style="plantWind(i + 19)" />
      </g>
    </g>
    <g class="near-clouds">
      <g v-for="([x, y, size], i) in nearClouds" :key="i" :transform="`translate(${x} ${y}) scale(${size})`">
        <PixelCloud :style="cloudWind(i + 9, true)" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.pixel-valley {
  position: absolute;
  bottom: 0;
  left: 50%;
  translate: -50% 0;
  width: max(100%, 960px);
  height: auto;
  aspect-ratio: 3 / 1;
  max-height: 48vh;
  overflow: hidden;
}
.far-clouds { opacity: 0.92; }
.near-clouds { opacity: 0.95; }
:root.dark .terrain-plate,
:root.dark .valley-vegetation { filter: brightness(0.38) saturate(0.65); }
@media (max-width: 639px) {
  .pixel-valley { width: 900px; max-height: 240px; }
}
</style>
