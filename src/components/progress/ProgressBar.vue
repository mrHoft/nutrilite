<script setup lang="ts">
withDefaults(
  defineProps<{
    value: number
    compact?: boolean
    label?: string
  }>(),
  { compact: false },
)
</script>

<template>
  <div
    class="progress-bar"
    :class="{ 'progress-bar-compact': compact }"
    role="progressbar"
    :aria-label="label"
    :aria-valuenow="Math.round(value)"
    aria-valuemin="0"
    aria-valuemax="100"
  >
    <span class="progress-bar-fill" :style="{ width: `${Math.max(0, Math.min(100, value))}%` }" />
  </div>
</template>

<style scoped>
.progress-bar {
  width: 100%;
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--surface-muted);
}

.progress-bar-compact {
  height: 6px;
}

.progress-bar-fill {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--green), var(--lime));
  transition: width 0.35s ease;
}

@media (prefers-reduced-motion: reduce) {
  .progress-bar-fill {
    transition: none;
  }
}
</style>