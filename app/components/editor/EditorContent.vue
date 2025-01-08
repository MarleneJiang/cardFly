<!-- eslint-disable vue/require-valid-default-prop -->
<script setup lang="ts">
import type {
  Extension,
  JSONContent,
} from '@tiptap/vue-3'
import type { EditorProps } from '@tiptap/pm/view'
import type { Editor as EditorClass } from '@tiptap/core'
import { useDebounceFn, useStorage } from '@vueuse/core'
import { notesExtensions, slidesExtensions } from './extensions'
import TipTapBubbleMenu from './bubble-menu/index.vue'
import TipTapEditMenu from './edit-menu/index.vue'
import { defaultEditorProps } from '@/components/editor/props'
import { getPrevNumText } from '@/components/editor/utils/editor'
import { defaultEditorContent } from '@/components/editor/utils/default-content'

const props = defineProps({
  /**
   * The API route to use for the Vercel Blob.
   * Defaults to "/api/upload".
   */
  blobApi: {
    type: String,
    default: '/api/upload',
  },
  /**
   * The API route to use for the OpenAI completion API.
   * Defaults to "/api/generate".
   */
  completionApi: {
    type: String,
    default: '/api/generate',
  },
  /**
   * Additional classes to add to the editor container.
   * Defaults to "relative min-h-[500px] w-full max-w-screen-lg border-stone-200 bg-white p-12 px-8 sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:px-12 sm:shadow-lg".
   */
  className: {
    type: String,
    default:
      'relative min-h-[500px] w-full mx-auto max-w-screen-lg border-stone-200 bg-white p-12 px-8 sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:px-12 sm:shadow-lg',
  },
  /**
   * The default value to use for the editor.
   * Defaults to defaultEditorContent.
   */
  defaultValue: {
    type: Object as PropType<JSONContent>,
    default: () => {
      return defaultEditorContent
    },
  },
  /**
   * A list of extensions to use for the editor, in addition to the default Novel extensions.
   * Defaults to [].
   */
  extensions: {
    type: Array as PropType<Extension[]>,
    default: [],
  },
  /**
   * Props to pass to the underlying Tiptap editor, in addition to the default Novel editor props.
   * Defaults to {}.
   */
  editorProps: {
    type: Object as PropType<EditorProps>,
    default: {},
  },
  /**
   * A callback function that is called whenever the editor is updated.
   * Defaults to () => {}.
   */
  onUpdate: {
    type: Function as PropType<(editor?: EditorClass) => void | Promise<void>>,
    default: () => {},
  },
  /**
   * A callback function that is called whenever the editor is updated, but only after the defined debounce duration.
   * Defaults to () => {}.
   */
  onDebouncedUpdate: {
    type: Function as PropType<(editor?: EditorClass) => void | Promise<void>>,
    default: () => {},
  },
  /**
   * The duration (in milliseconds) to debounce the onDebouncedUpdate callback.
   * Defaults to 750.
   */
  debounceDuration: {
    type: Number,
    default: 750,
  },
  /**
   * The key to use for storing the editor's value in local storage.
   * Defaults to "tiptap__content".
   */
  storageKey: {
    type: String,
    default: 'tiptap__content',
  },
})

provide('completionApi', props.completionApi)
useStorage('blobApi', props.blobApi)

const charsCount = ref(0)
const saveStatus = ref('Saved')

const content = useStorage(props.storageKey, props.defaultValue)

const debouncedUpdate = useDebounceFn(({ editor }) => {
  const json = editor.getJSON()
  content.value = json
  props.onDebouncedUpdate(editor)
  saveStatus.value = 'Saved'
}, props.debounceDuration)

const isLoading = ref(false) // 临时变量

