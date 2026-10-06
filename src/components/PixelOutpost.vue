<template>
  <div class="pixel-outpost" aria-hidden="true">
    <svg viewBox="0 0 640 240" focusable="false" shape-rendering="crispEdges">
      <!-- Original pixel communications outpost, built on a floating grass island. -->
      <g class="ambient">
        <path class="cloud" d="M28 66h12V54h16V46h28v8h20v12h12v12H28zM438 54h16V42h24V34h28v8h20v12h16v12H438z" />
        <path class="signal" d="M364 64h20V48h40V32h52M64 118h40v-12h32v-12h40" fill="none" stroke-width="2" stroke-dasharray="4 8" />
        <path class="spark" d="M394 26h4v4h4v4h-4v4h-4v-4h-4v-4h4zM78 26h4v4h4v4h-4v4h-4v-4h-4v-4h4zM566 104h4v4h4v4h-4v4h-4v-4h-4v-4h4z" />
        <path class="signal-packet" d="M420 44h8v8h-8zM100 114h8v8h-8z" />
      </g>

      <g class="island">
        <path class="soil-dark" d="M96 166h424v20h-28v12h-36v12h-52v12h-76v8h-88v-8h-60v-12h-44v-12h-28v-12H96z" />
        <path class="soil" d="M96 166h424v12h-28v12h-40v12h-52v12h-76v8h-80v-8h-64v-12h-44v-12h-28v-12H96z" />
        <path class="soil-shadow" d="M408 178h84v12h-40v12h-52v12h-76v8h-28v-12h52v-12h36v-12h24zM156 190h24v12h44v12h-44v-12h-24z" />
        <path class="soil-stones" d="M168 180h16v8h-16zM230 192h20v8h-20zM286 180h12v8h-12zM344 200h16v8h-16zM436 184h12v8h-12zM276 214h12v4h-12z" />
        <path class="grass-edge" d="M96 158h24v-8h44v-8h60v-4h124v4h72v8h76v8h24v12h-24v8H120v-8H96z" />
        <path class="grass-face" d="M100 158h24v-8h44v-4h56v-4h124v4h72v8h76v8h20v8h-28v4H124v-8h-24z" />
        <path class="grass-patches" d="M136 158h40v4h-40zM192 168h24v4h-24zM332 166h36v4h-36zM440 156h28v4h-28zM468 168h20v4h-20z" />
      </g>

      <g class="tree">
        <path class="wood" d="M138 106h12v48h-12zM130 122h8v8h-8zM150 114h8v8h-8z" />
        <path class="leaf-edge" d="M122 70h16V58h20v12h16v16h12v24h-12v12h-52v-12h-12V86h12z" />
        <path class="leaf" d="M126 74h16V62h12v12h16v16h12v16h-12v12h-44v-12h-12V90h12z" />
        <path class="leaf-light" d="M130 78h12V66h8v12h16v12h-20v12h-16z" />
        <path class="leaf-detail" d="M162 98h12v8h-12zM122 106h12v8h-12z" />
      </g>

      <g class="outpost-building">
        <path class="building-outline" d="M198 76h24V64h100v8h32v16h12v76H198z" />
        <path class="roof-dark" d="M202 76h24V68h92v8h32v12H202z" />
        <path class="roof-light" d="M222 68h96v8h28v8H206v-4h20z" />
        <path class="building-side" d="M338 88h24v72h-24z" />
        <path class="building-face" d="M202 88h136v72H202z" />
        <path class="building-base" d="M198 156h168v8H198z" />
        <path class="roof-seam" d="M206 84h132v4H206z" />

        <path class="window-frame" d="M214 100h44v32h-44zM272 100h48v32h-48z" />
        <path class="window" d="M218 104h36v24h-36zM276 104h40v24h-40z" />
        <path class="window-shade" d="M238 104h16v24h-16zM296 104h20v24h-20z" />
        <path class="window-light" d="M222 108h12v4h-12zM280 108h12v4h-12z" />
        <path class="window-frame" d="M234 104h4v24h-4zM292 104h4v24h-4z" />

        <path class="door-frame" d="M276 138h24v22h-24z" />
        <path class="door" d="M280 142h16v18h-16z" />
        <path class="door-light" d="M288 148h4v4h-4z" />
        <path class="building-trim" d="M214 138h44v4h-44zM214 146h32v4h-32zM314 140h12v8h-12zM344 104h10v4h-10zM344 116h10v4h-10zM344 128h10v4h-10z" />
        <path class="status" d="M318 144h4v4h-4z" />
      </g>

      <g class="dish">
        <path class="metal-dark" d="M230 48h8v20h-8zM224 64h20v4h-20z" />
        <path class="dish-edge" d="M198 22h8v8h8v8h12v4h16v-4h12v-8h8v-8h8v16h-8v8h-8v8h-12v4h-16v-4h-12v-8h-8v-8h-8z" />
        <path class="dish-face" d="M202 26h4v8h8v8h12v4h16v-4h12v-8h8v-8h4v12h-8v8h-8v4h-12v4h-8v-4h-12v-4h-8v-8h-8z" />
        <path class="dish-light" d="M202 22h4v8h8v8h12v4h16v-4h12v-8h8v-8h4v4h-4v8h-8v8h-12v4h-16v-4h-12v-8h-8v-8h-4z" />
        <path class="metal-dark" d="M230 18h4v28h-4z" />
        <path class="signal-light" d="M226 14h12v8h-12z" />
      </g>

      <g class="communications-tower">
        <path class="metal-dark" d="M488 46h8v112h-8zM468 158h48v4h-48z" />
        <path class="metal-light" d="M490 50h2v104h-2z" />
        <path class="tower-brace" d="M488 66h-4v16h-4v16h-4v20h-4v20h-4v20h4v-20h4v-20h4V98h4V82h4zM496 66h4v16h4v16h4v20h4v20h4v20h-4v-20h-4v-20h-4V98h-4V82h-4z" />
        <path class="metal-dark" d="M480 98h24v4h-24zM476 122h32v4h-32zM472 146h40v4h-40zM476 58h32v4h-32zM472 74h40v4h-40z" />
        <path class="antenna" d="M480 38h24v12h-24zM486 26h12v12h-12zM490 14h4v12h-4z" />
        <path class="signal-light" d="M490 10h4v4h-4z" />
        <path class="signal" d="M476 22h-6v6h-6v12M508 22h6v6h6v12M464 14h-6v6h-6v16M520 14h6v6h6v16" fill="none" stroke-width="3" />
      </g>

      <g class="guardian" transform="translate(384 104)">
        <!-- A sprout antenna and square display give the guardian its own silhouette. -->
        <path class="robot-outline" d="M20 0h4v12h-4zM8 12h28v4h4v24h-4v4H8v-4H4V16h4zM12 44h20v16H12zM4 48h8v8H4zM32 48h8v8h-8zM8 60h12v4H8zM24 60h12v4H24z" />
        <path class="robot-leaf" d="M12 0h8v4h-8zM24 -4h8v4h-4v4h-4z" />
        <path class="robot-body" d="M8 16h28v24H8zM16 44h12v12H16zM4 48h4v4H4zM36 48h4v4h-4z" />
        <path class="robot-light" d="M8 16h28v4H12v16H8zM16 44h4v8h-4z" />
        <path class="robot-screen" d="M12 24h20v12H12z" />
        <path class="robot-eye" d="M16 28h4v4h-4zM24 28h4v4h-4z" />
        <path class="robot-detail" d="M20 48h4v4h-4z" />
      </g>

      <g class="small-plants">
        <path class="grass-edge" d="M112 152v-8h4v4h4v-8h4v12zM174 158v-8h4v4h4v-8h4v12zM442 158v-8h4v4h4v-8h4v12zM516 162v-8h4v4h4v-8h4v12z" />
        <path class="flower" d="M170 144h4v4h-4zM520 148h4v4h-4z" />
        <path class="grass-patches" d="M368 158h8v4h-8zM424 164h8v4h-8z" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.pixel-outpost {
  --outpost-cloud: #e6e9dd;
  --outpost-signal: #c9d9cd;
  --outpost-spark: #d6cda4;
  --outpost-grass-edge: #adc39d;
  --outpost-grass: #d3dfbe;
  --outpost-grass-patch: #c0d0aa;
  --outpost-soil: #dacbb2;
  --outpost-soil-dark: #c1ae93;
  --outpost-soil-shadow: #cebc9f;
  --outpost-soil-stone: #bcae97;
  --outpost-leaf-edge: #a0bb9c;
  --outpost-leaf: #bbd0ac;
  --outpost-leaf-light: #d3dfb8;
  --outpost-leaf-detail: #acc39e;
  --outpost-wood: #bbaa8b;
  --outpost-outline: #879e96;
  --outpost-cream: #f0eee0;
  --outpost-side: #d9e0d2;
  --outpost-base: #b6c4b6;
  --outpost-roof: #b6c8bb;
  --outpost-roof-light: #d5dfcc;
  --outpost-window: #b0d5d2;
  --outpost-window-shade: #98bebc;
  --outpost-window-light: #d7e8de;
  --outpost-door: #c5d2bd;
  --outpost-trim: #c6d1c1;
  --outpost-metal: #93aaa2;
  --outpost-metal-light: #c7d8ca;
  --outpost-dish: #d7e5d6;
  --outpost-dish-light: #edf0df;
  --outpost-status: #8aba93;
  --outpost-robot: #88c3bc;
  --outpost-robot-light: #b6d8ca;
  --outpost-screen: #547f7a;
  --outpost-eye: #e8efce;
  width: 100%;
  max-width: 640px;
  height: 240px;
  margin: 0 auto;
  pointer-events: none;
  user-select: none;
}

