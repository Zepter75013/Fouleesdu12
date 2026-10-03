import { createContext, useContext } from 'react'
import { api } from './api.js'
import { useFetch } from './useFetch.js'

// L'édition à venir (date, départs, tarifs, retrait, lien d'inscription) vient de la base,
// via l'API : la mettre à jour chaque année se fait en base, sans redéployer le site.
const EditionContext = createContext(null)

const fmt = (iso, opts) => new Date(`${iso}T12:00:00`).toLocaleDateString('fr-FR', opts)

function enrichir(e) {
  const date = e.date ? fmt(e.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : `Juin ${e.annee}`
  return {
    ...e,
    dateIso: e.date,
    date: date.charAt(0).toUpperCase() + date.slice(1),
    dateCourte: e.date ? fmt(e.date, { day: 'numeric', month: 'long', year: 'numeric' }) : `juin ${e.annee}`,
    inscriptionsOuvertes: Boolean(e.inscriptionUrl),
  }
}

export function EditionProvider({ children }) {
  const { data, error, loading } = useFetch(() => api.getEdition(), [])
  if (loading) return null
  if (error || !data) {
    return (
      <main className="shell" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <p className="eyebrow">Les Foulées du 12ème</p>
        <h1 style={{ fontSize: '3rem', textTransform: 'uppercase', marginTop: '0.5rem' }}>Site momentanément indisponible</h1>
        <p style={{ marginTop: '1.5rem' }}>Merci de réessayer dans quelques instants.</p>
      </main>
    )
  }
  return <EditionContext.Provider value={enrichir(data)}>{children}</EditionContext.Provider>
}

export const useEdition = () => useContext(EditionContext)
