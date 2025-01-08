import type { SlideSource } from 'slidev-parser'

export interface SlidesItem {
  created_at: string
  updated_at: string
  uid: string
  contents: SlideSource[] | any
  type: 'card' | 'slides'
  name: string
  id: string
  description?: string
  components?: any
  preview?: string
}
