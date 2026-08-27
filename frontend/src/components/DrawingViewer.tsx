import type { Drawing, ReviewComment } from '../types/review'
import Marker from './Marker'

type DrawingViewerProps = {
  drawing: Drawing
  comments: ReviewComment[]
  selectedCommentId: number | null
  onSelectComment: (commentId: number) => void
}

function DrawingViewer({
  drawing,
  comments,
  selectedCommentId,
  onSelectComment,
}: DrawingViewerProps) {
  return (
    <figure className="drawing-viewer">
      <div className="drawing-viewer__canvas">
        <img src={drawing.image} alt={`${drawing.title} technical drawing`} />
        {comments.map((comment) => (
          <Marker
            comment={comment}
            isSelected={comment.id === selectedCommentId}
            onSelect={onSelectComment}
            key={comment.id}
          />
        ))}
      </div>
      <figcaption>
        Markers use percentage coordinates so they stay aligned as the drawing resizes.
      </figcaption>
    </figure>
  )
}

export default DrawingViewer

