import { useEffect, useState } from 'react'

import { getDrawings } from '../api/reviewBoardApi'
import DrawingCard from '../components/DrawingCard'
import SiteHeader from '../components/SiteHeader'
import type { Drawing } from '../types/review'

type DashboardState =
  | { status: 'loading' }
  | { status: 'success'; drawings: Drawing[] }
  | { status: 'error' }

function LoadingCards() {
  return (
    <div className="drawing-grid" aria-hidden="true">
      {[1, 2, 3].map((item) => (
        <div className="drawing-card drawing-card--loading" key={item}>
          <div className="skeleton skeleton--image" />
          <div className="drawing-card__body">
            <div className="skeleton skeleton--label" />
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--button" />
          </div>
        </div>
      ))}
    </div>
  )
}

function DashboardPage() {
  const [state, setState] = useState<DashboardState>({ status: 'loading' })
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState({ status: 'loading' })

    async function loadDrawings() {
      try {
        const drawings = await getDrawings(controller.signal)
        setState({ status: 'success', drawings })
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setState({ status: 'error' })
      }
    }

    void loadDrawings()

    return () => controller.abort()
  }, [retryKey])

  return (
    <div className="app-shell">
      <SiteHeader />

      <main className="dashboard" id="main-content">
        <div className="dashboard__heading">
          <div>
            <p className="eyebrow">Review workspace</p>
            <h1>Engineering drawings</h1>
            <p className="intro">
              Open a drawing to inspect review markers and track outstanding comments.
            </p>
          </div>

          {state.status === 'success' && state.drawings.length > 0 && (
            <p className="drawing-total" aria-live="polite">
              <strong>{state.drawings.length}</strong>{' '}
              {state.drawings.length === 1 ? 'drawing' : 'drawings'}
            </p>
          )}
        </div>

        {state.status === 'loading' && (
          <section aria-label="Loading drawings">
            <p className="visually-hidden" role="status">
              Loading drawings…
            </p>
            <LoadingCards />
          </section>
        )}

        {state.status === 'error' && (
          <section className="message-panel" aria-labelledby="error-title">
            <span className="message-panel__icon" aria-hidden="true">
              !
            </span>
            <h2 id="error-title">Drawings could not be loaded</h2>
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

        {state.status === 'success' && state.drawings.length === 0 && (
          <section className="message-panel" aria-labelledby="empty-title">
            <span
              className="message-panel__icon message-panel__icon--quiet"
              aria-hidden="true"
            >
              0
            </span>
            <h2 id="empty-title">No drawings yet</h2>
            <p>Drawings will appear here after demo data has been added.</p>
          </section>
        )}

        {state.status === 'success' && state.drawings.length > 0 && (
          <section className="drawing-grid" aria-label="Available drawings">
            {state.drawings.map((drawing) => (
              <DrawingCard drawing={drawing} key={drawing.id} />
            ))}
          </section>
        )}
      </main>
    </div>
  )
}

export default DashboardPage
