<script setup lang="ts">
import type { InlineToken } from '@/types/markdown'

defineOptions({ name: 'MarkdownInline' })

defineProps<{
  tokens: InlineToken[]
}>()
</script>

<template>
  <template v-for="(token, index) in tokens" :key="index">
    <template v-if="token.type === 'text'">{{ token.value }}</template>
    <strong v-else-if="token.type === 'bold'">
      <MarkdownInline :tokens="token.children" />
    </strong>
    <em v-else-if="token.type === 'italic'">
      <MarkdownInline :tokens="token.children" />
    </em>
    <code v-else-if="token.type === 'code'">{{ token.value }}</code>
    <a
      v-else-if="token.type === 'link'"
      :href="token.href"
      target="_blank"
      rel="noopener noreferrer"
    >
      <MarkdownInline :tokens="token.children" />
    </a>
  </template>
</template>