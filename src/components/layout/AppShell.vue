<script setup lang="ts">
import { ref, watch } from 'vue'

import { useRoute } from '@/router/router'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

const sidebarOpen = ref(false)
const { route } = useRoute()

watch(
  () => route.value,
  () => {
    sidebarOpen.value = false
  },
)

function toggleMenu() {
  sidebarOpen.value = !sidebarOpen.value
}

function closeSidebar() {
  sidebarOpen.value = false
}

function skipToContent(event: MouseEvent) {
  event.preventDefault()
  const main = document.getElementById('main')
  main?.focus()
  main?.scrollIntoView()
}
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main" @click="skipToContent">
      Перейти к содержанию
    </a>
    <AppHeader @toggle-menu="toggleMenu" />

    <div class="app-body">
      <AppSidebar :open="sidebarOpen" @close="closeSidebar" />
      <div
        v-if="sidebarOpen"
        class="sidebar-backdrop"
        aria-hidden="true"
        @click="closeSidebar"
      />
      <main id="main" class="app-main" tabindex="-1">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.app-body {
  display: flex;
  width: 100%;
  max-width: var(--content-max);
  margin: 0 auto;
  align-items: flex-start;
}

.app-main {
  flex: 1;
  min-width: 0;
  padding: clamp(1.25rem, 3vw, 2.5rem);
}

.app-main:focus {
  outline: none;
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 70;
  background: rgba(15, 30, 20, 0.45);
}

@media (max-width: 900px) {
  .app-main {
    padding: 1.25rem 1rem 2rem;
  }
}
</style>