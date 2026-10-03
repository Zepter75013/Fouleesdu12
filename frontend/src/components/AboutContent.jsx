import { useState } from 'react'
import { APP_VERSION, CHANGELOG } from '../version.js'

export default function AboutContent() {
  // CHANGELOG[0] est toujours la plus récente (convention : nouvelle entrée
  // ajoutée en haut), donc c'est la sélection par défaut.
  const [selectedVersion, setSelectedVersion] = useState(CHANGELOG[0]?.version ?? '')
  const selected = CHANGELOG.find((c) => c.version === selectedVersion) ?? CHANGELOG[0]

  return (
    <div>
      <span className="eyebrow">Les Foulées du 12ème</span>
      <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', textTransform: 'uppercase', marginTop: '0.3rem' }}>À propos du site</h2>
      <p style={{ fontSize: '0.95rem', color: 'var(--ink-soft)', lineHeight: 1.7, marginTop: '1rem' }}>
        Ce site présente les Foulées du 12ème, course sur route de 5 et 10 km et courses enfants dans le Bois de Vincennes, organisée chaque année en juin par la SAM Paris 12, club d'athlétisme fondé en 1887 : la course, le parcours, les inscriptions, les informations pratiques et les résultats et photos des éditions passées.
      </p>

      <div style={{ marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid var(--line)' }}>
        <span className="eyebrow">Version</span>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', marginTop: '0.3rem' }}>v{APP_VERSION}</p>
      </div>

      {CHANGELOG.length > 0 && (
        <div style={{ marginTop: '1.2rem', paddingTop: '1.2rem', borderTop: '1px solid var(--line)' }}>
          <span className="eyebrow">Historique</span>
          <select
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            style={{
              display: 'block', marginTop: '0.6rem', width: '100%', padding: '0.5rem 0.65rem',
              background: '#fff', color: '#1C1917', border: '1px solid var(--line)',
              fontFamily: 'var(--font-mono)', fontSize: '0.82rem', boxSizing: 'border-box',
            }}
          >
            {CHANGELOG.map((c) => (
              <option key={c.version} value={c.version}>v{c.version} · {c.date}</option>
            ))}
          </select>
          {selected && (
            <div style={{ borderLeft: '2px solid var(--vermilion)', paddingLeft: '0.9rem', marginTop: '0.9rem' }}>
              <b style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>v{selected.version} · {selected.date}</b>
              <span style={{ fontSize: '0.85rem', color: 'var(--ink-soft)' }}>{selected.notes}</span>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '1.2rem', paddingTop: '1.2rem', borderTop: '1px solid var(--line)' }}>
        <span className="eyebrow">Contact</span>
        <p style={{ fontSize: '0.9rem', marginTop: '0.3rem' }}>
          <a href="mailto:webmaster@samparis12.org" style={{ color: 'var(--vermilion)' }}>webmaster@samparis12.org</a>
        </p>
      </div>
    </div>
  )
}
