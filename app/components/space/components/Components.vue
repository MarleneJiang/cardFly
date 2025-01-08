<script lang="ts" setup>
import ComponentList from './ComponentList.vue'
import ComponentDisplay from './ComponentDisplay.vue'
import type { Component } from './components.type'
import AddCompDialog from './AddCompDialog.vue'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import type { Database } from '~~/types/supabase'

const client = useSupabaseClient<Database>()
const user = useSupabaseUser()
const { data } = await useAsyncData('components', async () => {
  const { data } = await client.from('components').select('*').eq('uid', user.value!.id).order('updated_at', { ascending: false })
  return data as unknown as Component[]
})
const componentsList = ref<Component[]>(data.value || [])
const searchValue = ref('')
const debouncedSearch = refDebounced(searchValue, 250)

const filteredComponentsList = computed(() => {
  let output: any[] = []
  const searchValue = debouncedSearch.value?.trim()
  if (!searchValue) {
    output = componentsList.value || []
  }

  else {
    output = componentsList.value?.filter((item) => {
      return item.name.includes(debouncedSearch.value)
        || item.id.includes(debouncedSearch.value)
        || item.description?.includes(debouncedSearch.value)
        || JSON.stringify(item?.labels || [])?.includes(debouncedSearch.value)
    }) || []
  }

  return output
})

const layoutComponentsList = computed(() => filteredComponentsList.value.filter(item => item.labels?.includes('layout')))

const selectedComponentsItemId = ref<string | undefined>(filteredComponentsList.value?.[0]?.id)
const selectedComponentsItem = computed(() => componentsList.value?.find((item: any) => item.id === selectedComponentsItemId.value))
function changeSelectedComponentsItem(data: any) {
  const { name, updatedAt } = data
  const selectedItem = selectedComponentsItem.value
  if (selectedItem && name && name !== selectedItem.name) {
    const item = componentsList.value?.find(item => item.id === selectedComponentsItemId.value)
    if (item) {
      item.name = name
      item.updated_at = updatedAt
    }
  }
}
</script>

<template>
  <TooltipProvider :delay-duration="0">
    <ResizablePanelGroup
      id="resize-panel-group-1"
      direction="horizontal"
      class="h-full max-h-screen min-h-screen items-stretch"
    >
      <ResizablePanel id="resize-panel-2" :default-size="25" :min-size="25">
        <Tabs default-value="all">
          <div class="flex items-center px-4 py-2">
            <h1 class="text-xl font-bold">
              组件库
            </h1>
            <TabsList class="ml-auto">
              <TabsTrigger value="all" class="text-zinc-600 dark:text-zinc-200">
                全部
              </TabsTrigger>
              <TabsTrigger value="layout" class="text-zinc-600 dark:text-zinc-200">
                布局
              </TabsTrigger>
            </TabsList>
          </div>
          <Separator />
          <div class="flex items-center justify-between p-4">
            <div class="flex-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form>
                <div class="relative">
                  <Icon name="lucide:search" class="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                  <Input v-model="searchValue" placeholder="Search" class="pl-8" />
                </div>
              </form>
            </div>
            <div class="ml-2">
              <AddCompDialog v-model:componentsList="componentsList" v-model:selectedComponentsItemId="selectedComponentsItemId" />
            </div>
          </div>
          <TabsContent value="all" class="m-0">
            <ComponentList v-model:selectedComponentList="selectedComponentsItemId" :items="filteredComponentsList" />
          </TabsContent>
          <TabsContent value="layout" class="m-0">
            <ComponentList v-model:selectedComponentList="selectedComponentsItemId" :items="layoutComponentsList" />
          </TabsContent>
        </Tabs>
      </ResizablePanel>
      <ResizableHandle id="resize-handle-2" with-handle />
      <ResizablePanel id="resize-panel-3" :default-size="75" :min-size="30">
        <ComponentDisplay :selected-components-item="selectedComponentsItem" @change="changeSelectedComponentsItem" />
      </ResizablePanel>
    </ResizablePanelGroup>
  </TooltipProvider>
</template>
