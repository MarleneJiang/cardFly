<script lang="ts" setup>
import type { RendererOptions, SlideSource } from 'slidev-parser'
import { SlideRender } from 'slidev-parser'
import { useParallax } from '@vueuse/core'
import CompLoading from './CompLoading.vue'
import 'slidev-parser/index.css'

withDefaults(defineProps<{
  slidesSource: SlideSource | Record<string, any>
  rendererOptions?: RendererOptions
}>(), {
  slidesSource: () => ({
    frontmatter: {
      layout: 'default',
    },
    content: `# slidev-parser{.text-blue-500}\n\nSupport \`MDC\`{.font-bold .text-xl},\`UnoCSS\`{.font-bold .text-xl} Syntax.{.mt-5}\n\nCompiled in the **browser**\n\n<div i-logos-vue inline-block text-4xl mr-4/><div i-logos-unocss inline-block text-4xl mr-4/><div i-logos-chrome inline-block text-4xl/><remote url="https://gist.githubusercontent.com/MarleneJiang/b205007f50abcbc404f07127439c686a/raw/05414d8f57cf7d0af626200f73feb19d01d79619/test.vue"/>\n`,
    note: '',
  }),
  rendererOptions: () => ({
  }),
})
const renderId = `card-render-${Math.random().toString(36).substr(2, 9)}`
defineExpose({
  renderId,
})
const cardRender = ref(null)
const parallax = reactive(useParallax(cardRender))
const cardStyle = computed(() => ({
  background: '#fff',
  overflow: 'hidden',
  transition: '.3s ease-out all',
  boxShadow: '0 0 20px 0 rgba(255, 255, 255, 0.25)',
  transform: `rotateX(${parallax.roll * 20}deg) rotateY(${
    parallax.tilt * 20
  }deg)`,
}))
</script>

<template>
  <ClientOnly>
    <div ref="cardRender" :class="cn('h-full w-full flex items-center justify-center relative', { 'bg-accent': !!slidesSource.content })">
      <SlideRender
        v-if="slidesSource.content"
        :id="renderId"
        :style="cardStyle"
        :slide="slidesSource"
        :renderer-options="rendererOptions"
      >
        <template #loading>
          <CompLoading />
        </template>
      </SlideRender>
      <div v-else class="flex flex-col space-y-3" :style="cardStyle">
        <Skeleton class="h-[125px] w-[250px] rounded-xl" />
        <div class="space-y-2">
          <Skeleton class="h-4 w-[250px]" />
          <Skeleton class="h-4 w-[200px]" />
        </div>
      </div>
    </div>
    <template #fallback>
      <CompLoading />
    </template>
  </ClientOnly>
</template>

<style>

</style>
