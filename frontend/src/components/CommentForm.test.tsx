import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

import CommentForm from './CommentForm'

function renderForm(overrides: Partial<React.ComponentProps<typeof CommentForm>> = {}) {
  const props: React.ComponentProps<typeof CommentForm> = {
    markerNumber: 4,
    position: { x_position: 25.5, y_position: 75.25 },
    isSaving: false,
    saveError: null,
    onSave: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn(),
    ...overrides,
  }

  return { ...render(<CommentForm {...props} />), props }
}

describe('CommentForm', () => {
  it('focuses the title and reports required fields in a useful order', async () => {
    const user = userEvent.setup()
    const { props } = renderForm()

    expect(screen.getByLabelText('Title')).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Save comment' }))

    expect(screen.getByText('Enter a title.')).toBeVisible()
    expect(screen.getByText('Enter a description.')).toBeVisible()
    expect(screen.getByLabelText('Title')).toHaveFocus()
    expect(props.onSave).not.toHaveBeenCalled()
  })

  it('trims and submits valid comment content with its position', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    renderForm({ onSave })

    await user.type(screen.getByLabelText('Title'), '  Check clearance  ')
    await user.type(screen.getByLabelText('Description'), '  Verify before release.  ')
    await user.click(screen.getByRole('button', { name: 'Save comment' }))

    expect(onSave).toHaveBeenCalledWith({
      title: 'Check clearance',
      description: 'Verify before release.',
      x_position: 25.5,
      y_position: 75.25,
    })
  })

  it('cancels with Escape', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    renderForm({ onCancel })

    await user.click(screen.getByLabelText('Description'))
    await user.keyboard('{Escape}')

    expect(onCancel).toHaveBeenCalledOnce()
  })
})
