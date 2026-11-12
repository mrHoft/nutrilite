<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

import ProgressBar from '@/components/progress/ProgressBar.vue'
import MarkdownView from '@/components/markdown/MarkdownView.vue'
import { getNeighbors } from '@/content/lessonRepository'
import { useProgress } from '@/composables/useProgress'
import { useReadingPosition } from '@/composables/useReadingPosition'
import type { Lesson, TocEntry } from '@/types/lesson'
import LessonNav from './LessonNav.vue'
import LessonToc from './LessonToc.vue'

const props = defineProps<{
  lesson: Lesson
}>()

const articleRef = ref<HTMLElement | null>(null)
const activeHeadingId = ref('')
const { getLessonProgress, openLesson } = useProgress()

const initialPercent = getLessonProgress(props.lesson.id)?.scrollPercent ?? 0
const { percent } = useReadingPosition(articleRef, props.lesson.id, initialPercent)
const neighbors = computed(() => getNeighbors(props.lesson.id))

const headings = computed<TocEntry[]>(() => {
  const entries: TocEntry[] = []
  for (const block of props.lesson.blocks) {
    if (block.type === 'heading' && (block.level === 2 || block.level === 3)) {
      entries.push({
        id: block.id,
        text: block.text.replace(/\*\*|`/g, ''),
        level: block.level,
      })
    }
  }
  return entries
})

let observer: IntersectionObserver | undefined

onMounted(async () => {
  openLesson(props.lesson.id)
  await nextTick()

  const article = articleRef.value
  if (!article) return

  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      const [first] = visible
      if (first) activeHeadingId.value = first.target.id
    },
    { rootMargin: '-90px 0px -65% 0px', threshold: 0 },
  )

  article
    .querySelectorAll<HTMLElement>('h2[id], h3[id]')
    .forEach((element) => observer?.observe(element))

  const firstHeading = article.querySelector<HTMLElement>('h2[id], h3[id]')
  if (firstHeading) activeHeadingId.value = firstHeading.id
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

function scrollToHeading(id: string) {
  const element = document.getElementById(id)
  if (!element) return

  const top = element.getBoundingClientRect().top + window.scrollY - 88
  const behavior: ScrollBehavior = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
    ? 'auto'
    : 'smooth'
  window.scrollTo({ top, behavior })
  activeHeadingId.value = id
}
</script>

<template>
  <div class="lesson-layout">
    <article ref="articleRef" class="lesson-article">
      <header class="lesson-header">
        <p class="lesson-eyebrow">Модуль {{ lesson.order }}</p>
        <h1>{{ lesson.title }}</h1>

        <div class="lesson-meta">
          <span v-if="lesson.duration">{{ lesson.duration }}</span>
          <span v-if="lesson.format">{{ lesson.format }}</span>
          <span>{{ lesson.readingMinutes }} мин чтения</span>
        </div>

        <div class="lesson-reading">
          <div class="lesson-reading-row">
            <span>Прогресс чтения</span>
            <span>{{ Math.round(percent) }}%</span>
          </div>
          <ProgressBar :value="percent" label="Прогресс чтения модуля" />
        </div>
      </header>

      <MarkdownView :blocks="lesson.blocks" />

      <footer class="lesson-footer">
        <LessonNav
          :current-id="lesson.id"
          :previous="neighbors.previous"
          :next="neighbors.next"
        />
      </footer>
    </article>

    <aside class="lesson-aside">
      <LessonToc
        :entries="headings"
        :active-id="activeHeadingId"
        @navigate="scrollToHeading"
      />
    </aside>
  </div>
</template>

<style scoped>
.lesson-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: clamp(1.5rem, 3vw, 2.75rem);
  align-items: start;
  max-width: 1080px;
  margin: 0 auto;
}

.lesson-article {
  min-width: 0;
}

.lesson-header {
  padding-bottom: 1.5rem;
  margin-bottom: 1.75rem;
  border-bottom: 1px solid var(--border);
}

.lesson-eyebrow {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--green);
}

.lesson-header h1 {
  margin: 0 0 0.85rem;
  font-family: var(--font-heading);
  font-size: clamp(1.6rem, 3.4vw, 2.3rem);
  line-height: 1.18;
  letter-spacing: -0.02em;
  color: var(--ink);
}

.lesson-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1rem;
  margin-bottom: 1.25rem;
  font-size: 0.84rem;
  color: var(--muted);
}

.lesson-reading {
  max-width: 22rem;
  margin-bottom: 1.25rem;
}

.lesson-reading-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted);
}

.lesson-footer {
  margin-top: 2.5rem;
}

.lesson-aside {
  min-width: 0;
}

@media (max-width: 1100px) {
  .lesson-layout {
    grid-template-columns: minmax(0, 1fr);
    max-width: 780px;
  }

  .lesson-aside {
    display: none;
  }
}
</style>