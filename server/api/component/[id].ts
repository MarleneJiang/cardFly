import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { Database } from '~~/types/supabase'

export default eventHandler(async (event) => {
  const client = await serverSupabaseClient<Database>(event)
  const user = await serverSupabaseUser(event)
  const id = getRouterParam(event, 'id')
  // 设置成纯文本
  setResponseHeaders(event, {
    'Content-Type': 'text/plain',
  })
  if (!user)
    return 'Unauthorized'
  if (!id)
    return 'No id'
  const { data } = await client.from('components').select('content').eq('id', id).single()
  const code = data?.content as any
  const compContent = `<script setup>
${code?.script || ''}
<\/script>
<template>
${code?.template || ''}
<\/template>
<style>
${code?.style || ''}
<\/style>`
  return compContent
})
