<script lang="ts" setup>
import Header from '@/components/space/components/Header.vue'
import type { Database } from '~~/types/supabase'
import type { Component } from '~/components/space/components/components.type'
import CompEdit from '~/components/space/components/CompEdit.vue'

definePageMeta({
  layout: 'edit',
})
const router = useRouter()

const client = useSupabaseClient<Database>()
const user = useSupabaseUser()
const { data } = await useAsyncData('component', async () => {
  const { data } = await client.from('components').select('*').eq('uid', user.value!.id).eq('id', router.currentRoute.value.params.id || '')
  return data![0] as unknown as Component
})
const component = ref<Component | undefined>(data.value)
async function changeComponent(data: Component | any) {
  const { content, name, description, labels } = data
  if (component.value && content && content !== component.value.content)
    component.value.content = content
  if (component.value && name && name !== component.value.name)
    component.value.name = name
  if (component.value && description && description !== component.value.description)
    component.value.description = description
  if (component.value && labels && labels !== component.value.labels)
    component.value.labels = labels
}
</script>

<template>
  <div class="h-screen flex flex-col">
    <Header :component-data="component" @change-component="changeComponent" />
    <CompEdit v-if="component" :component="component" @change-component="changeComponent" />
  </div>
</template>

<style>

</style>
