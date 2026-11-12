<script setup lang="ts">
import ContinueCard from '@/components/progress/ContinueCard.vue'
import LessonStatusBadge from '@/components/progress/LessonStatusBadge.vue'
import ProgressBar from '@/components/progress/ProgressBar.vue'
import { useProgress } from '@/composables/useProgress'
import { getLessons } from '@/content/lessonRepository'

const lessons = getLessons()
const { statusOf, completedCount, overallPercent } = useProgress()
</script>

<template>
  <div class="home-view">
    <section class="hero">
      <div class="hero-copy">
        <p class="hero-kicker">Онлайн-курс · {{ lessons.length }} модулей</p>
        <h1>Основы здорового питания</h1>
        <p class="hero-lead">
          Практический курс о том, как питаться сбалансированно, читать этикетки,
          готовить дома и формировать устойчивые привычки.
        </p>

        <div class="hero-stats">
          <div>
            <strong>{{ lessons.length }}</strong>
            <span>модулей</span>
          </div>
          <div>
            <strong>{{ completedCount }}</strong>
            <span>пройдено</span>
          </div>
          <div>
            <strong>{{ overallPercent }}%</strong>
            <span>курса</span>
          </div>
        </div>

        <div class="hero-progress">
          <ProgressBar :value="overallPercent" label="Общий прогресс курса" />
          <span>{{ completedCount }} из {{ lessons.length }}</span>
        </div>
      </div>

      <div class="hero-mark" aria-hidden="true">
        <img src="/logo/logo_128.png" alt="" />
      </div>
    </section>

    <ContinueCard />

    <section class="lesson-section">
      <div class="section-head">
        <h2>Программа курса</h2>
        <a href="#/progress">Мой прогресс</a>
      </div>

      <div class="lesson-grid">
        <a
          v-for="lesson in lessons"
          :key="lesson.id"
          class="lesson-card"
          :href="`#/lesson/${lesson.id}`"
        >
          <div class="lesson-card-top">
            <span class="lesson-card-number">
              {{ String(lesson.order).padStart(2, '0') }}
            </span>
            <LessonStatusBadge :status="statusOf(lesson.id)" />
          </div>
          <h3>{{ lesson.shortTitle }}</h3>
          <p class="lesson-card-format">{{ lesson.format }}</p>
          <span class="lesson-card-time">{{ lesson.readingMinutes }} мин</span>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 3vw, 2.5rem);
  max-width: 1080px;
  margin: 0 auto;
}

.hero {
  display: flex;
  gap: 2rem;
  align-items: center;
  justify-content: space-between;
  padding: clamp(1.5rem, 4vw, 2.75rem);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background:
    radial-gradient(circle at 85% 15%, var(--lime-soft), transparent 45%),
    radial-gradient(circle at 10% 90%, var(--green-soft), transparent 55%),
    var(--surface);
  box-shadow: var(--shadow);
}

.hero-copy {
  flex: 1;
  min-width: 0;
}

.hero-kicker {
  margin: 0 0 0.6rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--green);
}

.hero h1 {
  margin: 0 0 0.75rem;
  font-family: var(--font-heading);
  font-size: clamp(2rem, 5vw, 3.1rem);
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: var(--ink);
}

.hero-lead {
  max-width: 42rem;
  margin: 0 0 1.5rem;
  font-size: clamp(0.95rem, 1.6vw, 1.05rem);
  line-height: 1.55;
  color: var(--muted);
}

.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.35rem;
}

.hero-stats div {
  display: flex;
  flex-direction: column;
}

.hero-stats strong {
  font-size: 1.45rem;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
}

.hero-stats span {
  font-size: 0.75rem;
  color: var(--muted);
}

.hero-progress {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  max-width: 23rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted);
  white-space: nowrap;
}

.hero-mark {
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  width: clamp(7rem, 18vw, 11rem);
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--surface);
  box-shadow: var(--shadow-lg);
}

.hero-mark img {
  width: 62%;
  height: auto;
  border-radius: 20%;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.section-head h2 {
  margin: 0;
  font-family: var(--font-heading);
  font-size: 1.35rem;
  color: var(--ink);
}

.section-head a {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--green-dark);
  text-decoration: none;
}

.section-head a:hover {
  text-decoration: underline;
}

.lesson-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.9rem;
}

.lesson-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.1rem 1.15rem 1.2rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  text-decoration: none;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.lesson-card:hover {
  transform: translateY(-2px);
  border-color: var(--green);
  box-shadow: var(--shadow);
}

.lesson-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.lesson-card-number {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--green);
  font-variant-numeric: tabular-nums;
}

.lesson-card h3 {
  margin: 0;
  font-size: 0.98rem;
  line-height: 1.3;
  color: var(--ink);
}

.lesson-card-format {
  flex: 1;
  margin: 0;
  font-size: 0.78rem;
  line-height: 1.4;
  color: var(--muted);
}

.lesson-card-time {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--green-dark);
}

@media (max-width: 760px) {
  .hero-mark {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lesson-card {
    transition: none;
  }

  .lesson-card:hover {
    transform: none;
  }
}
</style>
