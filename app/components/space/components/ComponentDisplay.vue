<script lang="ts" setup>
import type { Component } from './components.type'
import CompRender from '@/components/render/CompRender.vue'
import type { Database } from '~~/types/supabase'

const emit = defineEmits<{
  change: [data: object]
}>()
const client = useSupabaseClient<Database>()
const user = useSupabaseUser()
const selectedComponentsItem = defineModel<Component>('selectedComponentsItem', { required: false })
const selectedComponentsItemName = ref(selectedComponentsItem.value?.name || '')
watchDebounced(selectedComponentsItemName, async (name) => {
  if (selectedComponentsItem.value && name !== selectedComponentsItem.value.name && !!name) {
    const updatedAt = new Date().toISOString()
    const { error } = await client
      .from('components')
      .update({ name, updated_at: updatedAt })
      .eq('uid', user.value!.id)
      .eq('id', selectedComponentsItem.value.id)
      .select()
    if (!error)
      emit('change', { name, updatedAt })
  }
})
async function deleteItem() {
  if (selectedComponentsItem.value?.id) {
    const { error } = await client
      .from('components')
      .delete()
      .eq('uid', user.value!.id)
      .eq('id', selectedComponentsItem.value.id)
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
        <Input v-model="selectedComponentsItemName" class="border-none text-lg font-bold shadow-none outline-none ring-none focus-visible:ring-none" />
      </div>
      <div class="ml-auto flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="ghost" size="icon" :disabled="!selectedComponentsItem" @click="navigateTo(`/space/comp/${selectedComponentsItem?.id}`)">
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
          <Button variant="ghost" size="icon" :disabled="!selectedComponentsItem">
            <Icon name="lucide:more-vertical" class="size-4" />
            <span class="sr-only">More</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem class="flex cursor-pointer gap-2 focus:bg-red-5 focus:text-white" @click="deleteItem">
            <Icon name="lucide:trash-2" class="size-4" />Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <Separator />
    <div v-if="selectedComponentsItem" class="flex flex-1 flex-col">
      <CompRender :content="selectedComponentsItem?.content" :name="selectedComponentsItem?.name" :renderer-options="{ unoConfig: { uno: true } }" />
    </div>
    <div v-else class="p-8 text-center text-muted-foreground">
      No Content selected
    </div>
  </div>
</template>
