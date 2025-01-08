<script setup lang="ts">
import type { PropType } from 'vue'
import type { Editor, Range } from '@tiptap/core'
// import { useCompletion } from 'ai/vue'
import type { SuggestionItem } from './slashExtension'
import { getPrevNumText } from '@/components/editor/utils/editor'

const props = defineProps({
  items: {
    type: Array as PropType<SuggestionItem[]>,
    required: true,
  },
  command: {
    type: Function,
    required: true,
  },
  editor: {
    type: Object as PropType<Editor>,
    required: true,
  },
  range: {
    type: Object as PropType<Range>,
    required: true,
  },
})

const selectedIndex = ref(0)

// const { complete, isLoading } = useCompletion({
//   id: "novel-vue",
//   api: inject('completionApi'),
//   onResponse: (_) => {
//     props.editor.chain().focus().deleteRange(props.range).run();
//   },
//   onFinish: (_prompt, completion) => {
//     // highlight the generated text
//     props.editor.commands.setTextSelection({
//       from: props.range.from,
//       to: props.range.from + completion.length,
//     });
//   },
//   onError: (e) => {
//     console.error(e);
//   },
// });
const { complete, isLoading } = {
  complete: (text: string) => {
    // eslint-disable-next-line no-console
    console.log(text)
  },
  isLoading: ref(false),
}
const commandListContainer = ref<HTMLDivElement>()

const navigationKeys = ['ArrowUp', 'ArrowDown', 'Enter']
function onKeyDown(e: KeyboardEvent) {
  if (navigationKeys.includes(e.key)) {
    e.preventDefault()
    if (e.key === 'ArrowUp') {
      selectedIndex.value
        = (selectedIndex.value + props.items.length - 1) % props.items.length
      scrollToSelected()
      return true
    }
    if (e.key === 'ArrowDown') {
      selectedIndex.value = (selectedIndex.value + 1) % props.items.length

      scrollToSelected()
      return true
    }
    if (e.key === 'Enter') {
      selectItem(selectedIndex.value)
      return true
    }
    return false
  }
}

watch(
  () => props.items,
  () => {
    selectedIndex.value = 0
  },
)

defineExpose({
  onKeyDown,
})

function selectItem(index: number) {
  const item = props.items[index]

  if (item) {
    if (item.title === 'Continue writing') {
      if (isLoading.value)
        return
      complete(
        getPrevNumText(props.editor, {
          chars: 5000,
          offset: 1,
        }),
      )
    }
    else {
      props.command(item)
    }
  }
}

function updateScrollView(container: HTMLElement, item: HTMLElement) {
  const containerHeight = container.offsetHeight
  const itemHeight = item ? item.offsetHeight : 0

  const top = item.offsetTop
  const bottom = top + itemHeight

  if (top < container.scrollTop)
    container.scrollTop -= container.scrollTop - top + 5
  else if (bottom > containerHeight + container.scrollTop)
    container.scrollTop += bottom - containerHeight - container.scrollTop + 5
}

function scrollToSelected() {
  const container = commandListContainer.value
  const item = container?.children[selectedIndex.value] as HTMLElement

  if (container && item)
    updateScrollView(container, item)
}
</script>

<template>
  <div
    v-if="items.length > 0"
    ref="commandListContainer"
    class="z-50 h-auto max-h-[330px] w-72 overflow-y-auto border border-stone-200 rounded-md bg-white px-1 py-2 shadow-md transition-all"
  >
    <button
      v-for="(item, index) in items"
      :key="index"
      class="w-full flex items-center rounded-md px-2 py-1 text-left text-sm text-stone-900 space-x-2 hover:bg-stone-100"
      :class="index === selectedIndex ? 'bg-stone-100 text-stone-900' : ''"
      @click="selectItem(index)"
    >
      <div
        class="h-10 w-10 flex items-center justify-center border border-stone-200 rounded-md bg-white"
      >
        <LoadingCircle v-if="item.title === 'Continue writing' && isLoading" />
        <Icon v-else :name="item.icon" size="18" class="h-5 w-5" />
      </div>
      <div>
        <p class="font-medium">
          {{ item.title }}
        </p>
        <p class="text-xs text-stone-500">
          {{ item.description }}
        </p>
      </div>
    </button>
  </div>
</template>
