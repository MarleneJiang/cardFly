<script setup lang="ts">
import type { Editor } from '@tiptap/core'
import { Popover, PopoverPanel as PopoverContent, PopoverButton as PopoverTrigger } from '@headlessui/vue'
import type { PropType } from 'vue'

const props = defineProps({
  editor: {
    type: Object as PropType<Editor>,
    required: true,
  },
})
const TEXT_COLORS = [
  {
    name: 'Default',
    color: 'var(--tiptap-black)',
  },
  {
    name: 'Purple',
    color: '#9333EA',
  },
  {
    name: 'Red',
    color: '#E00000',
  },
  {
    name: 'Yellow',
    color: '#EAB308',
  },
  {
    name: 'Blue',
    color: '#2563EB',
  },
  {
    name: 'Green',
    color: '#008A00',
  },
  {
    name: 'Orange',
    color: '#FFA500',
  },
  {
    name: 'Pink',
    color: '#BA4081',
  },
  {
    name: 'Gray',
    color: '#A8A29E',
  },
]

const HIGHLIGHT_COLORS = [
  {
    name: 'Default',
    color: 'var(--tiptap-highlight-default)',
  },
  {
    name: 'Purple',
    color: 'var(--tiptap-highlight-purple)',
  },
  {
    name: 'Red',
    color: 'var(--tiptap-highlight-red)',
  },
  {
    name: 'Yellow',
    color: 'var(--tiptap-highlight-yellow)',
  },
  {
    name: 'Blue',
    color: 'var(--tiptap-highlight-blue)',
  },
  {
    name: 'Green',
    color: 'var(--tiptap-highlight-green)',
  },
  {
    name: 'Orange',
    color: 'var(--tiptap-highlight-orange)',
  },
  {
    name: 'Pink',
    color: 'var(--tiptap-highlight-pink)',
  },
  {
    name: 'Gray',
    color: 'var(--tiptap-highlight-gray)',
  },
]

const activeColorItem = computed(() =>
  TEXT_COLORS.find(({ color }) => props.editor?.isActive('textStyle', { color })),
)

const activeHighlightItem = computed(() =>
  HIGHLIGHT_COLORS.find(({ color }) =>
    props.editor?.isActive('highlight', { color }),
  ),
)
</script>

<template>
  <Popover>
    <div class="relative">
      <PopoverTrigger
        class="h-8 flex items-center gap-1 rounded-md p-2 px-1 text-sm text-stone-500 font-medium active:bg-stone-200 hover:bg-black/5 dark:text-neutral-400 hover:text-neutral-700 focus:outline-none dark:hover:bg-white/10 dark:hover:text-neutral-300"
      >
        <span
          class="rounded-sm px-1"
          :style="{
            color: activeColorItem?.color,
            backgroundColor: activeHighlightItem?.color,
          }"
        >
          A
        </span>

        <Icon name="lucide:chevron-down" class="h-4 w-4" />
      </PopoverTrigger>

      <PopoverContent
        v-slot="{ close }"
        align="start"
        class="animate-in fade-in slide-in-from-top-1 absolute z-[99999] my-1 max-h-80 w-48 flex flex-col overflow-hidden overflow-y-auto border border-stone-200 rounded bg-white p-1 shadow-xl"
      >
        <div class="my-1 px-2 text-sm text-stone-500">
          Color
        </div>
        <button
          v-for="(textColor, index) in TEXT_COLORS"
          :key="index"
          class="flex items-center justify-between rounded-sm px-2 py-1 text-sm text-stone-600 hover:bg-stone-100"
          type="button"
          @click="
            () => {
              editor.commands.unsetColor();
              textColor.name !== 'Default'
                && editor
                  .chain()
                  .focus()
                  .setColor(textColor.color || '')
                  .run();
              close();
            }
          "
        >
          <div class="flex items-center space-x-2">
            <div
              class="border border-stone-200 rounded-sm px-1 py-px font-medium"
              :style="{ color: textColor.color }"
            >
              A
            </div>
            <span>{{ textColor.name }}</span>
          </div>
          <Icon
            v-if="editor?.isActive('textStyle', { color: textColor.color })"
            name="lucide:check"
            class="h-4 w-4"
          />
        </button>
        <div class="mb-1 mt-2 px-2 text-sm text-stone-500">
          Background
        </div>
        <button
          v-for="(highlightColor, index) in HIGHLIGHT_COLORS"
          :key="index"
          class="flex items-center justify-between rounded-sm px-2 py-1 text-sm text-stone-600 hover:bg-stone-100"
          type="button"
          @click="
            () => {
              editor.commands.unsetHighlight();
              highlightColor.name !== 'Default'
                && editor.commands.setHighlight({ color: highlightColor.color });
              close();
            }
          "
        >
          <div class="flex items-center space-x-2">
            <div
              class="border border-stone-200 rounded-sm px-1 py-px font-medium"
              :style="{ backgroundColor: highlightColor.color }"
            >
              A
            </div>
            <span>{{ highlightColor.name }}</span>
          </div>

          <Icon
            v-if="editor?.isActive('highlight', { color: highlightColor.color })"
            name="lucide:check"
            class="h-4 w-4"
          />
        </button>
      </PopoverContent>
    </div>
  </Popover>
</template>

<style scoped></style>
