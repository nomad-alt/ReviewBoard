import { useEffect, useState } from 'react'

type ApiState = 'loading' | 'connected' | 'unavailable'

function App() {
  const [apiState, setApiState] = useState<ApiState>('loading')

  useEffect(() => {
    const controller = new AbortController()

    async function checkApi() {
      try {
        const response = await fetch('/api/health/', {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error('The API health check failed.')
        }

        setApiState('connected')
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setApiState('unavailable')
      }
    }

    void checkApi()

    return () => controller.abort()
  }, [])

  return (
    <main className="app-shell">
      <section className="welcome-panel" aria-labelledby="page-title">
        <p className="eyebrow">Engineering drawing review</p>
        <h1 id="page-title">ReviewBoard</h1>
        <p className="intro">
          A focused workspace for placing review markers, discussing drawing
          details, and tracking resolutions.
        </p>

        <div className="status-row" role="status" aria-live="polite">
          <span className={`status-dot status-dot--${apiState}`} aria-hidden="true" />
          {apiState === 'loading' && 'Checking API connection…'}
          {apiState === 'connected' && 'Frontend and API are connected.'}
          {apiState === 'unavailable' &&
            'API unavailable. Start the Django development server and refresh.'}
        </div>
      </section>
    </main>
  )
}

export default App

