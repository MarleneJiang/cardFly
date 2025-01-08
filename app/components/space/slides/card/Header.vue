<script setup lang="ts">
import { ArrowLeftIcon, GearIcon, ReloadIcon } from '@radix-icons/vue'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useForm } from 'vee-validate'
import type { SlidesItem } from '../slides.type'
import type { Database } from '~~/types/supabase'

const props = defineProps<{
  slidesItem: SlidesItem | undefined
}>()
const emit = defineEmits<{
  changeSlidesItem: [data: SlidesItem]
}>()

const formSchema = toTypedSchema(z.object({
  name: z.string().min(2).max(50),
  description: z.string().min(0).max(200).optional().nullable(),
}))

const { isFieldDirty, handleSubmit } = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: props.slidesItem?.name,
    description: props.slidesItem?.description,
  },
  keepValuesOnUnmount: true,
})
const client = useSupabaseClient<Database>()
const user = useSupabaseUser()
const dialogState = ref(false)
const dialogSaveState = ref(false)
const onSubmit = handleSubmit(async (values) => {
  dialogSaveState.value = true
  if (props.slidesItem) {
    const updatedAt = new Date().toISOString()
    const { name, description } = values
    const changedSlidesItem = JSON.parse(JSON.stringify(props.slidesItem)) as SlidesItem
    if (name)
      changedSlidesItem.name = name
    if (description)
      changedSlidesItem.description = description
    changedSlidesItem.updated_at = updatedAt
    const { error } = await client
      .from('slides')
      .update(changedSlidesItem)
      .eq('uid', user.value!.id)
      .eq('id', props.slidesItem.id)
      .select()
    if (!error) {
      emit('changeSlidesItem', changedSlidesItem)
    }
    else {
      toast({
        title: '修改信息失败',
        description: error.message,
        variant: 'destructive',
      })
    }
  }
  dialogState.value = false
  dialogSaveState.value = false
})
const saveState = ref(false)
async function saveComponent() {
  saveState.value = true
  if (props.slidesItem) {
    const updatedAt = new Date().toISOString()

    const { error } = await client
      .from('slides')
      .update({ ...props.slidesItem, updated_at: updatedAt })
      .eq('uid', user.value!.id)
      .eq('id', props.slidesItem.id)
      .select()
    if (!error) {
      navigateTo('/space')
    }
    else {
      toast({
        title: '保存失败',
        description: error.message,
        variant: 'destructive',
      })
    }
  }
  saveState.value = false
}
</script>

<template>
  <header class="top-0 z-40 border-b border-border bg-background/80 backdrop-blur-lg">
    <div class="h-14 max-w-screen-2xl flex items-center container">
      <div class="mr-4 hidden md:mr-1 md:flex">
        <nav class="flex items-center text-sm font-medium space-x-2 max-lg:space-x-2">
          <Button class="h-9 w-9" variant="ghost" size="icon" @click="navigateTo('/space/comp')">
            <component
              :is="ArrowLeftIcon"
              class="h-6 w-6 text-foreground"
            />
          </Button>
          <div class="flex items-center">
            <div class="h-9 w-9 flex items-center justify-center">
              <div class="i-logos:slidev h-6 w-6" />
            </div>
            <div v-if="slidesItem" class="flex items-end gap-1">
              <div class="text-xl">
                {{ slidesItem.name }}
              </div>
              <Badge variant="outline">
                更新于{{ new Date(slidesItem.updated_at).toLocaleString('ch-zn', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
              </Badge>
            </div>
          </div>
        </nav>
      </div>
      <div class="flex flex-1 items-center justify-between md:justify-end space-x-2">
        <nav class="flex items-center gap-3">
          <Dialog v-model:open="dialogState">
            <DialogTrigger as-child>
              <Button class="h-9 w-9" variant="ghost" size="icon">
                <component
                  :is="GearIcon"
                  class="h-5 w-5 text-foreground"
                />
              </Button>
            </DialogTrigger>
            <DialogScrollContent class="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>修改卡片信息</DialogTitle>
                <DialogDescription>
                  保存后立即生效。
                </DialogDescription>
              </DialogHeader>

              <form id="dialogForm" class="flex flex-col gap-2" @submit.prevent="onSubmit">
                <FormField v-slot="{ componentField }" name="name" :validate-on-blur="!isFieldDirty">
                  <FormItem>
                    <FormLabel>名称</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="name" v-bind="componentField" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
                <FormField v-slot="{ componentField }" name="description" :validate-on-blur="!isFieldDirty">
                  <FormItem>
                    <FormLabel>
                      描述
                    </FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="description" v-bind="componentField" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </form>

              <DialogFooter>
                <Button type="submit" form="dialogForm" :disabled="dialogSaveState">
                  <ReloadIcon v-if="dialogSaveState" class="mr-2 h-4 w-4 animate-spin" />
                  保存
                </Button>
              </DialogFooter>
            </DialogScrollContent>
          </Dialog>
          <Button variant="default" :disabled="saveState" @click="saveComponent">
            <ReloadIcon v-if="saveState" class="mr-2 h-4 w-4 animate-spin" />
            保存
          </Button>
        </nav>
      </div>
    </div>
  </header>
</template>
