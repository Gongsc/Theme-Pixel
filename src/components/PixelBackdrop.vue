<template>
  <div class="pixel-backdrop" aria-hidden="true">
    <svg class="sky" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" focusable="false" shape-rendering="crispEdges">
      <!-- Quiet scenery at the edges keeps the monitoring panels in focus. -->
      <g class="cloud cloud-a" transform="translate(570 224)">
        <path class="cloud-shadow" d="M0 16h16V8h24V0h32v8h24v8h20v16H0z" />
        <path class="cloud-face" d="M0 12h16V4h24v-8h32v8h24v8h20v16H0z" />
        <path class="cloud-highlight" d="M28 4h16v-8h20v8h24v8H28z" />
      </g>
      <g class="cloud cloud-b" transform="translate(1184 218)">
        <path class="cloud-shadow" d="M0 16h12V8h20V0h28v8h24v8h12v16H0z" />
        <path class="cloud-face" d="M0 12h12V4h20v-8h28v8h24v8h12v16H0z" />
        <path class="cloud-highlight" d="M24 4h12v-8h20v8h20v8H24z" />
      </g>
      <g class="cloud cloud-c" transform="translate(278 550)">
        <path class="cloud-shadow" d="M0 12h12V4h16v-8h28v8h20v8h12v16H0z" />
        <path class="cloud-face" d="M0 8h12V0h16v-8h28v8h20v8h12v16H0z" />
      </g>
      <g class="cloud cloud-d" transform="translate(1020 662)">
        <path class="cloud-face" d="M0 12h16V4h24v-8h28v8h20v8h16v12H0z" />
      </g>

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
    </svg>

    <svg class="terrain" viewBox="0 0 1440 200" preserveAspectRatio="none" focusable="false" shape-rendering="crispEdges">
      <path class="mountains-back" d="M0 112h40v-16h40V76h40V56h48V36h48v20h40v20h48v24h52v20h72v-16h56V84h56V68h56V52h48v16h48v20h56v24h88v-20h64V76h48V56h48V40h48v16h48v24h48v20h48v16h72v-16h64V84h48V68h48V52h48v16h40v28h48v16h80v88H0z" />
      <path class="mountains-front" d="M0 146h64v-16h48v-20h48V90h40v20h48v20h56v16h120v-16h56v-20h56V94h48v16h56v20h64v16h128v-16h48v-20h48V94h40v16h48v20h56v16h128v-16h56v-16h48V98h48v16h48v16h48v16h64v54H0z" />
      <path class="ground" d="M0 170h88v-8h80v8h116v-12h76v12h152v-8h100v8h128v-12h76v12h108v-8h96v8h160v-12h76v12h84v30H0z" />
      <path class="ground-detail" d="M36 180h16v4H36zM116 172h8v4h-8zM220 184h12v4h-12zM382 180h20v4h-20zM504 176h12v4h-12zM618 186h20v4h-20zM764 176h12v4h-12zM888 182h16v4h-16zM1024 176h8v4h-8zM1144 184h16v4h-16zM1288 176h12v4h-12zM1392 182h16v4h-16z" />
      <g class="grass">
        <path d="M60 170v-8h4v4h4v-8h4v12zM332 170v-8h4v4h4v-8h4v12zM680 170v-8h4v4h4v-8h4v12zM1064 170v-8h4v4h4v-8h4v12zM1360 170v-8h4v4h4v-8h4v12z" />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.pixel-backdrop {
  --world-cloud: #dce6e5;
  --world-cloud-edge: #cbdad8;
  --world-cloud-light: #edf0e5;
  --world-star: #cbded8;
  --world-warm: #e8dcae;
  --world-line: #dce4d9;
  --world-packet: #cadbd2;
  --world-purple: #ddd3e7;
  --world-back: #e9eadf;
  --world-front: #e2e6d7;
  --world-ground: #d9dfca;
  --world-grass: #cad5bb;
  --world-ground-detail: #cfd6c0;
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
  user-select: none;
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
  --world-back: #1d2529;
  --world-front: #232e2e;
  --world-ground: #2a3530;
  --world-grass: #344236;
  --world-ground-detail: #313e35;
}

.sky {
  position: absolute;
  inset: 0;
  width: 100%;
  height: min(100%, 900px);
}

.cloud-face { fill: var(--world-cloud); }
.cloud-shadow { fill: var(--world-cloud-edge); }
.cloud-highlight { fill: var(--world-cloud-light); }
.stars { fill: var(--world-star); }
.star-warm,
.packet-warm { fill: var(--world-warm); }
.data-paths { stroke: var(--world-line); }
.packets { fill: var(--world-packet); }
.packet-purple { fill: var(--world-purple); }

.terrain {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: clamp(112px, 20vh, 180px);
}

.mountains-back { fill: var(--world-back); }
.mountains-front { fill: var(--world-front); }
.ground { fill: var(--world-ground); }
.ground-detail { fill: var(--world-ground-detail); }
.grass { fill: var(--world-grass); }

@media (max-width: 639px) {
  .sky { opacity: 0.6; }
  .terrain { height: 96px; }
}

@media (prefers-reduced-motion: reduce) {
  .pixel-backdrop *,
  .pixel-backdrop *::before,
  .pixel-backdrop *::after {
    animation: none;
    transition: none;
  }
}
</style>
