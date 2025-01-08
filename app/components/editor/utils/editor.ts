import { Fragment, type Node } from '@tiptap/pm/model'
import type { Editor as EditorInstance } from '@tiptap/core'

export function isValidUrl(url: string) {
  try {
    // eslint-disable-next-line no-new
    new URL(url)
    return true
  }
  catch (_e) {
    return false
  }
}

export function getUrlFromString(str: string) {
  if (isValidUrl(str))
    return str
  try {
    if (str.includes('.') && !str.includes(' '))
      return new URL(`https://${str}`).toString()
  }
  catch (_e) {
    return null
  }
}

// Get the text before a given position in markdown format
export function getPrevText(editor: EditorInstance, position: number) {
  const nodes: Node[] = []
  editor.state.doc.forEach((node, pos) => {
    if (pos >= position)
      return false
    nodes.push(node)
    return true
  })
  const fragment = Fragment.fromArray(nodes)
  const doc = editor.state.doc.copy(fragment)

  return editor.storage.markdown.serializer.serialize(doc) as string
}

export function getPrevNumText(editor: EditorInstance, {
  chars,
  offset = 0,
}: {
  chars: number
  offset?: number
}) {
  // for now, we're using textBetween for now until we can figure out a way to stream markdown text
  // with proper formatting: https://github.com/steven-tey/novel/discussions/7
  return editor.state.doc.textBetween(
    Math.max(0, editor.state.selection.from - chars),
    editor.state.selection.from - offset,
    '\n',
  )
}

// Get all content from the editor in markdown format
export function getAllContent(editor: EditorInstance) {
  const fragment = editor.state.doc.content
  const doc = editor.state.doc.copy(fragment)

  return editor.storage.markdown.serializer.serialize(doc) as string
}