:root.dark .pixel-outpost {
  --outpost-cloud: #29332f;
  --outpost-signal: #344a40;
  --outpost-spark: #6b6544;
  --outpost-grass-edge: #4f6950;
  --outpost-grass: #394e3b;
  --outpost-grass-patch: #465d43;
  --outpost-soil: #51493c;
  --outpost-soil-dark: #615342;
  --outpost-soil-shadow: #433d34;
  --outpost-soil-stone: #6b5d49;
  --outpost-leaf-edge: #557552;
  --outpost-leaf: #45653f;
  --outpost-leaf-light: #5f7a4d;
  --outpost-leaf-detail: #3b5638;
  --outpost-wood: #6d5f47;
  --outpost-outline: #627e74;
  --outpost-cream: #555e51;
  --outpost-side: #3c514a;
  --outpost-base: #43594f;
  --outpost-roof: #426354;
  --outpost-roof-light: #577761;
  --outpost-window: #4c8580;
  --outpost-window-shade: #3f706d;
  --outpost-window-light: #779e8b;
  --outpost-door: #3d5143;
  --outpost-trim: #708472;
  --outpost-metal: #647e76;
  --outpost-metal-light: #8b9c86;
  --outpost-dish: #668075;
  --outpost-dish-light: #8fa28c;
  --outpost-status: #82ad7b;
  --outpost-robot: #4b8e86;
  --outpost-robot-light: #78a799;
  --outpost-screen: #284a47;
  --outpost-eye: #b1c99c;
}

