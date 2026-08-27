import { Link } from 'react-router-dom'

import type { Drawing, DrawingStatus } from '../types/review'

type DrawingCardProps = {
  drawing: Drawing
}

const statusLabels: Record<DrawingStatus, string> = {
  NOT_STARTED: 'Not started',
  IN_REVIEW: 'In review',
  COMPLETED: 'Completed',
}

function DrawingCard({ drawing }: DrawingCardProps) {
  const commentLabel =
    drawing.open_comment_count === 1
      ? '1 open comment'
      : `${drawing.open_comment_count} open comments`

  return (
    <article className="drawing-card">
      <div className="drawing-card__thumbnail">
        <img
          src={drawing.image}
          alt={`${drawing.title} technical drawing preview`}
          loading="lazy"
        />
      </div>

      <div className="drawing-card__body">
        <div className="drawing-card__status-row">
          <span className={`status-badge status-badge--${drawing.status.toLowerCase()}`}>
            {statusLabels[drawing.status]}
          </span>
          <span className="comment-count">{commentLabel}</span>
        </div>

        <h2>{drawing.title}</h2>

        <Link
          className="button button--secondary drawing-card__action"
          to={`/drawings/${drawing.id}`}
        >
          Open drawing
        </Link>
      </div>
    </article>
  )
}

export default DrawingCard
