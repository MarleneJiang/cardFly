<script setup lang="ts">
import type { Editor } from '@tiptap/core'
import type { PropType } from 'vue'
import { Popover, PopoverPanel as PopoverContent, PopoverButton as PopoverTrigger } from '@headlessui/vue'
import { getUrlFromString } from '@/components/editor/utils/editor'

const props = defineProps({
  editor: {
    type: Object as PropType<Editor>,
    required: true,
  },
})

const inputRef = ref<HTMLInputElement | null>(null)

function submit(e: any) {
  const input = e.target[0] as HTMLInputElement
  const url = getUrlFromString(input.value)
  // eslint-disable-next-line no-console
  console.log('url', url)
  url && props.editor.chain().focus().setLink({ href: url }).run()
}
</script>

<template>
  <Popover>
    <div class="relative">
      <PopoverTrigger
        type="button"
        :class="`flex group items-center justify-center border text-sm font-semibold rounded-md disabled:opacity-50 whitespace-nowrap border-transparent hover:bg-black/5 hover:text-neutral-700 active:bg-black/10 active:text-neutral-800 dark:hover:bg-white/10 dark:hover:text-neutral-300 dark:active:text-neutral-200 h-8 gap-1 min-w-[2rem] px-2 w-auto ${editor?.isActive('link') ? 'bg-black/10 dark:bg-white/20 text-neutral-800 dark:text-neutral-200' : 'text-neutral-500 dark:text-neutral-400 bg-transparent'}`"
      >
        <Icon
          name="lucide:link" class="h-4 w-4" :class="{
            'text-primary': editor?.isActive('link'),
          }"
        />
        <!-- <p class="text-base">
          ↗
        </p>
        <p
          class="underline decoration-stone-400 underline-offset-4"
          :class="{
            'text-blue-500': editor?.isActive('link'),
          }"
        >
          Link
        </p> -->
      </PopoverTrigger>
      <PopoverContent
        v-slot="{ close }"
        align="start"
      >
        <form
          class="animate-in fade-in slide-in-from-top-1 absolute z-[99999] mt-1 w-60 flex overflow-hidden border border-stone-200 rounded bg-white p-1 shadow-xl" @submit.prevent="($event) => {
            submit($event);
            close();
          }"
        >
          <input
            ref="inputRef"
            type="text"
            placeholder="Paste a link"
            class="flex-1 bg-white p-1 text-sm outline-none"
            :defaultValue="editor.getAttributes('link').href || ''"
            @mousedown.stop
          >

          <button
            v-if="editor.getAttributes('link').href"
            type="button"
            class="flex items-center rounded-sm p-1 text-red-600 transition-all hover:bg-red-100 dark:hover:bg-red-800"
            @click="
              () => {
                editor.chain().focus().unsetLink().run();
                close();
              }
            "
          >
            <Icon name="lucide:trash" class="h-4 w-4" />
          </button>
          <button
            v-else
            class="flex items-center rounded-sm p-1 text-stone-600 transition-all hover:bg-stone-100"
          >
            <Icon name="lucide:check" class="h-4 w-4" />
          </button>
        </form>
      </PopoverContent>
    </div>
  </Popover>
</template>

<style scoped></style>
