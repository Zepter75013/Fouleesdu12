import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="shell" style={{ padding: '6rem 0', textAlign: 'center' }}>
      <p className="eyebrow">Hors parcours</p>
      <h1 style={{ fontSize: '4rem', textTransform: 'uppercase', marginTop: '0.5rem' }}>Page introuvable</h1>
      <p style={{ marginTop: '1.5rem' }}>
        <Link to="/" style={{ color: 'var(--vermilion)' }}>← Retour au départ</Link>
      </p>
    </main>
  )
}
