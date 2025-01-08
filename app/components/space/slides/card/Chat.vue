<script lang="ts" setup>
import { ReloadIcon } from '@radix-icons/vue'

const emit = defineEmits<{
  changeSlidesItemContents: [index: number, data: string]
  changeTab: [value: string]
}>()
const question = ref('')
const { chat, done, renderData, code } = useCard()
watch(code, (value) => {
  if (value) {
    emit('changeTab', 'code')
    emit('changeSlidesItemContents', 0, value)
  }
})
watch(done, (newDone, oldDone) => {
  if (oldDone === false && newDone === true)
    emit('changeTab', 'render')
})
</script>

<template>
  <div class="h-full flex flex-col">
    <ScrollArea class="markdown-body flex-1 p-4 text-sm">
      <div v-html="renderData" />
    </ScrollArea>
    <Separator class="mt-auto" />
    <div class="p-4">
      <div class="flex items-end">
        <Textarea
          v-model="question"
          class="p-4"
          placeholder="请输入需要展示的信息和要求..."
        />
        <Button
          type="button"
          size="sm"
          class="ml-2"
          :disabled="!done"
          @click="chat(question)"
        >
          <ReloadIcon v-if="!done" class="mr-1 h-3 w-3 animate-spin" />
          生成
        </Button>
      </div>
    </div>
  </div>
</template>

<style>

</style>
