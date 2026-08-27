export type DrawingStatus = 'NOT_STARTED' | 'IN_REVIEW' | 'COMPLETED'

export type Drawing = {
  id: number
  title: string
  image: string
  status: DrawingStatus
  open_comment_count: number
  created_at: string
}

export type ReviewCommentStatus = 'OPEN' | 'RESOLVED'

export type ReviewComment = {
  id: number
  drawing: number
  marker_number: number
  title: string
  description: string
  x_position: number
  y_position: number
  status: ReviewCommentStatus
  created_at: string
  updated_at: string
}
