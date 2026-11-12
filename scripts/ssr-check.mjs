import { createServer } from 'vite'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'

const storage = new Map()

globalThis.window = {
  location: { hash: '#/' },
  localStorage: {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  scrollTo: () => {},
  innerHeight: 900,
  scrollY: 0,
}

globalThis.document = {
  addEventListener: () => {},
  visibilityState: 'visible',
  getElementById: () => null,
}

globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0)
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)

globalThis.IntersectionObserver = class {
  observe() {}
  disconnect() {}
}

const originalWarn = console.warn
const warnings = []
console.warn = (...args) => {
  warnings.push(args.join(' '))
}

const server = await createServer({
  appType: 'custom',
  logLevel: 'silent',
  server: { middlewareMode: true },
})

const failures = []

try {
  const { default: LessonReader } = await server.ssrLoadModule(
    '/src/components/lesson/LessonReader.vue',
  )
  const { getLesson, getLessons } = await server.ssrLoadModule(
    '/src/content/lessonRepository.ts',
  )

  for (const meta of getLessons()) {
    const lesson = getLesson(meta.id)
    if (!lesson) {
      failures.push(`${meta.id}: lesson not found`)
      continue
    }

    const app = createSSRApp({
      render: () => h(LessonReader, { lesson }),
    })
    const html = await renderToString(app)

    const tableCount = lesson.blocks.filter((block) => block.type === 'table').length
    const quoteCount = lesson.blocks.filter((block) => block.type === 'quote').length
    const codeCount = lesson.blocks.filter((block) => block.type === 'code').length
    const listCount = lesson.blocks.filter((block) => block.type === 'list').length

    const renderedTables = (html.match(/md-table-wrap/g) || []).length
    const renderedQuotes = (html.match(/md-quote/g) || []).length
    const renderedCodes = (html.match(/md-code/g) || []).length
    const renderedLists = (html.match(/md-list/g) || []).length

    if (!html.includes('lesson-article')) failures.push(`${meta.id}: no article`)
    if (!html.includes('lesson-toc')) failures.push(`${meta.id}: no toc`)
    if (renderedTables !== tableCount) {
      failures.push(
        `${meta.id}: rendered ${renderedTables} tables, expected ${tableCount}`,
      )
    }
    if (renderedQuotes !== quoteCount) {
      failures.push(
        `${meta.id}: rendered ${renderedQuotes} quotes, expected ${quoteCount}`,
      )
    }
    if (renderedCodes !== codeCount) {
      failures.push(
        `${meta.id}: rendered ${renderedCodes} code blocks, expected ${codeCount}`,
      )
    }
    if (listCount > 0 && renderedLists === 0) {
      failures.push(`${meta.id}: lists not rendered`)
    }

    console.log(
      `${meta.id}: ${html.length} bytes · ${renderedTables} tables · ${renderedLists} lists · ${renderedQuotes} quotes · ${renderedCodes} code`,
    )
  }

  const { default: App } = await server.ssrLoadModule('/src/App.vue')
  const homeHtml = await renderToString(createSSRApp(App))
  if (!homeHtml.includes('home-view')) failures.push('home view not rendered')
  if (!homeHtml.includes('continue-card')) failures.push('continue card not rendered')
  console.log(`home: ${homeHtml.length} bytes`)

  const { default: ProgressView } = await server.ssrLoadModule(
    '/src/views/ProgressView.vue',
  )
  const progressHtml = await renderToString(
    createSSRApp({ render: () => h(ProgressView) }),
  )
  if (!progressHtml.includes('progress-view')) {
    failures.push('progress view not rendered')
  }
  if (!progressHtml.includes('progress-table')) {
    failures.push('progress table not rendered')
  }
  console.log(`progress: ${progressHtml.length} bytes`)

  const { useProgress } = await server.ssrLoadModule(
    '/src/composables/useProgress.ts',
  )
  const { loadProgress } = await server.ssrLoadModule(
    '/src/services/progressStorage.ts',
  )

  const progress = useProgress()
  progress.openLesson('lesson02')
  progress.saveScroll('lesson02', 42)
  progress.saveScroll('lesson02', 10)
  progress.markCompleted('lesson02')

  await new Promise((resolve) => setTimeout(resolve, 400))

  const persisted = JSON.parse(storage.get('nutrilite.progress') ?? 'null')
  if (persisted?.lastLessonId !== 'lesson02') {
    failures.push('progress: lastLessonId was not persisted')
  }
  if (persisted?.lessons?.lesson02?.status !== 'completed') {
    failures.push('progress: completed status was not persisted')
  }
  if (persisted?.lessons?.lesson02?.scrollPercent !== 42) {
    failures.push('progress: scroll position was not persisted')
  }

  storage.set('nutrilite.progress', '{not valid json')
  const fallback = loadProgress()
  if (fallback.version !== 1 || Object.keys(fallback.lessons).length > 0) {
    failures.push('progress: corrupt storage was not normalized')
  }

  progress.reset()
  if (storage.has('nutrilite.progress')) {
    failures.push('progress: reset did not clear storage')
  }

  console.log('progress persistence OK')
} finally {
  console.warn = originalWarn
  await server.close()
}

if (warnings.length) {
  failures.push(`Vue warnings: ${warnings.length}`)
}

if (failures.length) {
  console.error('\nFAILED:')
  for (const failure of failures) console.error(` - ${failure}`)
  process.exit(1)
}

console.log('\nAll lessons render without warnings.')