<script setup lang="ts">
definePageMeta({
  layout: 'blank',
})
const user = useSupabaseUser()

watch(user, () => {
  if (user.value)
    return navigateTo('/space')
}, { immediate: true })
</script>

<template>
  <div class="h-screen w-full flex items-center justify-center">
    <LoadingCircle dimensions="h-6 w-6" />
  </div>
</template>
