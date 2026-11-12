export type InlineToken =
  | { type: 'text'; value: string }
  | { type: 'bold'; children: InlineToken[] }
  | { type: 'italic'; children: InlineToken[] }
  | { type: 'code'; value: string }
  | { type: 'link'; href: string; children: InlineToken[] }

export interface HeadingBlock {
  type: 'heading'
  level: 1 | 2 | 3 | 4 | 5 | 6
  id: string
  text: string
}

export interface ParagraphBlock {
  type: 'paragraph'
  tokens: InlineToken[]
}

export interface ListItem {
  tokens: InlineToken[]
  checked?: boolean
  children: Block[]
}

export interface ListBlock {
  type: 'list'
  ordered: boolean
  items: ListItem[]
}

export interface TableBlock {
  type: 'table'
  header: InlineToken[][]
  rows: InlineToken[][][]
}

export interface QuoteBlock {
  type: 'quote'
  blocks: Block[]
}

export interface CodeBlock {
  type: 'code'
  lang: string
  value: string
}

export interface DividerBlock {
  type: 'divider'
}

export type Block =
  | HeadingBlock
  | ParagraphBlock
  | ListBlock
  | TableBlock
  | QuoteBlock
  | CodeBlock
  | DividerBlock