import { Link } from 'react-router-dom'
import { Borne, Runner, useActiveLegs } from '../components/Legs.jsx'
import { InscriptionButton } from '../components/Header.jsx'
import { BORNES } from '../data/rubriques.js'
import { useEdition } from '../lib/edition.jsx'

// Nombre de jours avant la course (null le jour même et après).
function joursRestants(EDITION) {
  if (!EDITION.dateIso) return null
  const jours = Math.ceil((new Date(`${EDITION.dateIso}T07:00:00`) - new Date()) / 86400000)
  return jours > 0 ? jours : null
}

export default function Home() {
  useActiveLegs()
  const EDITION = useEdition()
  const jours = joursRestants(EDITION)

  return (
    <main id="top">
      <section className="hero hero--cover">
        <div className="hero-slides" aria-hidden="true">
          <img className="hero-slide hero-slide--in" src="/photos/vitesse.jpg" alt="" fetchPriority="high" />
        </div>
        <div className="shell">
          <div className="hero__text">
            <p className="eyebrow">{EDITION.numero}e édition · Course Label FFA · Bois de Vincennes</p>
            <h1>Les Foulées du <em>12<sup>e</sup></em></h1>
            <p className="lead">
              5 km, 10 km et courses enfants dans le Bois de Vincennes, arrivée sur la piste du vélodrome
              Jacques Anquetil. En option, le dossard solidaire pour la préservation des chimpanzés sauvages.
            </p>
            <div className="hero-actions">
              <InscriptionButton className="btn btn--solid" />
              <Link className="btn btn--ghost" to="/parcours">Voir le parcours</Link>
            </div>
            <div className="next-run">
              <b>Prochaine édition</b>
              <span className="big">
                {EDITION.date} <span className="dot">·</span> Vélodrome Jacques Anquetil, la Cipale
              </span>
              <br />
              {EDITION.departs.slice(0, 3).map((d, i) => (
                <span key={d.course}>
                  {i > 0 && <> <span className="dot">·</span> </>}
                  {d.heure} {d.course.replace(' 1 000 m', '')}
                </span>
              ))}
              <span className="next-run__ref"> (horaires {EDITION.reference})</span>
            </div>
          </div>
        </div>
      </section>

      <dl className="stats shell" style={{ maxWidth: 'none', paddingInline: 0 }}>
        <div>
          <dt>Édition {EDITION.annee}</dt>
          <dd>{EDITION.dateCourte.replace(` ${EDITION.annee}`, '')}</dd>
        </div>
        <div>
          <dt>Compte à rebours</dt>
          <dd>{jours ? `J − ${jours}` : 'Jour de course'}</dd>
        </div>
        <div>
          <dt>Distances</dt>
          <dd>5 · 10 km</dd>
        </div>
        <div>
          <dt>Records H · F</dt>
          <dd>30'25 · 33'37</dd>
        </div>
      </dl>

      <div className="shell legs">
        <div className="course-line" aria-hidden="true" />
        <Runner />

        {BORNES.map((b, i) => (
          <section className="leg" id={b.id} key={b.id}>
            <div className="leg__marker"><Borne n={i + 1} /></div>
            <div className="leg__body">
              <p className="eyebrow">{b.theme}</p>
              <h2>{b.titre}</h2>
              <p className="lead-note">{b.texte}</p>
              <p className="more-links">
                <Link to={b.to}>{b.lien} →</Link>
              </p>
            </div>
          </section>
        ))}
      </div>
    </main>
  )
}
