import type { Drawing, ReviewComment } from '../types/review'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal })

  if (!response.ok) {
    throw new ApiError(`Request failed (${response.status}).`, response.status)
  }

  return response.json() as Promise<T>
}

export function getDrawings(signal?: AbortSignal): Promise<Drawing[]> {
  return getJson<Drawing[]>('/api/drawings/', signal)
}

export function getDrawing(id: number, signal?: AbortSignal): Promise<Drawing> {
  return getJson<Drawing>(`/api/drawings/${id}/`, signal)
}

export function getDrawingComments(
  drawingId: number,
  signal?: AbortSignal,
): Promise<ReviewComment[]> {
  return getJson<ReviewComment[]>(`/api/drawings/${drawingId}/comments/`, signal)
}

