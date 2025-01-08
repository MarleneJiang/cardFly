<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { ReloadIcon } from '@radix-icons/vue'
import * as z from 'zod'
import { useForm } from 'vee-validate'
import type { SlidesItem } from './slides.type'
import type { Database } from '~~/types/supabase'

const dialogState = ref(false)
const dialogSaveState = ref(false)
const slidesList = defineModel<SlidesItem[]>('slidesList', { required: true })
const selectedSlidesItemId = defineModel<string | undefined>('selectedSlidesItemId', { required: true })
const typeOptions: { id: SlidesItem['type'], label: SlidesItem['type'] }[] = [
  {
    id: 'card',
    label: 'card',
  },
  {
    id: 'slides',
    label: 'slides',
  },

] as { id: SlidesItem['type'], label: SlidesItem['type'] }[]
const formSchema = toTypedSchema(z.object({
  name: z.string().min(2).max(50),
  description: z.string().min(0).max(200).optional().nullable(),
  type: z.string().refine(val => typeOptions.some(option => option.id === val), {
    message: 'Invalid type',
  }),
}))

const { isFieldDirty, handleSubmit } = useForm({
  validationSchema: formSchema,
  initialValues: {
    type: 'card',
  },
  keepValuesOnUnmount: true,
})
const client = useSupabaseClient<Database>()
const user = useSupabaseUser()
const onSubmit = handleSubmit(async (values) => {
  dialogSaveState.value = true
  const updatedAt = new Date().toISOString()
  const { name, description, type } = values
  const newSlideData = {
    name,
    description,
    type: type as SlidesItem['type'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    uid: user.value!.id,
    contents: [{ content: '' }],
  }

  const { data, error } = await client
    .from('slides')
    .insert([newSlideData])
    .select()
  if (!error && data[0]) {
    slidesList.value = [data[0] as any, ...slidesList.value]
    selectedSlidesItemId.value = data[0].id
    toast({
      title: '新增Slide成功',
      description: new Date(updatedAt).toLocaleString('ch-zn', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    })
  }
  else {
    toast({
      title: '新增Slide失败',
      description: error?.message,
      variant: 'destructive',
    })
  }
  dialogState.value = false
  dialogSaveState.value = false
})
</script>

<template>
  <Dialog v-model:open="dialogState">
    <DialogTrigger as-child>
      <Button class="h-9 w-9 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" variant="ghost" size="icon">
        <div
          class="i-mdi:plus-circle-outline h-5 w-5 text-muted-foreground"
        />
      </Button>
    </DialogTrigger>
    <DialogScrollContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>新增Slide</DialogTitle>
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
            类型
          </div>
          <div class="mt-3 flex">
            <FormField v-for="item in typeOptions" v-slot="{ value, handleChange }" :key="item.id" type="checkbox" :value="item.id" :unchecked-value="false" name="type">
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
      </form>

      <DialogFooter>
        <Button type="submit" form="dialogForm" :disabled="dialogSaveState">
          <ReloadIcon v-if="dialogSaveState" class="mr-2 h-4 w-4 animate-spin" />
          新增
        </Button>
      </DialogFooter>
    </DialogScrollContent>
  </Dialog>
</template>

<style>

</style>
