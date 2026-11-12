import type { Lesson, LessonMeta } from '@/types/lesson'
import { getLessonRaw, lessonMetas } from './catalog'
import { parseBlocks } from './markdown/parseBlocks'

const cache = new Map<string, Lesson>()

export function getLessons(): LessonMeta[] {
  return lessonMetas
}

export function getLessonMeta(id: string): LessonMeta | undefined {
  return lessonMetas.find((lesson) => lesson.id === id)
}

export function getLesson(id: string): Lesson | undefined {
  const cached = cache.get(id)
  if (cached) return cached

  const raw = getLessonRaw(id)
  const meta = getLessonMeta(id)
  if (!raw || !meta) return undefined

  const blocks = parseBlocks(raw).filter(
    (block, index) => !(index === 0 && block.type === 'heading' && block.level === 1),
  )

  const lesson: Lesson = { ...meta, blocks }
  cache.set(id, lesson)
  return lesson
}

export function getNeighbors(id: string): {
  previous?: LessonMeta
  next?: LessonMeta
} {
  const index = lessonMetas.findIndex((lesson) => lesson.id === id)
  if (index === -1) return {}

  return {
    previous: index > 0 ? lessonMetas[index - 1] : undefined,
    next: index < lessonMetas.length - 1 ? lessonMetas[index + 1] : undefined,
  }
}