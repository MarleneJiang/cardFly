<script setup lang="ts">
import { GithubLogoIcon } from '@radix-icons/vue'

const user = useSupabaseUser()
const { auth } = useSupabaseClient()

const redirectTo = `${useRuntimeConfig().public.baseUrl}/confirm`

watchEffect(() => {
  if (user.value)
    navigateTo('/space')
})
</script>

<template>
  <div :class="cn('grid gap-6', $attrs.class ?? '')">
    <Button variant="outline" @click="auth.signInWithOAuth({ provider: 'github', options: { redirectTo } })">
      <GithubLogoIcon class="mr-2 h-4 w-4" />
      Github
    </Button>
  </div>
</template>
