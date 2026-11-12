<script setup lang="ts">
import type { TocEntry } from '@/types/lesson'

defineProps<{
  entries: TocEntry[]
  activeId?: string
}>()

const emit = defineEmits<{ navigate: [id: string] }>()
</script>

<template>
  <nav v-if="entries.length" class="lesson-toc" aria-label="Содержание модуля">
    <p class="toc-title">Содержание</p>
    <ul>
      <li
        v-for="entry in entries"
        :key="entry.id"
        :class="{ 'toc-level-3': entry.level === 3 }"
      >
        <button
          type="button"
          :class="{ 'is-active': entry.id === activeId }"
          @click="emit('navigate', entry.id)"
        >
          {{ entry.text }}
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.lesson-toc {
  position: sticky;
  top: calc(var(--header-height) + 1.25rem);
  max-height: calc(100vh - var(--header-height) - 2.5rem);
  overflow-y: auto;
  padding-left: 1rem;
  border-left: 1px solid var(--border);
}

.toc-title {
  margin: 0 0 0.65rem;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}

.lesson-toc ul {
  display: flex;
  flex-direction: column;
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.lesson-toc button {
  width: 100%;
  padding: 0.32rem 0.5rem;
  border: 0;
  border-radius: 6px;
  color: var(--muted);
  background: transparent;
  font: inherit;
  font-size: 0.78rem;
  line-height: 1.3;
  text-align: left;
  cursor: pointer;
}

.lesson-toc button:hover {
  color: var(--green-dark);
  background: var(--surface-muted);
}

.lesson-toc button.is-active {
  color: var(--green-dark);
  background: var(--green-soft);
  font-weight: 600;
}

.toc-level-3 button {
  padding-left: 1.1rem;
  font-size: 0.74rem;
}
</style>