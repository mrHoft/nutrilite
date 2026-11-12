import type { LessonMeta } from '@/types/lesson'

function extractField(lines: string[], label: string): string | undefined {
  const pattern = new RegExp(`^\\*\\*${label}:\\*\\*\\s*(.+)$`)
  for (const line of lines) {
    const match = pattern.exec(line)
    if (match) return match[1].trim()
  }
  return undefined
}

export function extractMeta(id: string, raw: string): LessonMeta {
  const lines = raw.replace(/\r\n?/g, '\n').split('\n')
  const titleLine = lines.find((line) => /^#\s+/.test(line))
  const title = titleLine ? titleLine.replace(/^#\s+/, '').trim() : id

  const orderMatch = /(\d+)/.exec(id)
  const order = orderMatch ? Number(orderMatch[1]) : 0

  const shortTitle =
    title.replace(/^Модуль\s+\d+\.\s*/, '').trim() || title

  const wordCount = raw
    .replace(/```[\s\S]*?```/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length

  return {
    id,
    order,
    title,
    shortTitle,
    duration: extractField(lines, 'Длительность'),
    format: extractField(lines, 'Формат'),
    wordCount,
    readingMinutes: Math.max(1, Math.round(wordCount / 180)),
  }
}