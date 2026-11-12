import type { LessonMeta } from '@/types/lesson'
import { extractMeta } from './markdown/extractMeta'

const modules = import.meta.glob('../../public/lessons/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const rawById = new Map<string, string>()

const metaById = new Map<string, LessonMeta>()

for (const [path, raw] of Object.entries(modules)) {
  const file = path.split('/').pop() ?? path
  const id = file.replace(/\.md$/, '')
  rawById.set(id, raw)
  metaById.set(id, extractMeta(id, raw))
}

export const lessonMetas: LessonMeta[] = [...metaById.values()].sort(
  (a, b) => a.order - b.order,
)

export function getLessonRaw(id: string): string | undefined {
  return rawById.get(id)
}