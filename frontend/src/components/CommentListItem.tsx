import { useEffect, useRef } from 'react'

import type { ReviewComment } from '../types/review'

type CommentListItemProps = {
  comment: ReviewComment
  isSelected: boolean
  onSelect: (commentId: number) => void
  shouldFocus?: boolean
  onFocused?: () => void
}

function CommentListItem({
  comment,
  isSelected,
  onSelect,
  shouldFocus = false,
  onFocused,
}: CommentListItemProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!shouldFocus) return

    buttonRef.current?.focus()
    onFocused?.()
  }, [onFocused, shouldFocus])

  return (
    <li>
      <button
        ref={buttonRef}
        className={`comment-list-item${isSelected ? ' comment-list-item--selected' : ''}`}
        type="button"
        aria-pressed={isSelected}
        onClick={() => onSelect(comment.id)}
      >
        <span className="comment-list-item__marker" aria-hidden="true">
          {comment.marker_number}
        </span>
        <span className="comment-list-item__content">
          <span className="comment-list-item__title">{comment.title}</span>
          <span
            className={`comment-status comment-status--${comment.status.toLowerCase()}`}
          >
            {comment.status === 'OPEN' ? 'Open' : 'Resolved'}
          </span>
        </span>
      </button>
    </li>
  )
}

export default CommentListItem
