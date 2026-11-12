<script setup lang="ts">
import type { LessonStatus } from '@/types/progress'

defineProps<{
  status: LessonStatus
}>()

const labels: Record<LessonStatus, string> = {
  'not-started': 'Не начат',
  'in-progress': 'В процессе',
  completed: 'Пройден',
}
</script>

<template>
  <span class="status-badge" :class="`status-${status}`">{{ labels[status] }}</span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.status-not-started {
  color: var(--muted);
  background: var(--surface-muted);
}

.status-in-progress {
  color: #8a6300;
  background: var(--yellow-soft);
}

.status-completed {
  color: var(--green-dark);
  background: var(--green-soft);
}

@media (prefers-color-scheme: dark) {
  .status-in-progress {
    color: var(--yellow);
  }

  .status-completed {
    color: var(--lime);
  }
}
</style>