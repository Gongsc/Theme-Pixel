<script setup lang="ts">
import PixelOutpost from '@/components/PixelOutpost.vue'
import PixelValley from '@/components/PixelValley.vue'
import PixelCloud from '@/components/PixelCloud.vue'
import PixelFoliage from '@/components/PixelFoliage.vue'
import { config } from '@/api/config'
</script>

<template>
  <div class="pixel-backdrop" :class="{ 'is-static': !config.animatedBackground }" aria-hidden="true">
    <svg class="sky" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" focusable="false" shape-rendering="crispEdges">
      <g transform="translate(570 224) scale(0.65)"><PixelCloud style="--cloud-delay: -8s" /></g>
      <g transform="translate(1184 218) scale(0.7)"><PixelCloud style="--cloud-delay: -16s; --cloud-duration: 32s" /></g>
      <g transform="translate(278 550) scale(0.6)"><PixelCloud style="--cloud-delay: -12s; --cloud-duration: 30s" /></g>
      <g transform="translate(1020 662) scale(0.8)"><PixelCloud style="--cloud-delay: -24s" /></g>

      <g class="stars">
        <path d="M198 94h4v4h4v4h-4v4h-4v-4h-4v-4h4z" />
        <path d="M1166 112h4v4h4v4h-4v4h-4v-4h-4v-4h4z" />
        <path d="M1310 526h4v4h4v4h-4v4h-4v-4h-4v-4h4z" />
        <path d="M124 594h4v4h4v4h-4v4h-4v-4h-4v-4h4z" />
        <path class="star-warm" d="M364 314h4v4h4v4h-4v4h-4v-4h-4v-4h4z" />
        <path class="star-warm" d="M956 416h4v4h4v4h-4v4h-4v-4h-4v-4h4z" />
      </g>

      <g class="data-paths" fill="none" stroke-width="2" stroke-dasharray="6 10">
        <path d="M0 348h98v24h64v24h76v24h60" />
        <path d="M1110 408h72v-24h78v-24h80v-24h100" />
        <path d="M30 690h82v-20h78v-20h68v-20h78" />
        <path d="M1068 716h76v-20h70v-20h66v-20h106" />
      </g>
      <g class="packets">
        <path d="M98 368h8v8h-8zM236 416h8v8h-8zM1178 380h8v8h-8zM1336 332h8v8h-8z" />
        <path class="packet-purple" d="M186 646h8v8h-8zM1210 672h8v8h-8z" />
        <path class="packet-warm" d="M332 626h8v8h-8z" />
      </g>
      <rect class="data-mote mote-a" width="7" height="7" />
      <rect class="data-mote mote-b" width="7" height="7" />
    </svg>

    <PixelOutpost class="backdrop-outpost" />

    <svg class="distant-island" viewBox="0 0 240 160" focusable="false" shape-rendering="crispEdges">
      <path class="islet-rock-shadow" d="M24 90h192v16h-24v12h-28v16h-24v18h-32v-18H84v-16H56v-12H24z" />
      <path class="islet-rock" d="M24 86h192v16h-28v12h-32v16h-20v14h-20v-18H92v-16H60V98H24z" />
      <path class="islet-stone" d="M56 98h20v12H56zM104 116h16v12h-16zM164 102h20v12h-20z" />
      <path class="islet-grass" d="M16 78h24v-8h36v-8h80v8h40v8h28v16h-32v8H52v-8H16z" />
      <path class="islet-grass-light" d="M24 78h28v-8h100v8h52v8H24z" />
      <path class="islet-metal" d="M88 30h4v44h-4zM80 70h20v4H80zM84 22h12v12H84zM136 46h40v30h-40z" />
      <path class="islet-wall" d="M140 50h32v22h-32z" />
      <path class="islet-window" d="M144 54h24v10h-24z" />
      <g class="islet-plants">
        <g transform="translate(56 74) scale(0.24)"><PixelFoliage kind="shrub" /></g>
        <g transform="translate(192 78) scale(0.3)"><PixelFoliage style="--sway-delay: -2s" /></g>
      </g>
    </svg>

    <PixelValley />
  </div>
