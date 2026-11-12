import { computed, reactive } from 'vue'

import { getLessons } from '@/content/lessonRepository'
import {
  clearProgress,
  createEmptyProgress,
  loadProgress,
  saveProgress,
} from '@/services/progressStorage'
import type { LessonProgress, LessonStatus, ProgressState } from '@/types/progress'

const state = reactive<ProgressState>(loadProgress())
let saveTimer: ReturnType<typeof setTimeout> | undefined

function flushSave() {
  if (saveTimer) {
    clearTimeout(saveTimer)
    saveTimer = undefined
  }
  saveProgress(state)
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    saveTimer = undefined
    saveProgress(state)
  }, 300)
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushSave)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushSave()
  })
}

function ensureLesson(id: string): LessonProgress {
  const existing = state.lessons[id]
  if (existing) return existing

  const created: LessonProgress = {
    status: 'not-started',
    scrollPercent: 0,
    lastVisitedAt: 0,
  }
  state.lessons[id] = created
  return created
}

const knownLessonIds = new Set(getLessons().map((lesson) => lesson.id))
const totalCount = computed(() => getLessons().length)

const completedCount = computed(
  () =>
    Object.entries(state.lessons).filter(
      ([id, lesson]) => knownLessonIds.has(id) && lesson.status === 'completed',
    ).length,
)

const inProgressCount = computed(
  () =>
    Object.entries(state.lessons).filter(
      ([id, lesson]) => knownLessonIds.has(id) && lesson.status === 'in-progress',
    ).length,
)

const overallPercent = computed(() =>
  totalCount.value ? Math.round((completedCount.value / totalCount.value) * 100) : 0,
)

export function useProgress() {
  function getLessonProgress(id: string): LessonProgress | undefined {
    return state.lessons[id]
  }

  function statusOf(id: string): LessonStatus {
    return state.lessons[id]?.status ?? 'not-started'
  }

  function openLesson(id: string) {
    const lesson = ensureLesson(id)
    if (lesson.status === 'not-started') {
      lesson.status = 'in-progress'
    }
    lesson.lastVisitedAt = Date.now()
    state.lastLessonId = id
    scheduleSave()
  }

  function saveScroll(id: string, percent: number) {
    const lesson = ensureLesson(id)
    if (lesson.status === 'not-started') {
      lesson.status = 'in-progress'
    }
    const nextPercent = Math.max(0, Math.min(100, Math.round(percent)))
    lesson.scrollPercent = Math.max(lesson.scrollPercent, nextPercent)
    lesson.lastVisitedAt = Date.now()
    scheduleSave()
  }

  function markCompleted(id: string) {
    const lesson = ensureLesson(id)
    lesson.status = 'completed'
    lesson.completedAt = Date.now()
    lesson.lastVisitedAt = Date.now()
    scheduleSave()
  }

  function reset() {
    if (saveTimer) {
      clearTimeout(saveTimer)
      saveTimer = undefined
    }
    const empty = createEmptyProgress()
    state.version = empty.version
    state.lastLessonId = empty.lastLessonId
    state.lessons = empty.lessons
    clearProgress()
  }

  return {
    progress: state,
    getLessonProgress,
    statusOf,
    openLesson,
    saveScroll,
    markCompleted,
    reset,
    totalCount,
    completedCount,
    inProgressCount,
    overallPercent,
  }
}