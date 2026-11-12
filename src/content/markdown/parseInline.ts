import type { InlineToken } from '@/types/markdown'

const codePattern = /^`([^`]+)`/
const linkPattern = /^\[([^\]]+)\]\(([^)]+)\)/
const boldPattern = /^\*\*([^*]+)\*\*/
const italicPattern = /^\*([^*]+)\*/

export function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = []
  let buffer = ''
  let index = 0

  const flush = () => {
    if (buffer) {
      tokens.push({ type: 'text', value: buffer })
      buffer = ''
    }
  }

  while (index < text.length) {
    const rest = text.slice(index)

    const code = codePattern.exec(rest)
    if (code) {
      flush()
      tokens.push({ type: 'code', value: code[1] })
      index += code[0].length
      continue
    }

    const link = linkPattern.exec(rest)
    if (link) {
      flush()
      tokens.push({
        type: 'link',
        href: link[2],
        children: parseInline(link[1]),
      })
      index += link[0].length
      continue
    }

    const bold = boldPattern.exec(rest)
    if (bold) {
      flush()
      tokens.push({ type: 'bold', children: parseInline(bold[1]) })
      index += bold[0].length
      continue
    }

    const italic = italicPattern.exec(rest)
    if (italic) {
      flush()
      tokens.push({ type: 'italic', children: parseInline(italic[1]) })
      index += italic[0].length
      continue
    }

    buffer += text[index]
    index += 1
  }

  flush()
  return tokens
}