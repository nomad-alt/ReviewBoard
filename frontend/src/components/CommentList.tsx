import type { ReviewComment } from '../types/review'
import CommentListItem from './CommentListItem'

type CommentListProps = {
  comments: ReviewComment[]
  selectedCommentId: number | null
  onSelectComment: (commentId: number) => void
  commentToFocus?: number | null
  onCommentFocused?: () => void
}

function CommentList({
  comments,
  selectedCommentId,
  onSelectComment,
  commentToFocus = null,
  onCommentFocused,
}: CommentListProps) {
  const selectedComment =
    comments.find((comment) => comment.id === selectedCommentId) ?? null

  return (
    <aside className="comment-sidebar" aria-labelledby="comments-heading">
      <div className="comment-sidebar__header">
        <div>
          <p className="eyebrow">Review notes</p>
          <h2 id="comments-heading">Comments</h2>
        </div>
        <span className="comment-sidebar__count">{comments.length}</span>
      </div>

      {comments.length === 0 ? (
        <div className="comment-sidebar__empty">
          <p>No review comments have been added to this drawing.</p>
        </div>
      ) : (
        <>
          <ol className="comment-list">
            {comments.map((comment) => (
              <CommentListItem
                comment={comment}
                isSelected={comment.id === selectedCommentId}
                onSelect={onSelectComment}
                shouldFocus={comment.id === commentToFocus}
                onFocused={onCommentFocused}
                key={comment.id}
              />
            ))}
          </ol>

          {selectedComment && (
            <section className="comment-detail" aria-live="polite">
              <div className="comment-detail__heading">
                <span className="comment-detail__marker">
                  Marker {selectedComment.marker_number}
                </span>
                <span
                  className={`comment-status comment-status--${selectedComment.status.toLowerCase()}`}
                >
                  {selectedComment.status === 'OPEN' ? 'Open' : 'Resolved'}
                </span>
              </div>
              <h3>{selectedComment.title}</h3>
              <p>{selectedComment.description}</p>
            </section>
          )}
        </>
      )}
    </aside>
  )
}

export default CommentList
