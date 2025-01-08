<script setup lang="ts">
import 'iconify-icon'

defineProps<{
  name: string
}>()
</script>

<template>
  <iconify-icon :icon="name" height="unset" />
</template>

<style lang="scss">
iconify-icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  font-size: 1.2em;
  vertical-align: -0.195em;
}
</style>
