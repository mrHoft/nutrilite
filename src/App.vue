<script setup lang="ts">
import { watch } from 'vue'

import AppShell from '@/components/layout/AppShell.vue'
import { useRoute } from '@/router/router'
import HomeView from '@/views/HomeView.vue'
import LessonView from '@/views/LessonView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import ProgressView from '@/views/ProgressView.vue'

const { route } = useRoute()

watch(
  () => route.value,
  () => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  },
)
</script>

<template>
  <AppShell>
    <HomeView v-if="route.name === 'home'" />
    <LessonView
      v-else-if="route.name === 'lesson'"
      :key="route.id"
      :lesson-id="route.id"
    />
    <ProgressView v-else-if="route.name === 'progress'" />
    <NotFoundView v-else />
  </AppShell>
</template>