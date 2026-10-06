<script setup lang="ts">
withDefaults(defineProps<{ size?: number, online?: boolean }>(), {
  size: 32,
  online: true,
})
</script>

<template>
  <svg
    class="guardian" :class="{ asleep: !online }"
    :width="size" :height="size" viewBox="0 0 24 24"
    shape-rendering="crispEdges" aria-hidden="true" focusable="false"
  >
    <!-- A little server with a sprout antenna, drawn on a 24 × 24 grid. -->
    <path class="outline" d="M11 3h2v4h7v3h2v6h-2v4h-2v1h2v2h-6v-3h-4v3H4v-2h2v-1H4v-4H2v-6h2V7h7z" />
    <path class="shell" d="M5 8h14v11H5zM3 11h1v4H3zM20 11h1v4h-1z" />
    <path class="screen-border" d="M6 9h12v7H6z" />
    <path class="screen" d="M7 10h10v5H7z" />
    <path v-if="online" class="face" d="M8 11h2v2H8zM14 11h2v2h-2zM11 14h2v1h-2z" />
    <path v-else class="face" d="M8 12h3v1H8zM13 12h3v1h-3z" />
    <path class="vent" d="M7 17h5v1H7zM7 18h3v1H7z" />
    <path class="lamp" d="M15 17h2v2h-2z" />
    <path class="sprout" d="M7 2h4v1h1v2h-2V4H8V3H7zM13 2h1V1h4v2h-1v1h-2v1h-2zM11 4h2v3h-2z" />
    <path class="foot" d="M6 20h3v1H6zM15 20h3v1h-3z" />
  </svg>
</template>

<style scoped>
.guardian {
  --guardian-outline: #1b1b1f;
  --guardian-shell: #59cbd3;
  --guardian-screen: #fffdf7;
  --guardian-sprout: var(--green);
  --guardian-lamp: var(--green);
  display: block;
  flex: none;
  overflow: visible;
}

.outline,
.screen-border,
.face {
  fill: var(--guardian-outline);
}

.shell {
  fill: var(--guardian-shell);
}

.screen {
  fill: var(--guardian-screen);
}

.vent {
  fill: color-mix(in srgb, var(--guardian-outline) 50%, var(--guardian-shell));
}

.lamp {
  fill: var(--guardian-lamp);
}

.sprout {
  fill: var(--guardian-sprout);
}

.foot {
  fill: var(--guardian-shell);
}

.asleep {
  --guardian-shell: #a6a4a1;
  --guardian-screen: #d9d7d2;
  --guardian-sprout: #85837d;
  --guardian-lamp: #77726a;
}

:root.dark .guardian:not(.asleep) {
  --guardian-shell: #63d5da;
}
</style>
