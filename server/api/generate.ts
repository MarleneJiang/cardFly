import type { H3Event } from 'h3'
import { createError, sendStream } from 'h3'
import { serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig()
  const user = await serverSupabaseUser(event)
  try {
    // 获取POST请求体
    const body = JSON.parse(await readBody(event))
    // 调用Dify API
    const response = await fetch('https://api.dify.ai/v1/chat-messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.DIFY_API_KEY}`,
      },
      body: JSON.stringify({ ...body, user: user?.id }),
    })

    if (!response.body) {
      throw createError({
        statusCode: response.status,
        message: 'Failed to fetch from Dify API',
      })
    }

    // 设置SSE头部
    setHeaders(event, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })

    // 转发流式响应
    return sendStream(event, response.body!)
  }
  catch (error: any) {
    throw createError({
      statusCode: 500,
      message: error.message,
    })
  }
})
