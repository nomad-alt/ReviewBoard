import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  ApiError,
  createDrawingComment,
  getDrawing,
  getDrawingComments,
} from '../api/reviewBoardApi'
import CommentForm from '../components/CommentForm'
import CommentList from '../components/CommentList'
import DrawingViewer from '../components/DrawingViewer'
import SiteHeader from '../components/SiteHeader'
import type {
  CommentPosition,
  CreateReviewCommentInput,
  Drawing,
  ReviewComment,
} from '../types/review'

type ReviewPageState =
  | { status: 'loading' }
  | { status: 'success'; drawing: Drawing; comments: ReviewComment[] }
  | { status: 'not-found' }
  | { status: 'error' }

function DrawingReviewPage() {
  const { drawingId } = useParams()
  const parsedDrawingId = Number(drawingId)
  const [state, setState] = useState<ReviewPageState>({ status: 'loading' })
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const [draftPosition, setDraftPosition] = useState<CommentPosition | null>(null)
  const [isSavingComment, setIsSavingComment] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [commentToFocus, setCommentToFocus] = useState<number | null>(null)
  const addCommentButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setDraftPosition(null)
    setSaveError(null)

    if (!Number.isInteger(parsedDrawingId) || parsedDrawingId < 1) {
      setState({ status: 'not-found' })
      return
    }

    const controller = new AbortController()
    setState({ status: 'loading' })

    async function loadReview() {
      try {
        const [drawing, comments] = await Promise.all([
          getDrawing(parsedDrawingId, controller.signal),
          getDrawingComments(parsedDrawingId, controller.signal),
        ])

        setState({ status: 'success', drawing, comments })
        setSelectedCommentId((currentId) => {
          const selectionStillExists = comments.some(
            (comment) => comment.id === currentId,
          )
          return selectionStillExists ? currentId : (comments[0]?.id ?? null)
        })
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setState(
          error instanceof ApiError && error.status === 404
            ? { status: 'not-found' }
            : { status: 'error' },
        )
      }
    }

    void loadReview()

    return () => controller.abort()
  }, [parsedDrawingId, retryKey])

  const nextMarkerNumber =
    state.status === 'success'
      ? Math.max(0, ...state.comments.map((comment) => comment.marker_number)) + 1
      : 1

  function placeDraft(position: CommentPosition) {
    if (isSavingComment) return

    setDraftPosition(position)
    setSaveError(null)
  }

  function cancelDraft() {
    setDraftPosition(null)
    setSaveError(null)
    window.requestAnimationFrame(() => addCommentButtonRef.current?.focus())
  }

  async function saveComment(comment: CreateReviewCommentInput) {
    if (state.status !== 'success') return

    setIsSavingComment(true)
    setSaveError(null)

    try {
      const createdComment = await createDrawingComment(state.drawing.id, comment)

      setState((currentState) =>
        currentState.status === 'success'
          ? {
              ...currentState,
              comments: [...currentState.comments, createdComment].sort(
                (a, b) => a.marker_number - b.marker_number,
              ),
            }
          : currentState,
      )
      setSelectedCommentId(createdComment.id)
      setCommentToFocus(createdComment.id)
      setDraftPosition(null)
    } catch {
      setSaveError('The comment could not be saved. Check your connection and try again.')
    } finally {
      setIsSavingComment(false)
    }
  }

  return (
    <div className="app-shell">
      <SiteHeader context="Drawing review" />

      <main className="review-page" id="main-content">
        {state.status === 'loading' && (
          <section className="review-page-state" role="status">
            <span className="review-page-state__spinner" aria-hidden="true" />
            <h1>Loading drawing</h1>
            <p>Retrieving the drawing and its review comments…</p>
          </section>
        )}

        {state.status === 'not-found' && (
          <section className="review-page-state">
            <span className="message-panel__icon message-panel__icon--quiet" aria-hidden="true">
              ?
            </span>
            <h1>Drawing not found</h1>
            <p>The requested drawing does not exist or may have been removed.</p>
            <Link className="button button--primary" to="/">
              Return to dashboard
            </Link>
          </section>
        )}

        {state.status === 'error' && (
          <section className="review-page-state">
            <span className="message-panel__icon" aria-hidden="true">
              !
            </span>
            <h1>Drawing could not be loaded</h1>
            <p>Check that the API is running, then try the request again.</p>
            <button
              className="button button--primary"
              type="button"
              onClick={() => setRetryKey((key) => key + 1)}
            >
              Try again
            </button>
          </section>
        )}

        {state.status === 'success' && (
          <>
            <Link className="back-link" to="/">
              <span aria-hidden="true">←</span> All drawings
            </Link>

            <header className="review-heading">
              <div>
                <p className="eyebrow">Drawing review</p>
                <h1>{state.drawing.title}</h1>
              </div>
              <span
                className={`status-badge status-badge--${state.drawing.status.toLowerCase()}`}
              >
                {state.drawing.status === 'IN_REVIEW'
                  ? 'In review'
                  : state.drawing.status === 'COMPLETED'
                    ? 'Completed'
                    : 'Not started'}
              </span>
            </header>

            <div className="review-layout">
              <section className="drawing-panel" aria-labelledby="drawing-panel-title">
                <div className="drawing-panel__toolbar">
                  <h2 id="drawing-panel-title">Drawing sheet</h2>
                  <div className="drawing-panel__actions">
                    <span>
                      {state.comments.length}{' '}
                      {state.comments.length === 1 ? 'marker' : 'markers'}
                    </span>
                    <button
                      ref={addCommentButtonRef}
                      className="button button--secondary button--compact"
                      type="button"
                      disabled={isSavingComment}
                      onClick={() => placeDraft({ x_position: 50, y_position: 50 })}
                    >
                      Add comment
                    </button>
                  </div>
                </div>
                <DrawingViewer
                  drawing={state.drawing}
                  comments={state.comments}
                  selectedCommentId={selectedCommentId}
                  onSelectComment={setSelectedCommentId}
                  draftPosition={draftPosition}
                  draftMarkerNumber={nextMarkerNumber}
                  onPlaceDraft={placeDraft}
                />
              </section>

              {draftPosition ? (
                <aside className="comment-sidebar" aria-label="Create comment">
                  <CommentForm
                    markerNumber={nextMarkerNumber}
                    position={draftPosition}
                    isSaving={isSavingComment}
                    saveError={saveError}
                    onSave={saveComment}
                    onCancel={cancelDraft}
                  />
                </aside>
              ) : (
                <CommentList
                  comments={state.comments}
                  selectedCommentId={selectedCommentId}
                  onSelectComment={setSelectedCommentId}
                  commentToFocus={commentToFocus}
                  onCommentFocused={() => setCommentToFocus(null)}
                />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default DrawingReviewPage