svg {
  display: block;
  width: 100%;
  height: 100%;
}

.cloud { fill: var(--outpost-cloud); }
.signal { stroke: var(--outpost-signal); }
.spark,
.flower { fill: var(--outpost-spark); }
.signal-packet { fill: var(--outpost-signal); }
.soil { fill: var(--outpost-soil); }
.soil-dark { fill: var(--outpost-soil-dark); }
.soil-shadow { fill: var(--outpost-soil-shadow); }
.soil-stones { fill: var(--outpost-soil-stone); }
.grass-edge { fill: var(--outpost-grass-edge); }
.grass-face { fill: var(--outpost-grass); }
.grass-patches { fill: var(--outpost-grass-patch); }
.wood { fill: var(--outpost-wood); }
.leaf-edge { fill: var(--outpost-leaf-edge); }
.leaf { fill: var(--outpost-leaf); }
.leaf-light { fill: var(--outpost-leaf-light); }
.leaf-detail { fill: var(--outpost-leaf-detail); }
.building-outline,
.window-frame,
.door-frame,
.dish-edge,
.robot-outline { fill: var(--outpost-outline); }
.building-face { fill: var(--outpost-cream); }
.building-side { fill: var(--outpost-side); }
.building-base { fill: var(--outpost-base); }
.roof-dark,
.roof-seam { fill: var(--outpost-roof); }
.roof-light { fill: var(--outpost-roof-light); }
.window { fill: var(--outpost-window); }
.window-shade { fill: var(--outpost-window-shade); }
.window-light,
.door-light { fill: var(--outpost-window-light); }
.door { fill: var(--outpost-door); }
.building-trim { fill: var(--outpost-trim); }
.status,
.signal-light { fill: var(--outpost-status); }
.metal-dark,
.tower-brace,
.antenna { fill: var(--outpost-metal); }
.metal-light { fill: var(--outpost-metal-light); }
.dish-face { fill: var(--outpost-dish); }
.dish-light { fill: var(--outpost-dish-light); }
.robot-body { fill: var(--outpost-robot); }
.robot-light { fill: var(--outpost-robot-light); }
.robot-screen { fill: var(--outpost-screen); }
.robot-eye { fill: var(--outpost-eye); }
.robot-leaf,
.robot-detail { fill: var(--outpost-status); }

@media (max-width: 639px) {
  .pixel-outpost {
    height: auto;
    aspect-ratio: 8 / 3;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pixel-outpost * {
    animation: none;
    transition: none;
  }
}
</style>
