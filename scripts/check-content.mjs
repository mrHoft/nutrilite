import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'

import { createServer } from 'vite'

const server = await createServer({
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
})

const failures = []

try {
  const { parseBlocks } = await server.ssrLoadModule(
    '/src/content/markdown/parseBlocks.ts',
  )
  const { extractMeta } = await server.ssrLoadModule(
    '/src/content/markdown/extractMeta.ts',
  )
  const { lessonMetas } = await server.ssrLoadModule('/src/content/catalog.ts')

  const dir = path.resolve('public/lessons')
  const files = (await readdir(dir)).filter((file) => file.endsWith('.md')).sort()

  if (lessonMetas.length !== files.length) {
    failures.push(
      `catalog: expected ${files.length} lessons, got ${lessonMetas.length}`,
    )
  }

  for (const [index, lesson] of lessonMetas.entries()) {
    if (lesson.order !== index + 1) {
      failures.push(`catalog: unexpected order ${lesson.order} for ${lesson.id}`)
    }
  }

  for (const file of files) {
    const raw = await readFile(path.join(dir, file), 'utf8')
    const id = file.replace(/\.md$/, '')
    const blocks = parseBlocks(raw)
    const meta = extractMeta(id, raw)

    try {
      await access(path.join('public', meta.heroImage.replace(/^\//, '')))
    } catch {
      failures.push(`${file}: missing hero image ${meta.heroImage}`)
    }

    const headings = blocks.filter((block) => block.type === 'heading')
    const tables = blocks.filter((block) => block.type === 'table')
    const lists = blocks.filter((block) => block.type === 'list')
    const codes = blocks.filter((block) => block.type === 'code')
    const quotes = blocks.filter((block) => block.type === 'quote')

    function nestedItems(blocksToScan) {
      const items = []
      for (const block of blocksToScan) {
        if (block.type === 'list') {
          for (const item of block.items) {
            items.push(item)
            items.push(...nestedItems(item.children))
          }
        } else if (block.type === 'quote') {
          items.push(...nestedItems(block.blocks))
        }
      }
      return items
    }

    const nested = nestedItems(blocks).filter((item) => item.children.length > 0)
    if (['lesson04.md', 'lesson11.md'].includes(file) && nested.length === 0) {
      failures.push(`${file}: expected nested list items`)
    }
    if (file === 'lesson09.md' && quotes.length === 0) {
      failures.push(`${file}: expected a blockquote`)
    }

    const ids = headings.map((heading) => heading.id)
    if (new Set(ids).size !== ids.length) {
      failures.push(`${file}: duplicate heading ids`)
    }

    for (const table of tables) {
      if (table.header.length === 0) {
        failures.push(`${file}: table without header`)
      }
      for (const row of table.rows) {
        if (row.length !== table.header.length) {
          failures.push(
            `${file}: table row has ${row.length} cells, expected ${table.header.length}`,
          )
        }
      }
    }

    if (!meta.title) failures.push(`${file}: missing title`)
    if (blocks.length < 5) failures.push(`${file}: parsed only ${blocks.length} blocks`)

    console.log(
      `${file}: ${blocks.length} blocks · ${headings.length} headings · ${tables.length} tables · ${lists.length} lists · ${codes.length} code · ${meta.readingMinutes} min`,
    )
  }
} finally {
  await server.close()
}

if (failures.length) {
  console.error('\nFAILED:')
  for (const failure of failures) console.error(` - ${failure}`)
  process.exit(1)
}

console.log('\nAll lesson content parsed successfully.')