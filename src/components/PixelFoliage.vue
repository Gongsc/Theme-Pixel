<script setup lang="ts">
withDefaults(defineProps<{
  kind?: 'grass' | 'shrub' | 'vine' | 'tree'
  treeStyle?: 'pine' | 'oak' | 'birch' | 'cypress' | 'willow'
}>(), { kind: 'grass', treeStyle: 'pine' })
</script>

<template>
  <!-- Placement belongs to the parent group, keeping every root anchored during sway. -->
  <g class="foliage" :class="[`foliage-${kind}`, kind === 'tree' && `tree-${treeStyle}`]">
    <template v-if="kind === 'tree'">
      <template v-if="treeStyle === 'oak'">
        <path class="wood" d="M-8 0v-48h-12v-12h-12v-16h12v12h16v12h8v-20h12v-16h8v24H12V0z" />
        <path class="shade" d="M-32-140H8v8h24v16h20v16h12v36H48v16H20v8h-48v-8h-28v-16h-12v-36h12v-20h24z" />
        <path class="leaf" d="M-32-140H8v8h24v16h16v24H32v12H8v12h-36v8h-28v-16h-12v-24h12v-20h24z" />
        <path class="light" d="M-32-132H0v8h-24v16h-20v16h-16v-12h12v-16h16zM4-116h20v12H4zM-24-84h16v8h-16z" />
        <path class="shade" d="M-4-100h16v12H-4zM28-72h12v12H28zM-44-64h16v8h-16z" />
      </template>
      <template v-else-if="treeStyle === 'birch'">
        <path class="wood" d="M-6 0v-68h-12v-16h-12v-12h8v8h12v12h4v-48H6v60h12v-20h8v28H6V0z" />
        <path class="bark" d="M-6-16H2v4h-8zM-2-36H6v4h-8zM-6-56H2v4h-8zM-6-104H2v4h-8z" />
        <path class="shade" d="M-12-164H12v12h16v16h8v28h-8v16H12v8H-8v-8h-20v-16h-8v-28h8v-16h16zM-40-116h16v8h12v24h-8v12h-24v-8h-8v-24h12zM28-104h16v8h8v20h-8v12H20v-12h-8v-16h16z" />
        <path class="leaf" d="M-12-164H12v12h8v24h-8v20H-8v8h-20v-16h-8v-20h8v-16h16zM-40-116h16v12h4v16h-24v-16h4zM28-104h16v16h-8v12H20v-16h8z" />
        <path class="light" d="M-12-156H4v12H-8v20h-12v-16h8zM-40-108h12v8h-12zM28-96h8v8h-8z" />
      </template>
      <template v-else-if="treeStyle === 'cypress'">
        <path class="wood" d="M-4-40H4V0H-4z" />
        <path class="shade" d="M-4-172H4v16h8v20h8v24h8v32h8v44h-8v16H12v8h-24v-8h-16v-16h-8v-44h8v-32h8v-24h8v-20h8z" />
        <path class="leaf" d="M-4-172H4v28h4v32h8v40h8v32H12v16H-8v-8h-16v-48h8v-32h8v-32h4z" />
        <path class="light" d="M-4-148H4v32H-4zM-12-104H-4v28h-8zM-20-64h8v20h-8zM4-48h8v16H4z" />
        <path class="shade" d="M4-100h8v20H4zM-8-56H0v20H-8z" />
      </template>
      <template v-else-if="treeStyle === 'willow'">
        <path class="wood" d="M-6 0v-60h-14v-16h-16v-12h12v8h16v12H4v-16h16v-12h12v20H16v16H6V0z" />
        <path class="shade" d="M-20-136H20v8h24v16h16v16h12v48H60v-24h-8v36H40v-28h-8v16H20v-28H4v8h-20v-8h-12v32h-12v-24h-8v36h-12v-28h-12v-40h12v-20h16v-16h24z" />
        <path class="leaf" d="M-20-136H20v8h16v16h16v16h8v16H44v-8H28v-12H4v8h-24v12h-16v-8h-16v24h-12v-32h12v-16h16v-16h16zM-40-80h8v28h-8zM40-84h8v32h-8zM20-88h8v24h-8z" />
        <path class="light" d="M-20-128H12v8h-24v12h-24v16h-12v-20h16zM12-112h16v8H12zM-60-84h8v16h-8zM44-92h8v12h-8z" />
      </template>
      <template v-else>
        <path class="wood" d="M-6-26H6V0H-6z" />
        <path class="shade" d="M-6-144H6v16h8v16h8v16h10v16h12v20h12v20h12v16H-68v-16h12v-20h12v-20h12v-16h10v-16h8v-16h8z" />
        <path class="leaf" d="M-6-144H6v16h8v16h8v16h10v16h12v16H20v12h16v16H8v12h-60v-16h12v-20h12v-16h10v-16h8v-16h4z" />
        <path class="light" d="M-6-132H2v28h-8v16h-8v16h-10v16h-12v16h-12v-12h10v-20h10v-16h10v-16h8zM-14-50H2v8h-16zM4-88h8v8H4z" />
        <path class="shade" d="M12-112h8v16h-8zM-16-68h12v12h-12zM4-44h16v12H4zM-44-32h12v8h-12z" />
      </template>
    </template>
    <template v-else-if="kind === 'shrub'">
      <path class="stem" d="M-4 0v-52h-8v-24h8v20h8v-32h8v36H4V0zM-12-40h-20v-8h20zM4-24h24v-8H4z" />
      <path class="shade" d="M-36-42h-16v-24h16v8h16v16zM16-24v-24h12v-12h20v24H36v12zM-20-68v-28h16v8H8v20zM4-88v-24h16v-8h12v24H20v8z" />
      <path class="leaf" d="M-44-62h12v12h8v8h-16v-8h-4zM24-44h8v-12h12v16H32v8h-8zM-16-92H-4v12H4v8h-20zM12-108h8v-8h8v16H16v8h-4z" />
      <path class="light" d="M-40-62h8v8h-8zM32-52h8v8h-8zM-12-88h8v12h-8zM20-112h8v8h-8z" />
    </template>
    <template v-else-if="kind === 'vine'">
      <path class="stem" d="M-4 0h8v48h8v40H4v48h-8v40h-8v-48h8V80h8V48h-8z" />
      <path class="shade" d="M-20 12h16v24h-8v-8h-8zM4 44h24v12h-12v12H4zM-12 80H4v20H-4v-8h-8zM4 112h20v12H12v12H4zM-20 144h16v20h-8v-8h-8zM-12 172h12v12h-12z" />
      <path class="leaf" d="M-16 12h12v12h-12zM12 44h12v12H12zM-8 80H4v12H-8zM8 112h12v8H8zM-16 144h12v12h-12zM-12 172h8v8h-8z" />
      <path class="light" d="M-12 12h8v8h-8zM16 44h8v8h-8zM-8 80H0v8h-8zM-16 144h8v8h-8z" />
    </template>
    <template v-else>
      <path class="shade" d="M-24 0v-24h-8v-16h8v8h8v24h8v-40h8v24h8v-32h8v32h8v-16h8v24h-8V0z" />
      <path class="leaf" d="M-20-24h8V0h-8zM-8-44H0V0H-8zM8-48h8v40H8zM24-28h8v12h-8z" />
      <path class="light" d="M-8-44H0v12H-8zM8-48h8v12H8zM-20-28h8v8h-8z" />
    </template>
  </g>
