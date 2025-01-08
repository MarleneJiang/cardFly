<script lang="ts" setup>
import type { Component, ComponentContent } from './components.type'
import CompRender from '@/components/render/CompRender.vue'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import MdcEit from '@/components/MdcEdit.vue'

const props = defineProps<{ component: Component }>()
const emit = defineEmits<{
  changeComponent: [data: { content: ComponentContent }]
}>()
const content = toReactive(props.component.content)
const sfcCode = ref(`<script setup>
${content?.script || ''}
<\/script>
<template>
${content?.template || ''}
<\/template>
<style>
${content?.style || ''}
<\/style>
`)
function validateCode(code) {
  const scriptSetupRegex = /<script\s+setup>[\s\S]*?<\/script>/
  const templateRegex = /<template>[\s\S]*?<\/template>/
  const styleRegex = /<style>[\s\S]*?<\/style>/

  return scriptSetupRegex.test(code) && templateRegex.test(code) && styleRegex.test(code)
}
watchDebounced(sfcCode, (value) => {
  if (value && validateCode(value)) {
    // content.template = value.match(/<template>[\s\S]*?<\/template>/)[0].replace(/<template>|<\/template>/g, '').trim();
    const templateMatch = value.match(/<template>[\s\S]*?<\/template>/)
    if (templateMatch && templateMatch[0])
      content.template = templateMatch[0].replace(/<template>|<\/template>/g, '').trim()
    const scriptMatch = value.match(/<script setup>[\s\S]*?<\/script>/)
    if (scriptMatch && scriptMatch[0])
      content.script = scriptMatch[0].replace(/<script setup>|<\/script>/g, '').trim()
    const styleMatch = value.match(/<style>[\s\S]*?<\/style>/)
    if (styleMatch && styleMatch[0])
      content.style = styleMatch[0].replace(/<style>|<\/style>/g, '').trim()
    emit('changeComponent', { content })
  }
  else {
    toast({
      title: 'Invalid SFC',
      description: '代码必须包含 <script setup>、<template> 和 <style> 标签。',
      variant: 'destructive',
    })
  }
}, {
  debounce: 500,
})
watch(() => content?.example, (value) => {
  if (value)
    emit('changeComponent', { content })
})
</script>

<template>
  <ResizablePanelGroup
    id="resize-panel-group-1"
    direction="horizontal"
    class="h-full items-stretch"
  >
    <ResizablePanel id="resize-panel-1" :default-size="70" :min-size="50">
      <ResizablePanelGroup id="resize-panel-group-2" direction="vertical">
        <ResizablePanel id="resize-panel-3" :min-size="5" class="relative">
          <div class="absolute right-0 top-0 rounded-lb-sm bg-primary p-1 px-2 text-sm text-white">
            Vue SFC
          </div>
          <MdcEit v-model:code="sfcCode" class="h-full resize-none border-none shadow-none focus-visible:ring-none focus-visible:ring-none" language="vue" />
        </ResizablePanel>
        <ResizableHandle id="resize-handle-4" with-handle />
        <ResizablePanel id="resize-panel-6" :min-size="5" :default-size="10" class="relative">
          <div class="absolute right-0 top-0 rounded-lb-sm bg-primary p-1 px-2 text-sm text-white">
            Example
          </div>
          <Textarea id="template" v-model="content.example" placeholder="Type your Example here." class="h-full resize-none border-none shadow-none focus-visible:ring-none focus-visible:ring-none" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
    <ResizableHandle id="resize-handle-1" with-handle />
    <ResizablePanel id="resize-panel-2" :default-size="30" :min-size="25" class="w-full">
      <CompRender :content="content" :renderer-options="{ unoConfig: { uno: true } }" />
    </ResizablePanel>
  </ResizablePanelGroup>
</template>
