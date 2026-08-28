import type { MouseEvent } from 'react'

import type { CommentPosition, Drawing, ReviewComment } from '../types/review'
import Marker from './Marker'

type DrawingViewerProps = {
  drawing: Drawing
  comments: ReviewComment[]
  selectedCommentId: number | null
  onSelectComment: (commentId: number) => void
  draftPosition: CommentPosition | null
  draftMarkerNumber: number
  onPlaceDraft: (position: CommentPosition) => void
}

function DrawingViewer({
  drawing,
  comments,
  selectedCommentId,
  onSelectComment,
  draftPosition,
  draftMarkerNumber,
  onPlaceDraft,
}: DrawingViewerProps) {
  function handleCanvasClick(event: MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * 100
    const y = ((event.clientY - bounds.top) / bounds.height) * 100

    onPlaceDraft({
      x_position: Math.round(Math.min(100, Math.max(0, x)) * 100) / 100,
      y_position: Math.round(Math.min(100, Math.max(0, y)) * 100) / 100,
    })
  }

  return (
    <figure className="drawing-viewer">
      <div
        className="drawing-viewer__canvas drawing-viewer__canvas--commentable"
        onClick={handleCanvasClick}
      >
        <img src={drawing.image} alt={`${drawing.title} technical drawing`} />
        {comments.map((comment) => (
          <Marker
            comment={comment}
            isSelected={comment.id === selectedCommentId}
            onSelect={onSelectComment}
            key={comment.id}
          />
        ))}
        {draftPosition && (
          <span
            className="marker marker--draft"
            style={{
              left: `${draftPosition.x_position}%`,
              top: `${draftPosition.y_position}%`,
            }}
            aria-label={`Unsaved marker ${draftMarkerNumber}`}
            role="status"
          >
            {draftMarkerNumber}
          </span>
        )}
      </div>
      <figcaption>
        Click the drawing to place a comment marker. Coordinates stay aligned as the
        drawing resizes.
      </figcaption>
    </figure>
  )
}

export default DrawingViewer