</template>

<style scoped>
.pixel-backdrop {
  --world-cloud: #f5efdc;
  --world-cloud-edge: #bfd2ce;
  --world-cloud-light: #fff9e9;
  --world-star: #cbded8;
  --world-warm: #e8dcae;
  --world-line: #dce4d9;
  --world-packet: #cadbd2;
  --world-purple: #ddd3e7;
  --islet-rock: #d6c9ad;
  --islet-rock-shadow: #bdb8ad;
  --islet-stone: #bcb09a;
  --islet-grass: #bdcc9f;
  --islet-grass-light: #d3ddba;
  --islet-metal: #92aaa2;
  --islet-wall: #eeedde;
  --islet-window: #afcbc6;
  /* The entire world uses the viewport, independent of document height. */
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  user-select: none;
  background-image: radial-gradient(var(--grid) 1px, transparent 1px);
  background-size: 8px 8px;
}

:root.dark .pixel-backdrop {
  --world-cloud: #242c30;
  --world-cloud-edge: #1e272c;
  --world-cloud-light: #293235;
  --world-star: #354849;
  --world-warm: #464331;
  --world-line: #263b37;
  --world-packet: #354940;
  --world-purple: #3d344d;
  --islet-rock: #534d3f;
  --islet-rock-shadow: #393d3b;
  --islet-stone: #665b49;
  --islet-grass: #4b6040;
  --islet-grass-light: #60794e;
  --islet-metal: #5f7b71;
  --islet-wall: #697060;
  --islet-window: #608b80;
}

.sky {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.backdrop-outpost {
  position: absolute;
  right: max(16px, calc((100vw - 1400px) / 2));
  bottom: clamp(72px, 12vh, 140px);
  width: clamp(340px, 40vw, 640px);
  height: auto;
  aspect-ratio: 3 / 2;
}

.stars { fill: var(--world-star); }
.star-warm,
.packet-warm { fill: var(--world-warm); }
.data-paths { stroke: var(--world-line); }
.packets { fill: var(--world-packet); }
.packet-purple { fill: var(--world-purple); }

.data-mote {
  fill: var(--world-packet);
  offset-rotate: 0deg;
  animation: packet-travel 22s steps(64, end) infinite;
}

.mote-a { offset-path: path('M0 348h98v24h64v24h76v24h60'); }
.mote-b {
  offset-path: path('M1068 716h76v-20h70v-20h66v-20h106');
  animation-delay: -11s;
}

@keyframes packet-travel {
  from { offset-distance: 0%; }
  to { offset-distance: 100%; }
}

.distant-island {
  position: absolute;
  right: clamp(16px, 3vw, 56px);
  bottom: clamp(360px, 46vh, 540px);
  width: clamp(96px, 12vw, 172px);
  height: auto;
  opacity: 0.7;
}

.islet-rock { fill: var(--islet-rock); }
.islet-rock-shadow { fill: var(--islet-rock-shadow); }
.islet-stone { fill: var(--islet-stone); }
.islet-grass { fill: var(--islet-grass); }
.islet-grass-light { fill: var(--islet-grass-light); }
.islet-metal { fill: var(--islet-metal); }
.islet-wall { fill: var(--islet-wall); }
.islet-window { fill: var(--islet-window); }

:root.dark .islet-plants { filter: brightness(0.6) saturate(0.7); }

@media (max-width: 639px) {
  .sky { opacity: 0.6; }
  .distant-island { display: none; }
  .backdrop-outpost {
    right: 8px;
    bottom: 88px;
    width: min(80vw, 360px);
    opacity: 0.75;
  }
}

.pixel-backdrop.is-static :deep(*) {
  animation: none;
  transition: none;
}

@media (prefers-reduced-motion: reduce) {
  .pixel-backdrop :deep(*) {
    animation: none;
    transition: none;
  }
}
</style>
