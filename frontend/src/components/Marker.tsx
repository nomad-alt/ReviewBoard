import type { ReviewComment } from '../types/review'

type MarkerProps = {
  comment: ReviewComment
  isSelected: boolean
  onSelect: (commentId: number) => void
}

function Marker({ comment, isSelected, onSelect }: MarkerProps) {
  return (
    <button
      className={`marker marker--${comment.status.toLowerCase()}${
        isSelected ? ' marker--selected' : ''
      }`}
      type="button"
      style={{
        left: `${comment.x_position}%`,
        top: `${comment.y_position}%`,
      }}
      aria-label={`Marker ${comment.marker_number}: ${comment.title}`}
      aria-pressed={isSelected}
      onClick={() => onSelect(comment.id)}
    >
      {comment.marker_number}
    </button>
  )
}

export default Marker
