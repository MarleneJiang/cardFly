import { mdParser } from 'slidev-parser'

export default function () {
  const response = reactive({
    errMessage: '',
    answer: '',
    conversation_id: '',
    message_id: '',
    task_id: '',
    total_price: 0,
  } as any)
  const renderData = computed(() => {
    const html = mdParser.render(response.answer)
    // 将代码块转换为卡片显示
    return html.replace(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g, (_match, _codeContent) => {
      return ``
    })
  })

  const code = computed(() => {
    const answer = response.answer
    const codeBlocks: string[] = []
    let isInCodeBlock = false
    let currentBlock = ''

    const lines = answer.split('\n')

    for (const line of lines) {
      if (line.startsWith('```')) {
        if (isInCodeBlock) {
          // End of code block
          codeBlocks.push(currentBlock.trim())
          currentBlock = ''
          isInCodeBlock = false
        }
        else {
          // Start of code block
          isInCodeBlock = true
        }
        continue
      }

      if (isInCodeBlock)
        currentBlock += `${line}\n`
    }

    // Handle case where code block hasn't been closed
    if (isInCodeBlock && currentBlock)
      codeBlocks.push(currentBlock.trim())

    // 去除template标签，但保留里面的内容
    codeBlocks.forEach((block, index) => {
      codeBlocks[index] = block.replace(/<template[^>]*>/g, '').replace(/<\/template>/g, '').replace('min-h-screen', '')
    })
    // 去除<!-- -->注释,如果这个注释是单独一行的，比如前面有缩进空格之类的，那直接把这整行删除。
    codeBlocks.forEach((block, index) => {
      codeBlocks[index] = block.split('\n')
        .filter(line => !line.trim().match(/^\s*<!--.*-->$/))
        .filter(line => line.trim().length > 0)
        .join('\n')
    })
    // 返回最后一个代码块
    return codeBlocks[codeBlocks.length - 1]
  })
  const done = ref(true)

  const chat = async (question: string) => {
    done.value = false
    response.answer = ''
    response.errMessage = ''
    const res = await fetch('/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        inputs: {},
        query: question,
        response_mode: 'streaming',
        conversation_id: '',
      }),
    })
    if (!res.body)
      return

    const reader = res.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { done: doneReading, value } = await reader.read()
      if (doneReading)
        break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data.trim() === '[DONE]') {
            done.value = true
            return
          }
          const json = JSON.parse(data)
          if (json.event === 'workflow_started') {
            response.conversation_id = json.conversation_id
            response.message_id = json.message_id
            response.task_id = json.task_id
          }
          if (json.event === 'message_end')
            response.total_price = json.total_price

          if (json.event === 'message')
            response.answer += json.answer
        }
      }
    }
    done.value = true
  }

  return {
    response,
    chat,
    done,
    renderData,
    code,
  }
}
