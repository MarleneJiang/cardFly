<script lang="ts" setup>
import { defineEmits, defineProps, onMounted, ref, watch } from 'vue'
import * as monaco from 'monaco-editor'
import { language as markdownLanguage } from '@nuxtlabs/monarch-mdc'
// import { shikiToMonaco } from '@shikijs/monaco'
// import { createHighlighter } from 'shiki'

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    default: 'mdc',
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:code'])
const editorContainer = ref()
let editor: any = null

onMounted(async () => {
  monaco.languages.register({ id: 'mdc' })
  monaco.languages.register({ id: 'vue' })

  monaco.languages.setMonarchTokensProvider('mdc', markdownLanguage)
  const model = monaco.editor.createModel(
    props.code,
    'mdc',
  )
  // const highlighter = await createHighlighter({
  //   themes: [
  //     'vitesse-light',
  //   ],
  //   langs: [
  //     'vue',
  //     'mdc',
  //   ],

  // })
  // shikiToMonaco(highlighter, monaco)
  monaco.languages.setLanguageConfiguration('vue', {
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/'],
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')'],
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: '\'', close: '\'' },
      { open: '`', close: '`' },
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
      { open: '"', close: '"' },
      { open: '\'', close: '\'' },
      { open: '`', close: '`' },
    ],
    folding: {
      offSide: true,
    },
  })

  editor = monaco.editor.create(editorContainer.value, {
    model,
    language: props.language,
    theme: 'vitesse-light',
    automaticLayout: true,
    readOnly: props.readOnly,
    minimap: {
      enabled: false,
    },
    fontSize: 14,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    roundedSelection: false,
    padding: {
      top: 8,
    },
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 3,
    bracketPairColorization: {
      enabled: true,
    },
    formatOnPaste: true,
    formatOnType: true,
    folding: true,
  // Monaco edito options
  // see: https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.istandaloneeditorconstructionoptions.html
  })

  editor.onDidChangeModelContent(() => {
    emit('update:code', editor.getValue())
  })
})

watch(() => props.code, (newCode) => {
  if (editor && editor.getValue() !== newCode)
    editor.setValue(newCode)
})
</script>

<template>
  <div ref="editorContainer" />
</template>

<style>

</style>
