import { useEffect, useRef, useState, type FormEvent } from 'react'

import type { CreateReviewCommentInput } from '../types/review'

type CommentFormProps = {
  markerNumber: number
  position: Pick<CreateReviewCommentInput, 'x_position' | 'y_position'>
  isSaving: boolean
  saveError: string | null
  onSave: (comment: CreateReviewCommentInput) => Promise<void>
  onCancel: () => void
}

type FormErrors = {
  title?: string
  description?: string
}

function CommentForm({
  markerNumber,
  position,
  isSaving,
  saveError,
  onSave,
  onCancel,
}: CommentFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const titleRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    titleRef.current?.focus()
  }, [position.x_position, position.y_position])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors: FormErrors = {}
    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()

    if (!trimmedTitle) {
      nextErrors.title = 'Enter a title.'
    } else if (trimmedTitle.length > 200) {
      nextErrors.title = 'Use 200 characters or fewer.'
    }

    if (!trimmedDescription) {
      nextErrors.description = 'Enter a description.'
    }

    setErrors(nextErrors)

    if (nextErrors.title) {
      titleRef.current?.focus()
      return
    }

    if (nextErrors.description) {
      descriptionRef.current?.focus()
      return
    }

    await onSave({
      title: trimmedTitle,
      description: trimmedDescription,
      ...position,
    })
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit} noValidate>
      <div className="comment-form__heading">
        <div>
          <p className="eyebrow">New review note</p>
          <h2>Marker {markerNumber}</h2>
        </div>
        <span className="comment-form__coordinates">
          {position.x_position.toFixed(2)}%, {position.y_position.toFixed(2)}%
        </span>
      </div>

      <div className="form-field">
        <label htmlFor="comment-title">Title</label>
        <input
          ref={titleRef}
          id="comment-title"
          value={title}
          maxLength={200}
          disabled={isSaving}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? 'comment-title-error' : undefined}
          onChange={(event) => {
            setTitle(event.target.value)
            if (errors.title) setErrors((current) => ({ ...current, title: undefined }))
          }}
        />
        {errors.title && (
          <span className="form-field__error" id="comment-title-error">
            {errors.title}
          </span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="comment-description">Description</label>
        <textarea
          ref={descriptionRef}
          id="comment-description"
          value={description}
          rows={5}
          disabled={isSaving}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? 'comment-description-error' : undefined}
          onChange={(event) => {
            setDescription(event.target.value)
            if (errors.description) {
              setErrors((current) => ({ ...current, description: undefined }))
            }
          }}
        />
        {errors.description && (
          <span className="form-field__error" id="comment-description-error">
            {errors.description}
          </span>
        )}
      </div>

      {saveError && (
        <p className="comment-form__save-error" role="alert">
          {saveError}
        </p>
      )}

      <div className="comment-form__actions">
        <button className="button button--secondary" type="button" disabled={isSaving} onClick={onCancel}>
          Cancel
        </button>
        <button className="button button--primary" type="submit" disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Save comment'}
        </button>
      </div>
    </form>
  )
}

export default CommentForm
