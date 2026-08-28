import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'

import type { Drawing, ReviewComment } from '../types/review'
import DrawingReviewPage from './DrawingReviewPage'

const drawing: Drawing = {
  id: 7,
  title: 'Assembly drawing',
  image: '/drawing.svg',
  status: 'IN_REVIEW',
  open_comment_count: 1,
  created_at: '2026-08-28T08:00:00Z',
}

const existingComment: ReviewComment = {
  id: 12,
  drawing: 7,
  marker_number: 1,
  title: 'Existing issue',
  description: 'Check this first.',
  x_position: 20,
  y_position: 30,
  status: 'OPEN',
  created_at: '2026-08-28T08:00:00Z',
  updated_at: '2026-08-28T08:00:00Z',
}

const createdComment: ReviewComment = {
  ...existingComment,
  id: 13,
  marker_number: 2,
  title: 'New issue',
  description: 'Check the new issue.',
  x_position: 50,
  y_position: 50,
}

function jsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(data),
  } as unknown as Response
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/drawings/7']}>
      <Routes>
        <Route path="/drawings/:drawingId" element={<DrawingReviewPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('DrawingReviewPage', () => {
  it('saves a comment and updates the marker and comment list without reloading', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)

      if (url === '/api/drawings/7/' && !init?.method) return jsonResponse(drawing)
      if (url === '/api/drawings/7/comments/' && !init?.method) {
        return jsonResponse([existingComment])
      }
      if (url === '/api/drawings/7/comments/' && init?.method === 'POST') {
        return jsonResponse(createdComment, 201)
      }

      return jsonResponse({}, 404)
    })
    vi.stubGlobal('fetch', fetchMock)
    renderPage()

    await screen.findByRole('heading', { name: drawing.title })
    await user.click(screen.getByRole('button', { name: 'Add comment' }))
    await user.type(screen.getByLabelText('Title'), createdComment.title)
    await user.type(screen.getByLabelText('Description'), createdComment.description)
    await user.click(screen.getByRole('button', { name: 'Save comment' }))

    expect(await screen.findByRole('button', { name: 'Marker 2: New issue' })).toBeVisible()
    const newCommentButton = screen.getByRole('button', {
      name: /New issue\s*Open/,
    })
    await waitFor(() => expect(newCommentButton).toHaveFocus())
    expect(screen.getByText('2 markers')).toBeVisible()

    const postCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST')
    expect(postCall?.[0]).toBe('/api/drawings/7/comments/')
    expect(JSON.parse(String(postCall?.[1]?.body))).toEqual({
      title: createdComment.title,
      description: createdComment.description,
      x_position: 50,
      y_position: 50,
    })
  })
})
