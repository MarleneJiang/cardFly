<script lang="ts" setup>
import type { SlidesItem } from '../slides.type'
import type { Component } from '@/components/space/components/components.type'
import type { Database } from '~~/types/supabase'

interface ComponentWithStatus extends Component {
  status?: string
}
const props = defineProps<{
  slidesItemComponents: SlidesItem['components'] | undefined
}>()
const emit = defineEmits<{
  changeSlidesItemComponents: [components: Component[]]
}>()
const client = useSupabaseClient<Database>()
const user = useSupabaseUser()
const { data } = await useAsyncData('components', async () => {
  const { data } = await client.from('components').select('*').eq('uid', user.value!.id).contains('labels', ['component']).order('updated_at', { ascending: false })
  return data as unknown as Component[]
})
const componentsList = ref<ComponentWithStatus[]>((data.value || []).map(item => ({ ...item, status: '使用' })))
watch(props.slidesItemComponents, () => {
  // 增加一个字段，用于标识该组件是否在slidesItemComponents中使用/是否需要更新。
  // 可以根据id去判断，同时根据updated_at来显示是否需要更新
  props.slidesItemComponents?.forEach((item) => {
    const componentIndex = componentsList.value.findIndex(c => c.id === item.id)
    if (componentIndex !== -1 && componentsList.value[componentIndex]) {
      if (componentsList.value[componentIndex].updated_at !== item.updated_at)
        componentsList.value[componentIndex].status = '更新'
      else
        componentsList.value[componentIndex].status = '删除'
    }
  })
}, {
  immediate: true,
})
function changeStatus(id) {
  const listedComponent = componentsList.value.find(c => c.id === id)
  const components = props.slidesItemComponents || []
  switch (listedComponent?.status) {
    case '使用':
    { components.push({ ...listedComponent, status: undefined })
      emit('changeSlidesItemComponents', components)
      toast({
        title: '添加组件',
        description: '组件已添加',
        variant: 'default',
      })
      break }
    case '删除':
    { listedComponent.status = '使用'
      const index = components.findIndex(c => c.id === id)
      if (index !== -1) {
        components.splice(index, 1)
        emit('changeSlidesItemComponents', components)
        toast({
          title: '删除组件',
          description: '组件已删除',
          variant: 'destructive',
        })
      }
      break }
    case '更新':
    { listedComponent.status = '删除'
      const index = components.findIndex(c => c.id === id)
      if (index !== -1) {
        components[index] = { ...listedComponent, status: undefined }
        emit('changeSlidesItemComponents', components)
        toast({
          title: '更新组件',
          description: '组件已更新',
          variant: 'default',
        })
      }
      break
    }
  }
}
</script>

<template>
  <ScrollArea class="h-screen flex">
    <div class="flex flex-1 flex-col gap-2 p-2 pt-0">
      <TransitionGroup name="list" appear>
        <button
          v-for="item of componentsList"
          :key="item.id"
          :class="cn(
            'flex flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left transition-all hover:bg-accent',
          )"
        >
          <div class="w-full flex flex-col gap-1">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="text-[1rem] font-semibold">
                  {{ item.name }}
                </div>
                <!-- <span v-if="item.type === 'card'" class="h-2 w-2 flex rounded-full bg-blue-600" /> -->
              </div>
              <Button variant="default" size="xs" class="text-xs" @click="changeStatus(item.id)">
                {{ item.status }}
              </Button>
            </div>

            <!-- <div class="text-xs font-medium">
              Private:{{ item.contents }}
            </div> -->
          </div>
          <div class="line-clamp-2 text-xs text-muted-foreground">
            {{ item.description?.substring(0, 300) || '暂无描述' }}
          </div>
        </button>
      </TransitionGroup>
    </div>
  </ScrollArea>
</template>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(15px);
}

.list-leave-active {
  position: absolute;
}
</style>
