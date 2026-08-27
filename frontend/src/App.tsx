import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import DashboardPage from './pages/DashboardPage'
import DrawingReviewPage from './pages/DrawingReviewPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/drawings/:drawingId" element={<DrawingReviewPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
