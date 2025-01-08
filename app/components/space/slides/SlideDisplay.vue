<script lang="ts" setup>
import { toPng } from 'html-to-image'
import type { SlidesItem } from './slides.type'
import CardRender from '@/components/render/CardRender.vue'
import type { Database } from '~~/types/supabase'
import type { Component } from '@/components/space/components/components.type'

const emit = defineEmits<{
  change: [data: { name: string, updatedAt: string }]
}>()

const componentRef = ref(null)

const client = useSupabaseClient<Database>()
const user = useSupabaseUser()
const selectedSlidesItem = defineModel<SlidesItem>('selectedSlidesItem', { required: false })
const sfcComponents = computed(() => {
  return (selectedSlidesItem.value?.components || []).reduce((acc: Record<string, any>, cur: Component) => {
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
const selectedSlidesItemName = ref(selectedSlidesItem.value?.name || '')
watch(() => selectedSlidesItem.value?.name, () => {
  selectedSlidesItemName.value = selectedSlidesItem.value?.name || ''
})
watchDebounced(selectedSlidesItemName, async (name) => {
  if (selectedSlidesItem.value && name !== selectedSlidesItem.value.name && !!name) {
    const updatedAt = new Date().toISOString()
    const { error } = await client
      .from('slides')
      .update({ name, updated_at: updatedAt })
      .eq('uid', user.value!.id)
      .eq('id', selectedSlidesItem.value.id)
      .select()
    if (!error)
      emit('change', { name, updatedAt })
  }
})
async function exportAsImage() {
  try {
    // 获取要导出的 DOM 元素
    const element = document.getElementById((componentRef.value as any).renderId)

    if (!element) {
      toast({
        title: '导出失败',
        description: `未找到导出元素${(componentRef.value as any).renderId}`,
        variant: 'destructive',
      })
      return
    }

    const dataUrl = await toPng(element, { pixelRatio: 2, cacheBust: true })
    const link = document.createElement('a')
    link.download = `${selectedSlidesItemName.value}.png`
    link.href = dataUrl
    link.click()
  }
  catch (error) {
    console.error('Export failed:', error)
  }
}
async function deleteItem() {
  if (selectedSlidesItem.value?.id) {
    const { error } = await client
      .from('slides')
      .delete()
      .eq('uid', user.value!.id)
      .eq('id', selectedSlidesItem.value.id)
    if (!error) {
      toast({
        title: '删除成功',
        description: '删除成功',
      })
      // 刷新页面
      window.location.reload()
    }
    else {
      toast({
        title: '删除失败',
        description: error.message,
        variant: 'destructive',
      })
    }
  }
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="flex items-center p-2">
      <div class="flex items-center gap-2">
        <Input
          v-model="selectedSlidesItemName"
          class="border-none text-lg font-bold shadow-none outline-none ring-none focus-visible:ring-none"
        />
      </div>
      <div class="ml-auto flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="ghost" size="icon" :disabled="!selectedSlidesItem"
              @click="navigateTo(`/space/slides/${selectedSlidesItem?.id}`)"
            >
              <Icon name="lucide:edit" class="size-4" />
              <span class="sr-only">Edit</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>
      </div>
      <Separator orientation="vertical" class="mx-2 h-6" />
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="icon" :disabled="!selectedSlidesItem">
            <Icon name="lucide:more-vertical" class="size-4" />
            <span class="sr-only">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem class="flex cursor-pointer gap-2 focus:bg-accent" @click="exportAsImage">
            <Icon name="lucide:download" class="size-4" />DownLoad
          </DropdownMenuItem>
          <DropdownMenuItem class="flex cursor-pointer gap-2 focus:bg-red-5 focus:text-white" @click="deleteItem">
            <Icon name="lucide:trash-2" class="size-4" />Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <Separator />
    <div v-if="selectedSlidesItem" class="flex flex-1 flex-col">
      <CardRender
        v-if="selectedSlidesItem.type === 'card'" ref="componentRef"
        :slides-source="selectedSlidesItem?.contents[0]"
        :renderer-options="{ sfcComponents }"
      />
    </div>
    <div v-else class="p-8 text-center text-muted-foreground">
      No Content selected
    </div>
  </div>
</template>

<style>
/* body {
  line-height: initial !important;
}

img {
  @apply !inline-block;
} */
</style>
