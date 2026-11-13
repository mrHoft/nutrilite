<script setup lang="ts">
import { useProgress } from '@/composables/useProgress'
import { lessonHref } from '@/router/routes'
import type { LessonMeta } from '@/types/lesson'

const props = defineProps<{
  currentId: string
  previous?: LessonMeta
  next?: LessonMeta
}>()

const { statusOf, markCompleted } = useProgress()

function completeCurrent() {
  if (statusOf(props.currentId) !== 'completed') {
    markCompleted(props.currentId)
  }
}
</script>

<template>
  <nav class="lesson-nav-footer" aria-label="Навигация по модулям">
    <a
      v-if="previous"
      class="nav-card"
      :href="lessonHref(previous.id)"
    >
      <span class="nav-label">← Назад</span>
      <span class="nav-title">{{ previous.shortTitle }}</span>
    </a>
    <span v-else class="nav-card-placeholder" />

    <a
      v-if="next"
      class="nav-card nav-card-next"
      :href="lessonHref(next.id)"
      @click="completeCurrent"
    >
      <span class="nav-label">Далее →</span>
      <span class="nav-title">{{ next.shortTitle }}</span>
    </a>
    <a
      v-else
      class="nav-card nav-card-next"
      href="/progress"
      @click="completeCurrent"
    >
      <span class="nav-label">Далее →</span>
      <span class="nav-title">Мой прогресс</span>
    </a>
  </nav>
</template>

<style scoped>
.lesson-nav-footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding-top: 1.75rem;
  border-top: 1px solid var(--border);
}

.nav-card {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem 1.1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  text-decoration: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.nav-card:hover {
  border-color: var(--green);
  box-shadow: var(--shadow);
}

.nav-card-next {
  text-align: right;
}

.nav-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--green);
}

.nav-title {
  font-size: 0.88rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--ink);
}

.nav-card-placeholder {
  display: block;
}

@media (max-width: 640px) {
  .lesson-nav-footer {
    grid-template-columns: 1fr;
  }

  .nav-card-placeholder {
    display: none;
  }
}
</style>