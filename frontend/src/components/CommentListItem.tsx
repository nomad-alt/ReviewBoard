import type { ReviewComment } from '../types/review'

type CommentListItemProps = {
  comment: ReviewComment
  isSelected: boolean
  onSelect: (commentId: number) => void
}

function CommentListItem({ comment, isSelected, onSelect }: CommentListItemProps) {
  return (
    <li>
      <button
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

