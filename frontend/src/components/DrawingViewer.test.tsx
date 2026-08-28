import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import type { Drawing, ReviewComment } from '../types/review'
import DrawingViewer from './DrawingViewer'

const drawing: Drawing = {
  id: 7,
  title: 'Assembly drawing',
  image: '/drawing.svg',
  status: 'IN_REVIEW',
  open_comment_count: 1,
  created_at: '2026-08-28T08:00:00Z',
}

const comment: ReviewComment = {
  id: 12,
  drawing: 7,
  marker_number: 1,
  title: 'Check diameter',
  description: 'Confirm the dimension.',
  x_position: 20,
  y_position: 30,
  status: 'OPEN',
  created_at: '2026-08-28T08:00:00Z',
  updated_at: '2026-08-28T08:00:00Z',
}

function renderViewer(overrides: Partial<React.ComponentProps<typeof DrawingViewer>> = {}) {
  const props: React.ComponentProps<typeof DrawingViewer> = {
    drawing,
    comments: [comment],
    selectedCommentId: comment.id,
    onSelectComment: vi.fn(),
    draftPosition: null,
    draftMarkerNumber: 2,
    onPlaceDraft: vi.fn(),
    ...overrides,
  }

  return { ...render(<DrawingViewer {...props} />), props }
}

describe('DrawingViewer', () => {
  it('converts a canvas click into clamped percentage coordinates', () => {
    const onPlaceDraft = vi.fn()
    const { container } = renderViewer({ onPlaceDraft })
    const canvas = container.querySelector('.drawing-viewer__canvas')

    expect(canvas).not.toBeNull()
    vi.spyOn(canvas as HTMLDivElement, 'getBoundingClientRect').mockReturnValue({
      left: 10,
      top: 20,
      width: 200,
      height: 100,
      right: 210,
      bottom: 120,
      x: 10,
      y: 20,
      toJSON: () => ({}),
    })

    fireEvent.click(canvas as HTMLDivElement, { clientX: 110, clientY: 45 })

    expect(onPlaceDraft).toHaveBeenCalledWith({
      x_position: 50,
      y_position: 25,
    })
  })

  it('selects an existing marker without placing a new draft', async () => {
    const onSelectComment = vi.fn()
    const onPlaceDraft = vi.fn()
    renderViewer({ onSelectComment, onPlaceDraft })

    fireEvent.click(screen.getByRole('button', { name: 'Marker 1: Check diameter' }))

    expect(onSelectComment).toHaveBeenCalledWith(comment.id)
    expect(onPlaceDraft).not.toHaveBeenCalled()
  })
})
