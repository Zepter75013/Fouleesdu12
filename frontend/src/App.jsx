import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import { EditionProvider } from './lib/edition.jsx'
import EasterEgg from './components/EasterEgg.jsx'
import Home from './pages/Home.jsx'
import NotFound from './pages/NotFound.jsx'
import APropos from './pages/APropos.jsx'
import {
  LaCoursePage, ParcoursPage, KidsPage, ChimpsPage, EcoPage, InfosPage, ResultatsPage, ClubPage,
} from './pages/Content.jsx'

// Les liens peuvent viser une ancre (/la-course#inscription) : on y défile si elle existe, sinon on remonte en haut.
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView()
        return
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])
  return null
}

const PAGES = [
  ['/', Home],
  ['/la-course', LaCoursePage],
  ['/parcours', ParcoursPage],
  ['/courses-enfants', KidsPage],
  ['/i-run-for-chimps', ChimpsPage],
  ['/eco-responsable', EcoPage],
  ['/infos-pratiques', InfosPage],
  ['/resultats', ResultatsPage],
  ['/club-organisateur', ClubPage],
  ['/a-propos', APropos],
  ['*', NotFound],
]

export default function App() {
  return (
    <EditionProvider>
      <ScrollManager />
      <EasterEgg />
      <Header />
      <Routes>
        {PAGES.map(([path, Page]) => <Route key={path} path={path} element={<Page />} />)}
      </Routes>
      <Footer />
    </EditionProvider>
  )
}
