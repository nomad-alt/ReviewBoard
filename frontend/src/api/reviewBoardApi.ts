import type {
  CreateReviewCommentInput,
  Drawing,
  ReviewComment,
} from '../types/review'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options)

  if (!response.ok) {
    throw new ApiError(`Request failed (${response.status}).`, response.status)
  }

  return response.json() as Promise<T>
}

export function getDrawings(signal?: AbortSignal): Promise<Drawing[]> {
  return requestJson<Drawing[]>('/api/drawings/', { signal })
}

export function getDrawing(id: number, signal?: AbortSignal): Promise<Drawing> {
  return requestJson<Drawing>(`/api/drawings/${id}/`, { signal })
}

export function getDrawingComments(
  drawingId: number,
  signal?: AbortSignal,
): Promise<ReviewComment[]> {
  return requestJson<ReviewComment[]>(`/api/drawings/${drawingId}/comments/`, {
    signal,
  })
}

export function createDrawingComment(
  drawingId: number,
  comment: CreateReviewCommentInput,
): Promise<ReviewComment> {
  return requestJson<ReviewComment>(`/api/drawings/${drawingId}/comments/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(comment),
  })
}
