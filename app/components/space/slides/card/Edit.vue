<script lang="ts" setup>
import { toRef } from '@vueuse/core'
import type { SlidesItem } from '../slides.type'
import CompList from './CompList.vue'
import Chat from './Chat.vue'
import MdcEit from '@/components/MdcEdit.vue'
import CardRender from '@/components/render/CardRender.vue'
import type { Component } from '@/components/space/components/components.type'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'

const props = defineProps<{
  slidesItem: SlidesItem
}>()
const emit = defineEmits<{
  changeSlidesItem: [data: SlidesItem]
}>()
const tab = ref('render')
const slidesItemComponents = toRef(props.slidesItem.components || [])
const sfcComponents = computed(() => {
  return (slidesItemComponents.value || []).reduce((acc: Record<string, any>, cur: Component) => {
    const content = `<script setup>
${cur?.content?.script || ''}
<\/script>
<template>
${cur?.content?.template || ''}
<\/template>
<style>
${cur?.content?.style || ''}
<\/style>
`
    acc[cur.name] = content
    return acc
  }, {})
})
const slidesItemContents = toRef(props.slidesItem.contents)
function changeSlidesItemContents(index: number, content: string) {
  slidesItemContents.value[index].content = content
}
function changeTab(value: string) {
  tab.value = value
}
function changeSlidesItemComponents(components: any) {
  slidesItemComponents.value = components
  emit('changeSlidesItem', { components } as any)
}
watch(slidesItemContents, (value) => {
  emit('changeSlidesItem', { contents: value } as any)
}, {
  deep: true,
})
</script>

<template>
  <ResizablePanelGroup
    id="resize-panel-group-1"
    direction="horizontal"
    class="h-full items-stretch"
  >
    <ResizablePanel id="resize-panel-1" :default-size="15" :min-size="15" class="w-full">
      <div class="flex items-center px-4 py-2">
        <h1 class="text-[1rem] font-bold">
          组件库
        </h1>
      </div>
      <Separator />
      <CompList class="my-4" :slides-item-components="slidesItemComponents" @change-slides-item-components="changeSlidesItemComponents" />
    </ResizablePanel>
    <ResizableHandle id="resize-handle-1" />
    <ResizablePanel id="resize-panel-2" :default-size="35" :min-size="25">
      <Chat @change-slides-item-contents="changeSlidesItemContents" @change-tab="changeTab" />
    </ResizablePanel>
    <ResizableHandle id="resize-handle-2" with-handle />
    <ResizablePanel id="resize-panel-3" :default-size="50" :min-size="30" class="h-full flex flex-1 flex-col">
      <Tabs v-model="tab" default-value="render" class="h-full flex flex-col">
        <div class="flex items-center px-2 py-1">
          <TabsList>
            <TabsTrigger value="code" class="text-zinc-600 dark:text-zinc-200">
              <div class="i-mdi:application-brackets-outline h-5 w-5" />
            </TabsTrigger>
            <TabsTrigger value="render" class="text-zinc-600 dark:text-zinc-200">
              <div class="i-mdi:clipboard-play-multiple-outline h-5 w-5" />
            </TabsTrigger>
          </TabsList>
        </div>
        <Separator />
        <TabsContent value="code" class="m-0 flex-1">
          <!-- <Textarea id="template" v-model="slidesItemContents[0].content" placeholder="Type your Content here." class="h-full resize-none border-none shadow-none focus-visible:ring-none focus-visible:ring-none" /> -->
          <MdcEit v-model:code="slidesItemContents[0].content" class="h-full resize-none border-none shadow-none focus-visible:ring-none focus-visible:ring-none" />
        </TabsContent>
        <TabsContent value="render" class="m-0 flex-1">
          <CardRender :slides-source="slidesItemContents[0]" :renderer-options="{ sfcComponents }" />
        </TabsContent>
      </Tabs>
    </ResizablePanel>
  </ResizablePanelGroup>
</template>
