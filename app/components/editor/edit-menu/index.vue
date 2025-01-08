<script lang="ts" setup>
import type { Editor } from '@tiptap/core'
import type { PropType } from 'vue'
import TipTapNodeSelector from './NodeSelector.vue'
import TipTapLinkSelector from './LinkSelector.vue'
import TipTapColorSelector from './ColorSelector.vue'

const props = defineProps({
  editor: {
    type: Object as PropType<Editor>,
    required: true,
  },
})

const items = [
  {
    name: 'bold',
    disabled: () => !props.editor?.can().chain().focus().toggleBold().run(),
    isActive: () => props.editor?.isActive('bold'),
    command: () => props.editor?.chain().focus().toggleBold().run(),
    icon: 'lucide:bold',
  },
  {
    name: 'italic',
    disabled: () => !props.editor?.can().chain().focus().toggleItalic().run(),
    isActive: () => props.editor?.isActive('italic'),
    command: () => props.editor?.chain().focus().toggleItalic().run(),
    icon: 'lucide:italic',
  },
  {
    name: 'underline',
    disabled: () => !props.editor?.can().chain().focus().toggleUnderline().run(),
    isActive: () => props.editor?.isActive('underline'),
    command: () => props.editor?.chain().focus().toggleUnderline().run(),
    icon: 'lucide:underline',
  },
  {
    name: 'strike',
    disabled: () => !props.editor?.can().chain().focus().toggleStrike().run(),
    isActive: () => props.editor?.isActive('strike'),
    command: () => props.editor?.chain().focus().toggleStrike().run(),
    icon: 'lucide:strikethrough',
  },
  {
    name: 'clear marks',
    disabled: () => !props.editor?.can().chain().focus().unsetAllMarks().run(),
    isActive: () => false,
    command: () => props.editor?.chain().focus().unsetAllMarks().run(),
    icon: 'lucide:eraser',
  },
  {
    name: 'clear nodes',
    disabled: () => !props.editor?.can().chain().focus().clearNodes().run(),
    isActive: () => false,
    command: () => props.editor?.chain().focus().clearNodes().run(),
    icon: 'lucide:trash',
  },
  {
    name: 'horizontal rule',
    disabled: () => !props.editor?.can().chain().focus().setHorizontalRule().run(),
    isActive: () => false,
    command: () => props.editor?.chain().focus().setHorizontalRule().run(),
    icon: 'lucide:table-rows-split',
  },
  {
    name: 'hard break',
    disabled: () => !props.editor?.can().chain().focus().setHardBreak().run(),
    isActive: () => false,
    command: () => props.editor?.chain().focus().setHardBreak().run(),
    icon: 'lucide:unfold-vertical',
  },
  {
    name: 'undo',
    disabled: () => !props.editor?.can().undo(),
    isActive: () => false,
    command: () => props.editor?.chain().focus().undo().run(),
    icon: 'lucide:undo',
  },
  {
    name: 'redo',
    disabled: () => !props.editor?.can().redo(),
    isActive: () => false,
    command: () => props.editor?.chain().focus().redo().run(),
    icon: 'lucide:redo',
  },
]
</script>

<template>
  <div class="w-full flex flex-wrap items-center justify-center gap-3 py-1">
    <button
      v-for="(item, index) in items"
      :key="index"
      :class="`flex group items-center justify-center border text-sm font-semibold rounded-md disabled:opacity-50 whitespace-nowrap border-transparent hover:bg-black/5 hover:text-neutral-700 active:bg-black/10 active:text-neutral-800 dark:hover:bg-white/10 dark:hover:text-neutral-300 dark:active:text-neutral-200 h-8 gap-1 min-w-[2rem] px-2 w-auto ${item.isActive() ? 'bg-black/10 dark:bg-white/20 text-neutral-800 dark:text-neutral-200' : 'text-neutral-500 dark:text-neutral-400 bg-transparent'}`"
      type="button"
      :disabled="item.disabled()"
      @click="item.command()"
    >
      <Icon
        :name="item.icon" class="h-4 w-4"
        :class="{
          'text-primary': item.isActive(),
        }"
      />
    </button>
    <template v-if="editor">
      <TipTapLinkSelector :editor="editor" />
      <TipTapColorSelector :editor="editor" />

      <TipTapNodeSelector :editor="editor" />
    </template>
  </div>
</template>

<style>

</style>
