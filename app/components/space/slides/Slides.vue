<script lang="ts" setup>
import SlideList from './SlideList.vue'
import SlideDisplay from './SlideDisplay.vue'
import type { SlidesItem } from './slides.type'
import AddSlideDialog from './AddSlideDialog.vue'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import type { Database } from '~~/types/supabase'

const client = useSupabaseClient<Database>()
const user = useSupabaseUser()
const { data } = await useAsyncData('slides', async () => {
  const { data } = await client.from('slides').select('*').eq('uid', user.value!.id).order('updated_at', { ascending: false })
  return data as unknown as SlidesItem[]
})
const slidesList = ref<SlidesItem[]>(data.value || [])
const searchValue = ref('')
const debouncedSearch = refDebounced(searchValue, 250)

const filteredSlidesList = computed(() => {
  let output: any[] = []
  const searchValue = debouncedSearch.value?.trim()
  if (!searchValue) {
    output = slidesList.value || []
  }

  else {
    output = slidesList.value?.filter((item) => {
      return item.name.includes(debouncedSearch.value)
        || item.id.includes(debouncedSearch.value)
        || item.description?.includes(debouncedSearch.value)
    }) || []
  }

  return output
})

const cardList = computed(() => filteredSlidesList.value.filter(item => item.type === 'card'))
const slideList = computed(() => filteredSlidesList.value.filter(item => item.type === 'slides'))
const selectedSlidesItemId = ref<string | undefined>(cardList.value?.[0]?.id)
const selectedSlidesItem = computed(() => slidesList.value?.find((item: any) => item.id === selectedSlidesItemId.value))
function changeSelectedSlidesItem(data: { name: string, updatedAt: string }) {
  const { name, updatedAt } = data
  const selectedItem = selectedSlidesItem.value
  if (selectedItem && name && name !== selectedItem.name) {
    const item = slidesList.value?.find(item => item.id === selectedSlidesItemId.value)
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
        <Tabs default-value="card">
          <div class="flex items-center px-4 py-2">
            <h1 class="text-xl font-bold">
              资源库
            </h1>
            <TabsList class="ml-auto">
              <TabsTrigger value="card" class="text-zinc-600 dark:text-zinc-200">
                卡片
              </TabsTrigger>
              <TabsTrigger value="slides" class="text-zinc-600 dark:text-zinc-200">
                幻灯片
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
              <AddSlideDialog v-model:slidesList="slidesList" v-model:selectedSlidesItemId="selectedSlidesItemId" />
            </div>
          </div>
          <TabsContent value="card" class="m-0">
            <SlideList v-model:selectedSlideList="selectedSlidesItemId" :items="cardList" />
          </TabsContent>
          <TabsContent value="slides" class="m-0">
            <SlideList v-model:selectedSlideList="selectedSlidesItemId" :items="slideList" />
          </TabsContent>
        </Tabs>
      </ResizablePanel>
      <ResizableHandle id="resize-handle-2" with-handle />
      <ResizablePanel id="resize-panel-3" :default-size="75" :min-size="30">
        <SlideDisplay :selected-slides-item="selectedSlidesItem" @change="changeSelectedSlidesItem" />
      </ResizablePanel>
    </ResizablePanelGroup>
  </TooltipProvider>
</template>
