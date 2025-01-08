<script setup lang="ts">
import type { Component, PropType } from 'vue'
import type { RendererOptions } from 'slidev-parser'
import { defineAsyncComponent, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { SlideError, UnoGenerator, compileCss, compileVue, evalJs, removeCss, updateDynamicCss } from 'slidev-parser'
import CompLoading from './CompLoading.vue'
import type { ComponentContent } from '@/components/space/components/components.type'

const props = defineProps({
  name: {
    type: String,
    default: `${Date.now()}`,
  },
  content: {
    type: Object as PropType<ComponentContent>,
  },
  zoom: {
    type: Number,
    default: 1,
  },
  rendererOptions: {
    type: Object as PropType<RendererOptions>,
    default: () => ({}),
  },
  attrs: {
    type: Object,
    default: () => ({}),
  },
})
const generator = ref<UnoGenerator>()

const renderedComp = shallowRef()

enum compStatus {
  Loading = 'loading',
  Loaded = 'loaded',
  Error = 'error',
}

const status = ref<compStatus>(compStatus.Loading)

async function updateComp() {
  try {
    // 校验是否为符合格式的url
    if (!props.content || !props.content.template)
      throw new Error('Invalid component content')

    status.value = compStatus.Loading
    const compContent = `<script setup>
${props?.content?.script}
<\/script>
<template>
${props?.content?.template}
<\/template>
<style>
${props?.content?.style}
<\/style>
`
    const vueObj = await compileVue(`${props.name}.vue`, compContent, props?.rendererOptions?.sfcOptions || {})
    if (generator.value && vueObj.css)
      updateDynamicCss(`${vueObj.css}\n${(await compileCss({ code: compContent, unoGenerator: generator.value }))?.output?.css}`, `${props.name}-css`)
    else if (vueObj.css)
      updateDynamicCss(vueObj.css, `${props.name}-css`)
    else if (generator.value)
      updateDynamicCss(`${(await compileCss({ code: compContent, unoGenerator: generator.value }))?.output?.css}`, `${props.name}-css`)

    renderedComp.value = getAsyncComponent(async () => (await evalJs(vueObj.js!, '')()), CompLoading, SlideError)
    status.value = compStatus.Loaded
  }
  catch (error) {
    console.error('更新Comp时出错:', error, props.content)
    status.value = compStatus.Error
  }
}
function getAsyncComponent(loader: () => Promise<any>, slideLoading: Component, slideError: Component) {
  return defineAsyncComponent({
    loader,
    delay: 300,
    loadingComponent: slideLoading,
    errorComponent: slideError,
    onError: e => console.error(`Failed to load Comp`, e),
  })
}
async function initUnoGenerator() {
  if (props?.rendererOptions?.unoConfig?.uno !== false) {
    generator.value = new UnoGenerator({
      customConfigRaw: props?.rendererOptions?.unoConfig?.customConfigRaw,
      customCSSLayerName: props?.rendererOptions?.unoConfig?.customCSSLayerName,
    })
    await generator.value.init()
  }
}
onMounted(async () => {
  await initUnoGenerator()
  updateComp()
})
watch(() => props.content, updateComp, { deep: true })
watch(() => props.rendererOptions, async () => {
  await initUnoGenerator()
  updateComp()
}, { deep: true })
onUnmounted(() => {
  removeCss(props.name)
})
</script>

<template>
  <ClientOnly>
    <div :class="cn('h-full w-full flex items-center justify-center relative', { 'bg-accent': !!props?.content?.template })">
      <div v-if="!!props?.content?.template">
        <template v-if="status === compStatus.Loading">
          <slot name="loading">
            <CompLoading />
          </slot>
        </template>
        <template v-else-if="status === compStatus.Error">
          <slot name="error">
            <SlideError />
          </slot>
        </template>
        <template v-else>
          <slot name="remote" :component="renderedComp">
            <component :is="renderedComp" v-bind="attrs">
              <template v-for="(slotContent, slotName) in $slots" #[slotName]="slotProps">
                <slot :name="slotName" v-bind="slotProps">
                  {{ slotContent(slotProps) }}
                </slot>
              </template>
            </component>
          </slot>
        </template>
      </div>
      <div v-else class="flex flex-col space-y-3">
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
