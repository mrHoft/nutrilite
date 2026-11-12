<script setup lang="ts">
import { getLessons } from '@/content/lessonRepository'
import { useProgress } from '@/composables/useProgress'
import { useRoute } from '@/router/useRoute'
import type { LessonStatus } from '@/types/progress'

defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()

const lessons = getLessons()
const { statusOf, completedCount } = useProgress()
const { route } = useRoute()

const statusLabels: Record<LessonStatus, string> = {
  'not-started': 'не начат',
  'in-progress': 'в процессе',
  completed: 'пройден',
}
</script>

<template>
  <aside class="app-sidebar" :class="{ 'is-open': open }">
    <div class="sidebar-head">
      <p class="sidebar-kicker">Программа курса</p>
      <p class="sidebar-count">{{ completedCount }} из {{ lessons.length }} модулей</p>
    </div>

    <nav class="lesson-nav" aria-label="Модули курса">
      <a
        v-for="lesson in lessons"
        :key="lesson.id"
        class="lesson-link"
        :class="{
          'is-active': route.name === 'lesson' && route.id === lesson.id,
          'is-completed': statusOf(lesson.id) === 'completed',
        }"
        :href="`#/lesson/${lesson.id}`"
        :title="lesson.title"
        :aria-label="`${lesson.shortTitle}. ${statusLabels[statusOf(lesson.id)]}`"
        :aria-current="
          route.name === 'lesson' && route.id === lesson.id ? 'page' : undefined
        "
        @click="$emit('close')"
      >
        <span class="lesson-number">{{ String(lesson.order).padStart(2, '0') }}</span>
        <span class="lesson-name">{{ lesson.shortTitle }}</span>
        <span
          class="lesson-dot"
          :class="`dot-${statusOf(lesson.id)}`"
          aria-hidden="true"
        />
      </a>
    </nav>

    <div class="sidebar-footer">
      <a href="#/progress" class="sidebar-progress-link" @click="$emit('close')">
        Общий прогресс
      </a>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  position: sticky;
  top: var(--header-height);
  display: flex;
  flex-direction: column;
  flex: 0 0 288px;
  max-height: calc(100vh - var(--header-height));
  overflow-y: auto;
  padding: 1.35rem 1rem 1.5rem;
  border-right: 1px solid var(--border);
  background: var(--surface);
}

.sidebar-head {
  padding: 0 0.6rem 0.9rem;
}

.sidebar-kicker {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--green);
}

.sidebar-count {
  margin: 0.25rem 0 0;
  font-size: 0.82rem;
  color: var(--muted);
}

.lesson-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lesson-link {
  display: grid;
  grid-template-columns: 1.9rem 1fr auto;
  gap: 0.55rem;
  align-items: center;
  padding: 0.55rem 0.6rem;
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 0.84rem;
  line-height: 1.3;
  text-decoration: none;
}

.lesson-link:hover {
  background: var(--surface-muted);
}

.lesson-link.is-active {
  background: var(--green-soft);
  color: var(--green-dark);
  font-weight: 600;
}

.lesson-number {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}

.lesson-link.is-active .lesson-number {
  color: var(--green);
}

.lesson-name {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.lesson-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: 1.5px solid var(--border-strong);
  background: transparent;
}

.dot-in-progress {
  border-color: var(--yellow);
  background: var(--yellow);
}

.dot-completed {
  border-color: var(--green);
  background: var(--green);
}

.sidebar-footer {
  margin-top: auto;
  padding: 1rem 0.6rem 0;
}

.sidebar-progress-link {
  color: var(--green-dark);
  font-size: 0.84rem;
  font-weight: 600;
  text-decoration: none;
}

.sidebar-progress-link:hover {
  text-decoration: underline;
}

@media (max-width: 900px) {
  .app-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 80;
    width: min(86vw, 320px);
    height: 100vh;
    max-height: none;
    border-right: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
    visibility: hidden;
    transform: translateX(-105%);
    transition:
      transform 0.25s ease,
      visibility 0.25s ease;
  }

  .app-sidebar.is-open {
    visibility: visible;
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-sidebar {
    transition: none;
  }
}
</style>