const editor = useEditor({
  extensions: [...notesExtensions, ...props.extensions],
  editorProps: {
    ...defaultEditorProps,
    ...props.editorProps,
  },
  onUpdate: (e) => {
    const selection = e.editor.state.selection
    const lastTwo = getPrevNumText(e.editor, {
      chars: 2,
    })
    // Run the completion API if the user types "++" at the end of the document.
    if (lastTwo === '++' && !isLoading.value) {
      e.editor.commands.deleteRange({
        from: selection.from - 2,
        to: selection.from,
      })
      // complete(
      //   getPrevNumText(e.editor, {
      //     chars: 5000,
      //   })
      // );
      // eslint-disable-next-line no-alert
      alert('complete')
    }
    else {
      charsCount.value = e.editor.storage.characterCount.words()
      saveStatus.value = 'Unsaved'
      props.onUpdate(e.editor)
      debouncedUpdate(e)
    }
  },
  autofocus: 'end',
})

// const { complete, completion, isLoading, stop } = useCompletion({
//   id: "novel-vue",
//   api: props.completionApi,
//   onFinish: (_prompt, completion) => {
//     editor.value?.commands.setTextSelection({
//       from: editor.value.state.selection.from - completion.length,
//       to: editor.value.state.selection.from,
//     });
//   },
//   onError: (err) => {
//     console.error(err);
//   },
// });

// Insert chunks of the generated text
// watch(
//   () => completion.value,
//   (newCompletion, oldCompletion) => {
//     const diff = newCompletion?.slice(oldCompletion?.length);
//     if (diff) {
//       editor.value?.commands.insertContent(diff);
//     }
//   }
// );

// if user presses escape or cmd + z and it's loading,
// stop the request, delete the completion, and insert back the "++"
// const onKeyDown = (e: KeyboardEvent) => {
//   if (e.key === "Escape" || (e.metaKey && e.key === "z")) {
//     stop();
//     if (e.key === "Escape") {
//       editor.value?.commands.deleteRange({
//         from: editor.value.state.selection.from - completion.value.length,
//         to: editor.value.state.selection.from,
//       });
//     }
//     editor.value?.commands.insertContent("++");
//   }
// };

// const mousedownHandler = (e: MouseEvent) => {
//   e.preventDefault();
//   e.stopPropagation();
//   stop();
//   if (window.confirm("AI writing paused. Continue?")) {
//     complete(editor.value?.getText() || "");
//   }
// };

// watch(
//   () => isLoading.value,
//   (isLoading) => {
//     if (isLoading) {
//       document.addEventListener("keydown", onKeyDown);
//       window.addEventListener("mousedown", mousedownHandler);
//     } else {
//       document.removeEventListener("keydown", onKeyDown);
//       window.removeEventListener("mousedown", mousedownHandler);
//     }
//   }
// );

defineExpose({
  editor,
})

// Load the editor content from local storage on mount.
const hydrated = ref(false)
watchEffect(() => {
  if (editor.value && content.value && !hydrated.value) {
    editor.value.commands.setContent(content.value)
    hydrated.value = true
  }
})

onBeforeUnmount(() => {
  unref(editor).destroy()
})
</script>

<template>
  <div>
    <TipTapEditMenu :editor="editor" />
    <div v-if="editor" :class="`${className} editor-content relative`" @click="editor?.chain().focus().run()">
      <div class="absolute right-5 top-5 z-10 mb-5 flex cursor-pointer gap-2">
        <div class="rounded-lg bg-accent px-2 py-1 text-sm text-muted-foreground">
          {{ saveStatus }}
        </div>
        <div :class="`${charsCount ? 'rounded-lg text-muted-foreground' : 'hidden'} bg-accent px-2 py-1 text-sm`">
          {{ charsCount }} Words
        </div>
      </div>
      <TipTapBubbleMenu :editor="editor" />
      <TiptapEditorContent :editor="editor" />
    </div>
    <div v-else>
      <Skeleton :class="`${className} editor-content !bg-gray/20`" />
    </div>
  </div>
</template>

<style lang="css" scoped>
.is-active {
  background-color: #f0f0f0;
  font-weight: bold;
}
</style>

<style lang="scss">
@use './styles/tailwind.scss';
</style>

<style>
@import url('./styles/index.css');
@import url('./styles/Prosemirror.css');
</style>
