import { Link } from 'react-router-dom'

type SiteHeaderProps = {
  context?: string
}

function SiteHeader({ context = 'Drawing reviews' }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <Link className="brand" to="/" aria-label="ReviewBoard dashboard">
        <span className="brand__mark" aria-hidden="true">
          RB
        </span>
        <span>ReviewBoard</span>
      </Link>
      <span className="site-header__context">{context}</span>
    </header>
  )
}

export default SiteHeader

