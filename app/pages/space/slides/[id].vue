<script lang="ts" setup>
import type { Database } from '~~/types/supabase'
import type { SlidesItem } from '~/components/space/slides/slides.type'
import CardHeader from '@/components/space/slides/card/Header.vue'
import CardEdit from '@/components/space/slides/card/Edit.vue'

definePageMeta({
  layout: 'edit',
})
const router = useRouter()

const client = useSupabaseClient<Database>()
const user = useSupabaseUser()
const { data } = await useAsyncData('slide', async () => {
  const { data } = await client.from('slides').select('*').eq('uid', user.value!.id).eq('id', router.currentRoute.value.params.id || '')
  return data![0] as unknown as SlidesItem
})
const slidesItem = ref<SlidesItem | undefined>(data.value)
function changeSlidesItem(data: SlidesItem | any) {
  const { contents, name, description, components } = data
  if (slidesItem.value && contents && contents !== slidesItem.value.contents)
    slidesItem.value.contents = contents
  if (slidesItem.value && name && name !== slidesItem.value.name)
    slidesItem.value.name = name
  if (slidesItem.value && description && description !== slidesItem.value.description)
    slidesItem.value.description = description
  if (slidesItem.value && components)
    slidesItem.value.components = components
}
</script>

<template>
  <div class="h-screen flex flex-col">
    <CardHeader v-if="slidesItem && slidesItem.type === 'card'" :slides-item="data" @change-slides-item="changeSlidesItem" />
    <CardEdit v-if="slidesItem && slidesItem.type === 'card'" :slides-item="slidesItem" @change-slides-item="changeSlidesItem" />
  </div>
</template>

<style>

</style>
