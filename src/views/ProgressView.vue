<script setup lang="ts">
import LessonStatusBadge from '@/components/progress/LessonStatusBadge.vue'
import ProgressBar from '@/components/progress/ProgressBar.vue'
import { useProgress } from '@/composables/useProgress'
import { getLessons } from '@/content/lessonRepository'

const lessons = getLessons()
const {
  statusOf,
  getLessonProgress,
  completedCount,
  inProgressCount,
  overallPercent,
  reset,
} = useProgress()

function formatDate(value?: number): string {
  if (!value) return '—'
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function onReset() {
  const confirmed = window.confirm(
    'Сбросить весь прогресс? Это действие нельзя отменить.',
  )
  if (confirmed) reset()
}
</script>

<template>
  <div class="progress-view">
    <header class="page-head">
      <p class="page-kicker">Личный кабинет</p>
      <h1>Мой прогресс</h1>
      <p class="page-lead">
        Прогресс сохраняется в этом браузере. Он не синхронизируется между
        устройствами.
      </p>
    </header>

    <section class="summary-card">
      <div class="summary-main">
        <span class="summary-percent">{{ overallPercent }}%</span>
        <p>курса пройдено</p>
        <ProgressBar :value="overallPercent" label="Общий прогресс курса" />
      </div>

      <div class="summary-stats">
        <div>
          <strong>{{ completedCount }}</strong>
          <span>пройдено</span>
        </div>
        <div>
          <strong>{{ inProgressCount }}</strong>
          <span>в процессе</span>
        </div>
        <div>
          <strong>{{ lessons.length - completedCount }}</strong>
          <span>осталось</span>
        </div>
      </div>
    </section>

    <section class="progress-list">
      <h2>По модулям</h2>

      <div class="progress-table-wrap">
        <table class="progress-table">
          <caption class="sr-only">Прогресс по модулям курса</caption>
          <thead>
            <tr>
              <th>Модуль</th>
              <th>Статус</th>
              <th>Позиция</th>
              <th>Последнее посещение</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lesson in lessons" :key="lesson.id">
              <td>
                <a class="progress-title" :href="`#/lesson/${lesson.id}`">
                  <span class="progress-number">
                    {{ String(lesson.order).padStart(2, '0') }}
                  </span>
                  {{ lesson.shortTitle }}
                </a>
              </td>
              <td>
                <LessonStatusBadge :status="statusOf(lesson.id)" />
              </td>
              <td class="progress-position">
                {{ Math.round(getLessonProgress(lesson.id)?.scrollPercent ?? 0) }}%
              </td>
              <td class="progress-date">
                {{ formatDate(getLessonProgress(lesson.id)?.lastVisitedAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <button type="button" class="danger-button" @click="onReset">
      Сбросить прогресс
    </button>
  </div>
</template>

<style scoped>
.progress-view {
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 3vw, 2.25rem);
  max-width: 960px;
  margin: 0 auto;
}

.page-kicker {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--green);
}

.page-head h1 {
  margin: 0 0 0.5rem;
  font-family: var(--font-heading);
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  letter-spacing: -0.02em;
  color: var(--ink);
}

.page-lead {
  margin: 0;
  max-width: 42rem;
  font-size: 0.92rem;
  line-height: 1.5;
  color: var(--muted);
}

.summary-card {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
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

.summary-main {
  min-width: min(100%, 18rem);
  flex: 1 1 18rem;
}

.summary-percent {
  font-family: var(--font-heading);
  font-size: clamp(2.2rem, 6vw, 3.2rem);
  font-weight: 700;
  line-height: 1;
  color: var(--green-dark);
  font-variant-numeric: tabular-nums;
}

.summary-main p {
  margin: 0.35rem 0 1rem;
  font-size: 0.85rem;
  color: var(--muted);
}

.summary-stats {
  display: flex;
  gap: 1.75rem;
}

.summary-stats div {
  display: flex;
  flex-direction: column;
}

.summary-stats strong {
  font-size: 1.4rem;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.summary-stats span {
  font-size: 0.75rem;
  color: var(--muted);
}

.progress-list h2 {
  margin: 0 0 0.9rem;
  font-family: var(--font-heading);
  font-size: 1.2rem;
  color: var(--ink);
}

.progress-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
}

.progress-table {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
  font-size: 0.86rem;
}

.progress-table th {
  padding: 0.7rem 1rem;
  border-bottom: 1px solid var(--border);
  color: var(--muted);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: left;
  background: var(--surface-muted);
}

.progress-table td {
  padding: 0.7rem 1rem;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.progress-table tr:last-child td {
  border-bottom: none;
}

.progress-title {
  display: inline-flex;
  gap: 0.6rem;
  align-items: baseline;
  color: var(--ink);
  font-weight: 600;
  text-decoration: none;
}

.progress-title:hover {
  color: var(--green-dark);
  text-decoration: underline;
}

.progress-number {
  font-size: 0.72rem;
  color: var(--green);
  font-variant-numeric: tabular-nums;
}

.progress-position,
.progress-date {
  color: var(--muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

@media (max-width: 560px) {
  .summary-stats {
    gap: 1.1rem;
  }
}
</style>