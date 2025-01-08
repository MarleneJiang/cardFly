<script setup lang="ts">
import { BubbleMenu } from '@tiptap/vue-3'
import type { PropType } from 'vue'
import type { Editor } from '@tiptap/core'

const props = defineProps({
  editor: {
    type: Object as PropType<Editor>,
    required: true,
  },
})
</script>

<template>
  <BubbleMenu
    :editor="editor"
    class="w-fit flex border border-stone-200 rounded bg-white shadow-xl divide-x divide-stone-200"
  >
    <div class="flex cursor-pointer">
      ✨AI✨
    </div>
  </BubbleMenu>
</template>

<style scoped></style>
