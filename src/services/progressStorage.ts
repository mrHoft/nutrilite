import type { LessonProgress, LessonStatus, ProgressState } from '@/types/progress'

const STORAGE_KEY = 'nutrilite.progress'
const CURRENT_VERSION = 1

const statuses: LessonStatus[] = ['not-started', 'in-progress', 'completed']

export function createEmptyProgress(): ProgressState {
  return {
    version: CURRENT_VERSION,
    lastLessonId: null,
    lessons: {},
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeLesson(value: unknown): LessonProgress | null {
  if (!isRecord(value)) return null

  const status = value.status
  if (typeof status !== 'string' || !statuses.includes(status as LessonStatus)) {
    return null
  }

  const scrollPercent =
    typeof value.scrollPercent === 'number' && Number.isFinite(value.scrollPercent)
      ? Math.max(0, Math.min(100, value.scrollPercent))
      : 0

  const lastVisitedAt =
    typeof value.lastVisitedAt === 'number' && Number.isFinite(value.lastVisitedAt)
      ? value.lastVisitedAt
      : 0

  const completedAt =
    typeof value.completedAt === 'number' && Number.isFinite(value.completedAt)
      ? value.completedAt
      : undefined

  return {
    status: status as LessonStatus,
    scrollPercent,
    lastVisitedAt,
    completedAt,
  }
}

function normalize(raw: unknown): ProgressState {
  if (!isRecord(raw) || raw.version !== CURRENT_VERSION) {
    return createEmptyProgress()
  }

  const lessons: Record<string, LessonProgress> = {}

  if (isRecord(raw.lessons)) {
    for (const [id, value] of Object.entries(raw.lessons)) {
      const lesson = normalizeLesson(value)
      if (lesson) lessons[id] = lesson
    }
  }

  return {
    version: CURRENT_VERSION,
    lastLessonId:
      typeof raw.lastLessonId === 'string' && raw.lastLessonId in lessons
        ? raw.lastLessonId
        : null,
    lessons,
  }
}

export function loadProgress(): ProgressState {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return createEmptyProgress()
    return normalize(JSON.parse(stored))
  } catch {
    return createEmptyProgress()
  }
}

export function saveProgress(state: ProgressState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage can be unavailable (private mode, quota); progress stays in memory.
  }
}

export function clearProgress(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage errors.
  }
}