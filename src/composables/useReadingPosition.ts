import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

import { useProgress } from './useProgress'

export function useReadingPosition(
  articleRef: Ref<HTMLElement | null>,
  lessonId: string,
  initialPercent: number,
) {
  const percent = ref(initialPercent)
  const { saveScroll } = useProgress()

  let frame = 0
  let lastSaved = 0

  function measure(): number {
    const element = articleRef.value
    if (!element) return percent.value

    const start = element.getBoundingClientRect().top + window.scrollY
    const height = Math.max(1, element.offsetHeight)
    const read = window.scrollY + window.innerHeight - start
    const value = (read / height) * 100

    return Math.max(0, Math.min(100, value))
  }

  function scrollToPercent(value: number) {
    const element = articleRef.value
    if (!element) return

    const start = element.getBoundingClientRect().top + window.scrollY
    const height = Math.max(1, element.offsetHeight)
    const top = start + (height * value) / 100 - window.innerHeight
    window.scrollTo({
      top: Math.max(0, top),
      behavior: 'auto',
    })
  }

  function onScroll() {
    if (frame) return

    frame = requestAnimationFrame(() => {
      frame = 0
      const value = measure()
      percent.value = Math.max(percent.value, value)

      const now = Date.now()
      if (now - lastSaved > 600) {
        lastSaved = now
        saveScroll(lessonId, percent.value)
      }
    })
  }

  onMounted(() => {
requestAnimationFrame(() => {
      if (initialPercent > 0) scrollToPercent(initialPercent)
      const value = Math.max(percent.value, measure())
      percent.value = value
      saveScroll(lessonId, value)
    })

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
    if (frame) cancelAnimationFrame(frame)
    saveScroll(lessonId, Math.max(percent.value, measure()))
  })

  return { percent, scrollToPercent, measure }
}