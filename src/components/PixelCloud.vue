<template>
  <g class="drifting-cloud">
    <path class="cloud-shadow" d="M-128 0v-12h20v-12h20v-16h24v-20h28v-16H0v12h24v16h24v12h28v12h24v12h28V0z" />
    <path class="cloud-body" d="M-128-8v-12h20v-12h20v-16h24v-20h28v-16H0v12h24v16h24v12h28v12h24v12h28v12z" />
    <path class="cloud-light" d="M-88-36v-12h24v-20h28v-16H0v12h16v16h-40v8h-20v12z" />
    <path class="cloud-shade" d="M-80-16v-12h24v-12h24v-12H0v12h24v12h24v8h32v8H-96v-4z" />
  </g>
</template>

<style scoped>
.drifting-cloud {
  animation: cloud-travel var(--cloud-duration, 28s) steps(100, end) var(--cloud-delay, 0s) infinite alternate;
}
.cloud-shadow { fill: var(--world-cloud-edge, #c5d7cf); }
.cloud-body { fill: var(--world-cloud, #f5efdc); }
.cloud-light { fill: var(--world-cloud-light, #fff9e9); }
.cloud-shade { fill: var(--world-cloud-edge, #c5d7cf); opacity: 0.22; }
@keyframes cloud-travel {
  from { translate: calc(-1 * var(--cloud-travel, 96px)) 0; }
  to { translate: var(--cloud-travel, 96px) 0; }
}
@media (prefers-reduced-motion: reduce) {
  .drifting-cloud { animation: none; }
}
</style>
