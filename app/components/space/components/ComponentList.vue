<script lang="ts" setup>
import { formatDistanceToNow } from 'date-fns'
import type { Component } from './components.type'

interface ComponentListListProps {
  items: Component[]
}

defineProps<ComponentListListProps>()
const selectedComponentList = defineModel<string>('selectedComponentList', { required: false })

function getBadgeVariantFromLabel(label: string) {
  if (['component'].includes(label.toLowerCase()))
    return 'default'

  if (['layout'].includes(label.toLowerCase()))
    return 'outline'

  return 'outline'
}
const labelMap = {
  card: '卡片',
  slides: '幻灯片',
  component: '组件',
  layout: '布局',
}
</script>

<template>
  <ScrollArea class="h-screen flex">
    <div class="flex flex-1 flex-col gap-2 p-4 pt-0">
      <TransitionGroup name="list" appear>
        <button
          v-for="item of items"
          :key="item.id"
          :class="cn(
            'flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent',
            selectedComponentList === item.id && 'bg-muted',
          )"
          @click="selectedComponentList = item.id"
        >
          <div class="w-full flex flex-col gap-1">
            <div class="flex items-center">
              <div class="flex items-center gap-2">
                <div class="font-semibold">
                  {{ item.name }}
                </div>
                <!-- <span v-if="item.type === 'card'" class="h-2 w-2 flex rounded-full bg-blue-600" /> -->
              </div>
              <div
                :class="cn(
                  'ml-auto text-xs',
                  selectedComponentList === item.id
                    ? 'text-foreground'
                    : 'text-muted-foreground',
                )"
              >
                <ClientOnly>
                  {{ formatDistanceToNow(new Date(item.updated_at), { addSuffix: true }) }}
                </ClientOnly>
              </div>
            </div>

            <!-- <div class="text-xs font-medium">
              Private:{{ item.contents }}
            </div> -->
          </div>
          <div class="line-clamp-2 text-xs text-muted-foreground">
            {{ item.description?.substring(0, 300) }}
          </div>
          <div class="flex items-center gap-2">
            <Badge v-for="label of item.labels" :key="label" :variant="getBadgeVariantFromLabel(label)">
              {{ labelMap[label as keyof typeof labelMap] }}
            </Badge>
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
