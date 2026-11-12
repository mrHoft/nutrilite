export type LessonStatus = 'not-started' | 'in-progress' | 'completed'

export interface LessonProgress {
  status: LessonStatus
  scrollPercent: number
  lastVisitedAt: number
  completedAt?: number
}

export interface ProgressState {
  version: 1
  lastLessonId: string | null
  lessons: Record<string, LessonProgress>
}