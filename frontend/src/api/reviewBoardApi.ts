import type { Drawing } from '../types/review'

export async function getDrawings(signal?: AbortSignal): Promise<Drawing[]> {
  const response = await fetch('/api/drawings/', { signal })

  if (!response.ok) {
    throw new Error(`Could not load drawings (${response.status}).`)
  }

  return response.json() as Promise<Drawing[]>
}

