<script setup lang="ts">
import { ArrowLeftIcon, GearIcon, ReloadIcon } from '@radix-icons/vue'
import { toTypedSchema } from '@vee-validate/zod'
import { h } from 'vue'
import * as z from 'zod'
import { useForm } from 'vee-validate'
import type { Database } from '~~/types/supabase'
import type { Component, ComponentLabels } from '~/components/space/components/components.type'

const props = defineProps<{
  componentData: Component | undefined
}>()
const emit = defineEmits<{
  changeComponent: [data: Component]
}>()
const labelOptions: { id: ComponentLabels, label: ComponentLabels }[] = [
  {
    id: 'card',
    label: 'card',
  },
  {
    id: 'slides',
    label: 'slides',
  },
  {
    id: 'component',
    label: 'component',
  },
  {
    id: 'layout',
    label: 'layout',
  },
] as { id: ComponentLabels, label: ComponentLabels }[]
const formSchema = toTypedSchema(z.object({
  name: z.string().min(2).max(50).regex(/^[a-zA-Z0-9]+$/, '只允许设置字母和数字'),
  description: z.string().min(0).max(200).optional().nullable(),
  labels: z.array(z.enum(labelOptions.map(option => option.id) as [ComponentLabels, ...ComponentLabels[]])),
  prompt: z.string().min(0).max(500).optional().nullable(),
}))

const { isFieldDirty, handleSubmit } = useForm({
  validationSchema: formSchema,
  initialValues: {
    name: props.componentData?.name,
    description: props.componentData?.description,
    prompt: props.componentData?.content.prompt,
    labels: props.componentData?.labels?.length ? props.componentData?.labels : ['component'],
  },
  keepValuesOnUnmount: true,
})
const client = useSupabaseClient<Database>()
const user = useSupabaseUser()
const dialogState = ref(false)
const dialogSaveState = ref(false)
const onSubmit = handleSubmit(async (values) => {
  dialogSaveState.value = true
  if (props.componentData) {
    const updatedAt = new Date().toISOString()
    const { name, description, labels, prompt } = values
    const changedData = JSON.parse(JSON.stringify(props.componentData)) as Component
    if (name)
      changedData.name = name
    if (description)
      changedData.description = description
    if (labels)
      changedData.labels = labels
    if (prompt)
      changedData.content.prompt = prompt
    changedData.updated_at = updatedAt
    const { error } = await client
      .from('components')
      .update(changedData)
      .eq('uid', user.value!.id)
      .eq('id', props.componentData.id)
      .select()
    if (!error) {
      emit('changeComponent', changedData)
      // toast({
      //   title: '修改信息成功',
      //   description: new Date(updatedAt).toLocaleString('ch-zn', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      // })
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
  if (props.componentData) {
    const updatedAt = new Date().toISOString()

    const { error } = await client
      .from('components')
      .update({ ...props.componentData, updated_at: updatedAt })
      .eq('uid', user.value!.id)
      .eq('id', props.componentData.id)
      .select()
    if (!error) {
      navigateTo('/space/comp')
    }
    else {
      toast({
        title: '发布失败',
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
              <div class="i-logos:apple-app-store h-6 w-6" />
            </div>
            <div v-if="componentData" class="flex items-end gap-1">
              <div class="text-xl">
                {{ componentData.name }}
              </div>
              <Badge variant="outline">
                更新于{{ new Date(componentData.updated_at).toLocaleString('ch-zn', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
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
                <DialogTitle>修改组件信息</DialogTitle>
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
                <div class="mt-1">
                  <div class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    使用场景
                  </div>
                  <div class="mt-3 flex">
                    <FormField v-for="item in labelOptions" v-slot="{ value, handleChange }" :key="item.id" type="checkbox" :value="item.id" :unchecked-value="false" name="labels">
                      <FormItem class="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            :checked="value.includes(item.id)"
                            class="sr-only"
                            @update:checked="handleChange"
                          />
                        </FormControl>
                        <FormLabel :class="cn('font-normal')">
                          <Badge :variant="value.includes(item.id) ? 'default' : 'outline'" class="cursor-pointer px-3 py-2 text-[0.9rem]">
                            {{ item.label }}
                          </Badge>
                        </FormLabel>
                      </FormItem>
                    </FormField>
                  </div>
                </div>
                <FormField v-slot="{ componentField }" name="prompt" :validate-on-blur="!isFieldDirty">
                  <FormItem>
                    <FormLabel>
                      提示词
                    </FormLabel>
                    <FormControl>
                      <Textarea type="text" placeholder="prompt" v-bind="componentField" />
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
            发布
          </Button>
        </nav>
      </div>
    </div>
  </header>
</template>
