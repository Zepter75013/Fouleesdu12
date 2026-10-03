import { Link } from 'react-router-dom'
import { DOCS } from '../data/edition.js'

const PARTENAIRES = ['Mairie du 12e', 'Ville de Paris', 'OMS 12', 'Protiming']

export default function Footer() {
  return (
    <footer>
      <div className="shell foot">
        <a href={DOCS.club} target="_blank" rel="noreferrer">SAM Paris 12</a>
        <Link to="/infos-pratiques">Infos pratiques</Link>
        <a href={DOCS.reglement} target="_blank" rel="noreferrer">Règlement</a>
        <a href={`mailto:${DOCS.webmaster}`}>Contact</a>
        <Link to="/a-propos">À propos</Link>
        <span className="sep" />
        <span className="partner">
          Avec
          <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2 22 20H2Z" fill="none" stroke="var(--vermilion)" strokeWidth="2.5" />
          </svg>
          {PARTENAIRES.join(' · ')}
        </span>
      </div>
    </footer>
  )
}
