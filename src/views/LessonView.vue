<script setup lang="ts">
import { computed } from 'vue'

import LessonReader from '@/components/lesson/LessonReader.vue'
import { getLesson } from '@/content/lessonRepository'
import NotFoundView from './NotFoundView.vue'

const props = defineProps<{
  lessonId: string
}>()

const lesson = computed(() => getLesson(props.lessonId))
</script>

<template>
  <LessonReader v-if="lesson" :lesson="lesson" />
  <NotFoundView v-else />
</template>