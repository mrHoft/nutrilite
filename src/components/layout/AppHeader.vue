<script setup lang="ts">
import ProgressBar from '@/components/progress/ProgressBar.vue'
import { useProgress } from '@/composables/useProgress'

defineEmits<{ toggleMenu: [] }>()

const { overallPercent, completedCount, totalCount } = useProgress()
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <button
        type="button"
        class="menu-button"
        aria-label="Открыть меню модулей"
        @click="$emit('toggleMenu')"
      >
        <span />
        <span />
        <span />
      </button>

      <a class="brand" href="/" aria-label="Nutrilite — на главную">
        <img src="/logo/logo_128.png" alt="" width="36" height="36" />
        <span class="brand-text">
          <strong>Nutrilite</strong>
          <small>Основы здорового питания</small>
        </span>
      </a>

      <nav class="header-nav" aria-label="Основная навигация">
        <a href="/">Курс</a>
        <a href="/progress">Прогресс</a>
      </nav>

      <div class="header-progress">
        <span class="header-progress-label">
          {{ completedCount }} / {{ totalCount }}
        </span>
        <ProgressBar
          :value="overallPercent"
          compact
          label="Общий прогресс курса"
        />
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 60;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.header-inner {
  display: flex;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: var(--content-max);
  margin: 0 auto;
  padding: 0.65rem clamp(1rem, 3vw, 2rem);
}

.menu-button {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  width: 40px;
  height: 40px;
  padding: 0 9px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  cursor: pointer;
}

.menu-button span {
  display: block;
  height: 2px;
  border-radius: 2px;
  background: var(--ink);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: var(--ink);
  text-decoration: none;
}

.brand img {
  border-radius: 10px;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.15;
}

.brand-text strong {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  letter-spacing: -0.01em;
}

.brand-text small {
  font-size: 0.7rem;
  color: var(--muted);
}

.header-nav {
  display: flex;
  gap: 0.35rem;
  margin-left: auto;
}

.header-nav a {
  padding: 0.45rem 0.75rem;
  border-radius: var(--radius-sm);
  color: var(--muted);
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
}

.header-nav a:hover {
  color: var(--green-dark);
  background: var(--green-soft);
}

.header-progress {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  width: 170px;
}

.header-progress-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--muted);
  white-space: nowrap;
}

@media (max-width: 900px) {
  .menu-button {
    display: flex;
  }

  .header-nav {
    display: none;
  }

  .header-progress {
    width: 110px;
  }
}

@media (max-width: 560px) {
  .brand-text small {
    display: none;
  }

  .header-progress {
    display: none;
  }
}
</style>
