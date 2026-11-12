import type { Block } from './markdown'

export interface LessonMeta {
  id: string
  order: number
  title: string
  shortTitle: string
  duration?: string
  format?: string
  heroImage: string
  wordCount: number
  readingMinutes: number
}

export interface Lesson extends LessonMeta {
  blocks: Block[]
}

export interface TocEntry {
  id: string
  text: string
  level: 2 | 3
}