import type { Block, ListBlock, TableBlock } from '@/types/markdown'
import { parseInline } from './parseInline'

const headingPattern = /^(#{1,6})\s+(.*)$/
const fencePattern = /^```(.*)$/
const quotePattern = /^>\s?(.*)$/
const dividerPattern = /^(?:---+|\*\*\*+|___+)\s*$/
const listPattern = /^(\s*)([-*+]|\d+\.)\s+(.*)$/
const tableCellPattern = /^:?-{3,}:?$/

interface RawListItem {
  indent: number
  ordered: boolean
  text: string
  checked?: boolean
}

function splitTableRow(line: string): string[] {
  let value = line.trim()
  if (value.startsWith('|')) value = value.slice(1)
  if (value.endsWith('|')) value = value.slice(0, -1)
  return value.split('|').map((cell) => cell.trim())
}

function isTableStart(lines: string[], index: number): boolean {
  const line = lines[index]
  const next = lines[index + 1]
  if (!line || !next || !line.includes('|')) return false
  const cells = splitTableRow(next)
  return cells.length > 0 && cells.every((cell) => tableCellPattern.test(cell))
}

function isBlockStart(lines: string[], index: number): boolean {
  const line = lines[index]
  if (!line || !line.trim()) return true
  return (
    fencePattern.test(line) ||
    headingPattern.test(line) ||
    dividerPattern.test(line) ||
    quotePattern.test(line) ||
    listPattern.test(line) ||
    isTableStart(lines, index)
  )
}

function slugify(text: string, usedIds: Set<string>): string {
  const base =
    text
      .toLowerCase()
      .replace(/\*\*|`/g, '')
      .normalize('NFKD')
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '') || 'section'

  let id = base
  let suffix = 2
  while (usedIds.has(id)) {
    id = `${base}-${suffix}`
    suffix += 1
  }
  usedIds.add(id)
  return id
}

function collectList(lines: string[], start: number): { items: RawListItem[]; next: number } {
  const items: RawListItem[] = []
  let index = start

  while (index < lines.length) {
    const line = lines[index]
    if (!line.trim()) break

    const match = listPattern.exec(line)
    if (!match) break

    const indent = match[1].replace(/\t/g, '  ').length
    const ordered = /\d+\./.test(match[2])
    let text = match[3].trim()
    let checked: boolean | undefined

    const task = /^\[([ xX])\]\s+(.*)$/.exec(text)
    if (task) {
      checked = task[1].toLowerCase() === 'x'
      text = task[2]
    }

    items.push({ indent, ordered, text, checked })
    index += 1
  }

  return { items, next: index }
}

function buildList(items: RawListItem[]): ListBlock {
  const root: ListBlock = { type: 'list', ordered: items[0].ordered, items: [] }
  const stack: { indent: number; block: ListBlock }[] = [
    { indent: items[0].indent, block: root },
  ]

  for (const item of items) {
    while (stack.length > 1 && item.indent < stack[stack.length - 1].indent) {
      stack.pop()
    }

    let current = stack[stack.length - 1]

    if (item.indent > current.indent) {
      const parent = current.block.items[current.block.items.length - 1]
      const nested: ListBlock = { type: 'list', ordered: item.ordered, items: [] }

      if (parent) {
        parent.children.push(nested)
        current = { indent: item.indent, block: nested }
        stack.push(current)
      }
    }

    current.block.items.push({
      tokens: parseInline(item.text),
      checked: item.checked,
      children: [],
    })
  }

  return root
}

function parseTable(lines: string[], start: number): { block: TableBlock; next: number } {
  const header = splitTableRow(lines[start]).map(parseInline)
  const rows: TableBlock['rows'] = []
  let index = start + 2

  while (index < lines.length && lines[index].trim() && lines[index].includes('|')) {
    rows.push(splitTableRow(lines[index]).map(parseInline))
    index += 1
  }

  return { block: { type: 'table', header, rows }, next: index }
}

export function parseBlocks(markdown: string, usedIds = new Set<string>()): Block[] {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n')
  const blocks: Block[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]

    if (!line.trim()) {
      index += 1
      continue
    }

    const fence = fencePattern.exec(line)
    if (fence) {
      const lang = fence[1].trim()
      const codeLines: string[] = []
      let cursor = index + 1

      while (cursor < lines.length && !fencePattern.test(lines[cursor])) {
        codeLines.push(lines[cursor])
        cursor += 1
      }

      blocks.push({ type: 'code', lang, value: codeLines.join('\n') })
      index = cursor < lines.length ? cursor + 1 : cursor
      continue
    }

    const heading = headingPattern.exec(line)
    if (heading) {
      const rawText = heading[2].trim()
      const text = rawText.replace(/\*\*|`/g, '')
      blocks.push({
        type: 'heading',
        level: heading[1].length as 1 | 2 | 3 | 4 | 5 | 6,
        id: slugify(text, usedIds),
        text: rawText,
      })
      index += 1
      continue
    }

    if (dividerPattern.test(line)) {
      blocks.push({ type: 'divider' })
      index += 1
      continue
    }

    if (isTableStart(lines, index)) {
      const { block, next } = parseTable(lines, index)
      blocks.push(block)
      index = next
      continue
    }

    if (quotePattern.test(line)) {
      const quoteLines: string[] = []
      let cursor = index

      while (cursor < lines.length) {
        const match = quotePattern.exec(lines[cursor])
        if (!match) break
        quoteLines.push(match[1])
        cursor += 1
      }

      blocks.push({
        type: 'quote',
        blocks: parseBlocks(quoteLines.join('\n'), usedIds),
      })
      index = cursor
      continue
    }

    if (listPattern.test(line)) {
      const { items, next } = collectList(lines, index)
      blocks.push(buildList(items))
      index = next
      continue
    }

    const paragraphLines: string[] = [line.trim()]
    let cursor = index + 1

    while (cursor < lines.length && !isBlockStart(lines, cursor)) {
      paragraphLines.push(lines[cursor].trim())
      cursor += 1
    }

    blocks.push({
      type: 'paragraph',
      tokens: parseInline(paragraphLines.join(' ')),
    })
    index = cursor
  }

  return blocks
}