<script setup lang="ts">
import type { Editor } from '@tiptap/core'
import type { PropType } from 'vue'
import { Popover, PopoverPanel as PopoverContent, PopoverButton as PopoverTrigger } from '@headlessui/vue'

const props = defineProps({
  editor: {
    type: Object as PropType<Editor>,
    required: true,
  },
})

const items = [
  {
    name: 'Text',
    icon: 'lucide:pilcrow',
    command: () =>
      props.editor.chain().focus().toggleNode('paragraph', 'paragraph').run(),
    isActive: () =>
      props.editor?.isActive('paragraph')
      && !props.editor?.isActive('bulletList')
      && !props.editor?.isActive('orderedList'),
  },
  {
    name: 'Heading 1',
    icon: 'lucide:heading-1',
    command: () =>
      props.editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: () => props.editor?.isActive('heading', { level: 1 }),
  },
  {
    name: 'Heading 2',
    icon: 'lucide:heading-2',
    command: () =>
      props.editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: () => props.editor?.isActive('heading', { level: 2 }),
  },
  {
    name: 'Heading 3',
    icon: 'lucide:heading-3',
    command: () =>
      props.editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: () => props.editor?.isActive('heading', { level: 3 }),
  },
  {
    name: 'To-do List',
    icon: 'lucide:square-check-big',
    command: () => props.editor?.chain().focus().toggleTaskList().run(),
    isActive: () => props.editor?.isActive('taskItem'),
  },
  {
    name: 'Bullet List',
    icon: 'lucide:list-ordered',
    command: () => props.editor?.chain().focus().toggleBulletList().run(),
    isActive: () => props.editor?.isActive('bulletList'),
  },
  {
    name: 'Numbered List',
    icon: 'lucide:list-ordered',
    command: () => props.editor?.chain().focus().toggleOrderedList().run(),
    isActive: () => props.editor?.isActive('orderedList'),
  },
  {
    name: 'Quote',
    icon: 'lucide:text-quote',
    command: () =>
      props.editor
        .chain()
        .focus()
        .toggleNode('paragraph', 'paragraph')
        .toggleBlockquote()
        .run(),
    isActive: () => props.editor?.isActive('blockquote'),
  },
  {
    name: 'Code',
    icon: 'lucide:code',
    command: () => props.editor?.chain().focus().toggleCodeBlock().run(),
    isActive: () => props.editor?.isActive('codeBlock'),
  },
]

const activeItem = computed(
  () =>
    items.filter(item => item.isActive()).pop() ?? {
      name: 'Multiple',
    },
)
function findIconName(name: string) {
  return items.find(item => item.name === name)?.icon || 'ban'
}
</script>

<template>
  <Popover>
    <div class="relative">
      <PopoverTrigger
        class="h-8 flex items-center gap-1 whitespace-nowrap rounded-md p-2 px-1 text-sm text-stone-500 font-medium font-medium active:bg-stone-200 hover:bg-black/5 dark:text-neutral-400 hover:text-neutral-700 focus:outline-none focus:outline-none dark:hover:bg-white/10 dark:hover:text-neutral-300"
      >
        <Icon :name="findIconName(activeItem?.name)" class="h-4 w-4" />
        <Icon name="lucide:chevron-down" class="h-4 w-4" />
      </PopoverTrigger>

      <PopoverContent
        v-slot="{ close }"
        align="start"
        class="animate-in fade-in slide-in-from-top-1 absolute z-[99999] my-1 max-h-80 w-48 flex flex-col overflow-hidden overflow-y-auto border border-stone-200 rounded bg-white p-1 shadow-xl"
      >
        <button
          v-for="(item, index) in items"
          :key="index"
          class="flex items-center justify-between rounded-sm px-2 py-1 text-sm text-stone-600 hover:bg-stone-100"
          type="button"
          @click="
            () => {
              item.command();
              close();
            }
          "
        >
          <div class="flex items-center space-x-2">
            <div class="group h-6 w-6 flex items-center justify-center border border-stone-200 rounded-sm">
              <Icon :name="item.icon" class="h-3 w-3" />
            </div>
            <span>{{ item.name }}</span>
          </div>
          <Icon v-if="activeItem.name === item.name" name="lucide:check" class="h-4 w-4" />
        </button>
      </PopoverContent>
    </div>
  </Popover>
</template>

<style scoped></style>