</template>

<style scoped>
.foliage {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: foliage-sway var(--sway-duration, 4s) steps(12, end) var(--sway-delay, 0s) infinite;
}
.foliage-vine { transform-origin: 50% 0%; animation-name: vine-sway; }
.foliage-tree { animation-name: tree-sway; }
.tree-oak { --tree-shade: #72804b; --tree-leaf: #a0ad64; --tree-light: #c5cd85; }
.tree-birch { --tree-wood: #e0ddbd; --tree-shade: #7b925e; --tree-leaf: #a9bd79; --tree-light: #d1dba0; }
.tree-cypress { --tree-shade: #4e7464; --tree-leaf: #739789; --tree-light: #a0bbaa; }
.tree-willow { --tree-shade: #738853; --tree-leaf: #a2b472; --tree-light: #cbd496; }
.wood { fill: var(--tree-wood, #8b8b61); }
.bark { fill: #81866c; }
.stem { fill: #6c8044; }
.shade { fill: var(--tree-shade, #66814c); }
.leaf { fill: var(--tree-leaf, #90a65e); }
.light { fill: var(--tree-light, #bbca7d); }
@keyframes foliage-sway {
  0%, 100% { transform: skewX(-8deg) rotate(-3deg); }
  50% { transform: skewX(9deg) rotate(4deg); }
}
@keyframes vine-sway {
  0%, 100% { transform: rotate(-7deg); }
  50% { transform: rotate(8deg); }
}
@keyframes tree-sway {
  0%, 100% { transform: skewX(-3deg) rotate(-2deg); }
  50% { transform: skewX(4deg) rotate(2deg); }
}
@media (prefers-reduced-motion: reduce) {
  .foliage { animation: none; }
}
</style>
