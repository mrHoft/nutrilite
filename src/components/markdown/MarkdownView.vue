<script setup lang="ts">
import MarkdownInline from './MarkdownInline.vue'
import MarkdownTable from './MarkdownTable.vue'
import type { Block } from '@/types/markdown'

defineOptions({ name: 'MarkdownView' })

defineProps<{
  blocks: Block[]
}>()
</script>

<template>
  <div class="markdown">
    <template v-for="(block, index) in blocks" :key="index">
      <component
        :is="`h${block.level}`"
        v-if="block.type === 'heading'"
        :id="block.id"
        class="md-heading"
      >
        {{ block.text }}
      </component>

      <p v-else-if="block.type === 'paragraph'">
        <MarkdownInline :tokens="block.tokens" />
      </p>

      <component
        :is="block.ordered ? 'ol' : 'ul'"
        v-else-if="block.type === 'list'"
        class="md-list"
      >
        <li
          v-for="(item, itemIndex) in block.items"
          :key="itemIndex"
          :class="{ 'md-list-item-task': item.checked !== undefined }"
        >
          <input
            v-if="item.checked !== undefined"
            class="md-checkbox"
            type="checkbox"
            :checked="item.checked"
            disabled
          />
          <MarkdownInline :tokens="item.tokens" />
          <MarkdownView v-if="item.children.length" :blocks="item.children" />
        </li>
      </component>

      <MarkdownTable
        v-else-if="block.type === 'table'"
        :header="block.header"
        :rows="block.rows"
      />

      <blockquote v-else-if="block.type === 'quote'" class="md-quote">
        <MarkdownView :blocks="block.blocks" />
      </blockquote>

      <pre v-else-if="block.type === 'code'" class="md-code"><code>{{ block.value }}</code></pre>

      <hr v-else-if="block.type === 'divider'" class="md-divider" />
    </template>
  </div>
</template>