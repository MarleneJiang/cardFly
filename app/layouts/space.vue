<script lang="ts" setup>
import Nav, { type LinkProp } from '@/components/Nav.vue'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import type { Database } from '~~/types/supabase'

const router = useRouter()
const client = useSupabaseClient<Database>()
const user = useSupabaseUser()
const { data: navNum } = await useAsyncData('slidesAndCompsNum', async () => {
  const { data: slides } = await client.from('slides').select('id').eq('uid', user.value!.id)
  const { data: comps } = await client.from('components').select('id').eq('uid', user.value!.id)
  return { slides: slides?.length, comps: comps?.length }
})
const links: ComputedRef<LinkProp[]> = computed(() => [
  {
    title: '项目',
    label: `${navNum.value?.slides || 0}`,
    icon: 'lucide:inbox',
    variant: router.currentRoute.value.path === '/space' ? 'default' : 'ghost',
    // href: '/space',
    active: () => navigateTo({ path: '/space' }),
  },
  // {
  //   title: 'Drafts',
  //   label: '9',
  //   icon: 'lucide:file',
  //   variant: 'ghost',
  // },
  // {
  //   title: 'Sent',
  //   label: '',
  //   icon: 'lucide:send',
  //   variant: 'ghost',
  // },
  // {
  //   title: 'Junk',
  //   label: '23',
  //   icon: 'lucide:archive',
  //   variant: 'ghost',
  // },
  // {
  //   title: 'Trash',
  //   label: '',
  //   icon: 'lucide:trash',
  //   variant: 'ghost',
  // },
  {
    title: '组件库',
    label: `${navNum.value?.comps || 0}`,
    icon: 'lucide:archive',
    variant: router.currentRoute.value.path === '/space/comp' ? 'default' : 'ghost',
    active: () => navigateTo({ path: '/space/comp' }),
  },
])

// const links2: LinkProp[] = [
//   {
//     title: 'Social',
//     label: '972',
//     icon: 'lucide:user-2',
//     variant: 'ghost',
//   },
//   {
//     title: 'Updates',
//     label: '342',
//     icon: 'lucide:alert-circle',
//     variant: 'ghost',
//   },
//   {
//     title: 'Forums',
//     label: '128',
//     icon: 'lucide:message-square',
//     variant: 'ghost',
//   },
//   {
//     title: 'Shopping',
//     label: '8',
//     icon: 'lucide:shopping-cart',
//     variant: 'ghost',
//   },
//   {
//     title: 'Promotions',
//     label: '21',
//     icon: 'lucide:archive',
//     variant: 'ghost',
//   },
// ]
</script>

<template>
  <TooltipProvider :delay-duration="0">
    <ResizablePanelGroup
      id="resize-panel-group-1"
      direction="horizontal"
      state="collapsed"
      class="h-full max-h-screen min-h-screen items-stretch"
    >
      <ResizablePanel
        id="resize-panel-1"
        :default-size="4"
        :collapsed-size="4"
        :collapsible="false"
        :max-size="4"
        :min-size="4"
        :class="cn('min-w-[50px] transition-all duration-300 ease-in-out flex flex-col justify-between')"
      >
        <div>
          <div :class="cn('flex h-[52px] items-center justify-center')">
            C
          </div>
          <Separator />
          <Nav
            :is-collapsed="true"
            :links="links"
          />
          <!-- <Separator />
          <Nav
            :is-collapsed="true"
            :links="links2"
          /> -->
        </div>
        <div class="mb-5 flex items-center justify-center">
          <UserNav />
        </div>
      </ResizablePanel>
      <ResizableHandle id="resize-handle-1" />
      <ResizablePanel id="resize-panel-2" :default-size="96">
        <slot />
      </ResizablePanel>
    </ResizablePanelGroup>
  </TooltipProvider>
</template>
