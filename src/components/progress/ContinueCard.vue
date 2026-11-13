<script setup lang="ts">
import { computed } from 'vue'

import { getLessonMeta, getLessons } from '@/content/lessonRepository'
import { useProgress } from '@/composables/useProgress'
import { lessonHref } from '@/router/routes'

const lessons = getLessons()
const firstLesson = lessons[0]
const { progress, getLessonProgress, statusOf } = useProgress()

const allCompleted = computed(
  () =>
    lessons.length > 0 &&
    lessons.every((lesson) => statusOf(lesson.id) === 'completed'),
)

const target = computed(() => {
  if (allCompleted.value) return firstLesson

  const last = progress.lastLessonId
    ? getLessonMeta(progress.lastLessonId)
    : undefined

  if (last && statusOf(last.id) !== 'completed') return last

  return lessons.find((lesson) => statusOf(lesson.id) !== 'completed') ?? firstLesson
})

const lessonProgress = computed(() =>
  target.value ? getLessonProgress(target.value.id) : undefined,
)

const label = computed(() => {
  if (!target.value) return 'Начать обучение'
  if (allCompleted.value) return 'Повторить курс'
  if (statusOf(target.value.id) === 'in-progress') return 'Продолжить чтение'
  return 'Перейти к модулю'
})

const kicker = computed(() => {
  if (allCompleted.value) return 'Курс пройден'
  const state = lessonProgress.value
  if (state && state.status === 'in-progress' && state.scrollPercent >= 3) {
    return 'Вы остановились здесь'
  }
  return 'Следующий шаг'
})
</script>

<template>
  <section v-if="target" class="continue-card">
    <div class="continue-copy">
      <p class="continue-kicker">{{ kicker }}</p>
      <h2>{{ target.title }}</h2>
      <p class="continue-meta">
        {{ target.readingMinutes }} мин чтения
        <template v-if="target.format"> · {{ target.format }}</template>
      </p>
    </div>

    <div class="continue-actions">
      <a class="primary-button" :href="lessonHref(target.id)">{{ label }}</a>
      <a
        v-if="firstLesson && target.id !== firstLesson.id"
        class="ghost-button"
        :href="lessonHref(firstLesson.id)"
      >
        С начала курса
      </a>
    </div>
  </section>
</template>

<style scoped>
.continue-card {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
  justify-content: space-between;
  padding: clamp(1.25rem, 3vw, 2rem);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background:
    radial-gradient(circle at 100% 0%, var(--green-soft), transparent 55%),
    var(--surface);
  box-shadow: var(--shadow);
}

.continue-copy {
  min-width: min(100%, 22rem);
  flex: 1 1 22rem;
}

.continue-kicker {
  margin: 0 0 0.4rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--green);
}

.continue-card h2 {
  margin: 0 0 0.35rem;
  font-size: clamp(1.2rem, 2.4vw, 1.55rem);
  line-height: 1.25;
  color: var(--ink);
}

.continue-meta {
  margin: 0;
  font-size: 0.9rem;
  color: var(--muted);
}

.continue-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}
</style>