export interface Component {
  id: string
  created_at: string
  updated_at: string
  name: string
  description?: string
  content: ComponentContent
  preview?: string
  uid: string
  labels?: ComponentLabels[]
}

export type ComponentLabels = 'card' | 'slides' | 'component' | 'layout'

export interface ComponentContent {
  script?: string
  style?: string
  template: string
  example?: string
  prompt?: string
  [key: string]: any
}
