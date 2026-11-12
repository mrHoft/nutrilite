<script setup lang="ts">
import type { InlineToken } from '@/types/markdown'
import MarkdownInline from './MarkdownInline.vue'

defineOptions({ name: 'MarkdownTable' })

defineProps<{
  header: InlineToken[][]
  rows: InlineToken[][][]
}>()
</script>

<template>
  <div class="md-table-wrap">
    <table class="md-table">
      <thead>
        <tr>
          <th v-for="(cell, index) in header" :key="`head-${index}`">
            <MarkdownInline :tokens="cell" />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in rows" :key="`row-${rowIndex}`">
          <td v-for="(cell, cellIndex) in row" :key="`cell-${rowIndex}-${cellIndex}`">
            <MarkdownInline :tokens="cell" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>