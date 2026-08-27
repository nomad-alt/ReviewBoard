export type DrawingStatus = 'NOT_STARTED' | 'IN_REVIEW' | 'COMPLETED'

export type Drawing = {
  id: number
  title: string
  image: string
  status: DrawingStatus
  open_comment_count: number
  created_at: string
}

