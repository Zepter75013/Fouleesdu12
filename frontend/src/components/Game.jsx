import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Borne, RunnerFigure, tirerCoureur } from './Legs.jsx'
import { useEdition } from '../lib/edition.jsx'

// « Foulées Jump » : mini-jeu caché, façon Doodle Jump. Le coureur de la SAM rebondit tout seul de plateforme
// en plateforme ; on le dirige à gauche ou à droite pour grimper. Plateformes mobiles, plateformes en carton qui
// cèdent, gels (super saut), gourdes (bonus), oiseaux à éviter ou à écraser en leur tombant dessus. Chaque
// kilomètre gravi, une borne passe ; à 10 km, les Foulées sont bouclées.
// ← → (ou Q/A, D) : se diriger · mobile : toucher la moitié gauche ou droite de l'écran.
const G = 1900
const JUMP_V = 900 // hauteur d'un saut : JUMP_V² / 2G ≈ 213 px
const SUPER_V = 1650 // gel : ≈ 716 px
const MOVE_V = 340
const RUN_W = 60
const FOOT_L = 18 // pieds du coureur dans sa boîte de 60 px
const FOOT_R = 42
const PLAT_W = 64
const PX_PER_KM = 4000 // 4 px = 1 m
const HALF_M = 5000
const WIN_M = 10000
const BEST_KEY = 'foulees-jump-best'

const TYPES = {
  gel: { w: 16, h: 26 },
  gourde: { w: 14, h: 30 },
  oiseau: { w: 38, h: 22 },
}

function Sprite({ type }) {
  switch (type) {
    case 'oiseau':
      return (
        <svg viewBox="0 0 38 22" width="38" height="22" aria-hidden="true" className="game-bird">
          <path d="M3 12 L9 9 L9 15 Z" fill="#f08a24" />
          <ellipse cx="21" cy="13" rx="11" ry="6.5" fill="#3b3631" />
          <circle cx="29.5" cy="9" r="4.4" fill="#3b3631" />
          <circle cx="30.6" cy="8.4" r="1" fill="#fff" />
          <path d="M33 9.5 L38 11 L33 12.4 Z" fill="#f08a24" />
          <path className="game-bird__wing" d="M16 11 Q20 -2 28 3 Q24 8 24 12 Z" fill="#6b625a" />
        </svg>
      )
    case 'gel':
      return (
        <svg viewBox="0 0 16 26" width="16" height="26" aria-hidden="true">
          <rect x="3" y="1" width="10" height="5" rx="1.5" fill="#3b3631" />
          <path d="M2 7 H14 L13 25 H3 Z" fill="#f4b400" stroke="#b07f00" strokeWidth="1" />
          <rect x="4.5" y="12" width="7" height="6" rx="1" fill="#fff" opacity="0.85" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 14 30" width="14" height="30" aria-hidden="true">
          <rect x="4.5" y="0" width="5" height="5" rx="1" fill="#e10600" />
          <path d="M3 5 H11 Q13 8 13 11 V27 Q13 29.5 10.5 29.5 H3.5 Q1 29.5 1 27 V11 Q1 8 3 5 Z" fill="#7cc4f0" stroke="#3a86b8" strokeWidth="1" />
          <rect x="1.4" y="14" width="11.2" height="7" fill="#fff" opacity="0.8" />
        </svg>
      )
  }
}

function lireRecord() {
  try { return Number(localStorage.getItem(BEST_KEY)) || 0 } catch { return 0 }
}
function ecrireRecord(v) {
  try { localStorage.setItem(BEST_KEY, String(v)) } catch { /* stockage indisponible */ }
}
const fmt = (m) => `${m.toLocaleString('fr-FR')} m`
const overlap = (a1, a2, b1, b2) => a1 < b2 && a2 > b1

export default function Game({ onClose }) {
  const navigate = useNavigate()
  const edition = useEdition()
  const [look] = useState(tirerCoureur)
  const [phase, setPhase] = useState('ready') // ready | play | win | over
  const [items, setItems] = useState([])
  const [result, setResult] = useState({ m: 0, best: lireRecord(), neuf: false, cause: '' })
  const stage = useRef(null)
  const runnerEl = useRef(null)
  const hudEl = useRef(null)
  const flashEl = useRef(null)
  const nodes = useRef(new Map())
  const g = useRef({ phase: 'ready' })

  useEffect(() => {
    const dlg = stage.current
    const prevFocus = document.activeElement
    dlg.focus()
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const s = g.current
    if (import.meta.env.DEV) window.__jump = s // inspection pendant le développement
    let raf = 0
    let last = 0
    let width = dlg.clientWidth
    let height = dlg.clientHeight
    const onResize = () => { width = dlg.clientWidth; height = dlg.clientHeight }
    window.addEventListener('resize', onResize)

    const sync = () => setItems(s.list.map(({ id, kind, variant, n, w }) => ({ id, kind, variant, n, w })))
    const setP = (p) => { s.phase = p; setPhase(p) }
    const flash = (txt) => {
      const f = flashEl.current
      if (!f) return
      f.textContent = txt
      f.classList.remove('is-on')
      void f.offsetWidth
      f.classList.add('is-on')
    }
    const meters = () => Math.floor(s.maxY / (PX_PER_KM / 1000)) + s.bonus

    // Plateformes, gels, gourdes, oiseaux et bornes jusqu'à la hauteur demandée. Chaque plateforme « solide »
    // est toujours atteignable depuis la précédente ; les plateformes en carton s'ajoutent en leurre.
    const spawnUpTo = (top) => {
      while (s.nextPlatY < top) {
        const km = s.nextPlatY / PX_PER_KM
        const maxGap = Math.min(85 + km * 22, 180)
        const y = s.nextPlatY + 55 + Math.random() * (maxGap - 55)
        const moving = km > 1 && Math.random() < Math.min(0.12 + km * 0.035, 0.4)
        const plat = {
          id: ++s.idSeq, kind: 'plat', variant: moving ? 'move' : 'normal', w: PLAT_W, h: 14,
          x: Math.random() * (width - PLAT_W), y,
          vx: moving ? (Math.random() < 0.5 ? -1 : 1) * (50 + Math.min(km * 12, 90)) : 0,
        }
        s.list.push(plat)
        if (km > 0.3 && Math.random() < Math.min(0.1 + km * 0.03, 0.3)) {
          s.list.push({
            id: ++s.idSeq, kind: 'plat', variant: 'carton', w: PLAT_W, h: 14,
            x: Math.random() * (width - PLAT_W), y: s.nextPlatY + (y - s.nextPlatY) * (0.35 + Math.random() * 0.3), vx: 0,
          })
        }
        // gel ou gourde posé sur la plateforme (il suit la plateforme mobile)
        const r = Math.random()
        if (s.nextPlatY > 600 && r < 0.14) {
          const kind = r < 0.045 ? 'gel' : 'gourde'
          s.list.push({ id: ++s.idSeq, kind, ...TYPES[kind], plat, dx: 10 + Math.random() * (PLAT_W - 34), x: 0, y: y + plat.h })
        }
        // oiseau qui va et vient, jamais collé à la plateforme qui le précède
        if (km > 1.2 && Math.random() < Math.min(0.05 + km * 0.012, 0.14)) {
          s.list.push({
            id: ++s.idSeq, kind: 'oiseau', ...TYPES.oiseau, x: Math.random() * (width - 38), y: y + 70 + Math.random() * 40,
            vx: (Math.random() < 0.5 ? -1 : 1) * (70 + Math.random() * 60),
          })
        }
        s.nextPlatY = y
      }
      while (s.nextBorne * PX_PER_KM < top) {
        const n = s.nextBorne
        s.list.push({ id: ++s.idSeq, kind: 'borne', n, w: 40, x: n % 2 ? 10 : width - 50, y: n * PX_PER_KM })
        s.nextBorne += 1
      }
    }

    const reset = () => {
      Object.assign(s, {
        x: width / 2 - RUN_W / 2, y: 40, vx: 0, vy: JUMP_V, camY: 0, maxY: 0, bonus: 0, time: 0,
        dir: 0, faceLeft: false, superUntil: 0, half: false, won: false, nextPlatY: 40, nextBorne: 1, idSeq: 0,
        list: [{ id: 0, kind: 'plat', variant: 'start', x: 0, y: 0, w: width, h: 40, vx: 0 }],
      })
      spawnUpTo(height + 300)
      sync()
      setP('play')
    }

    const action = () => {
      if (s.phase === 'ready') { reset(); return }
      if (s.phase === 'over') { if (performance.now() - s.overAt > 400) reset(); return }
      if (s.phase === 'win') setP('play')
    }

    const finish = (cause) => {
      s.overAt = performance.now()
      const m = meters()
      const best = lireRecord()
      const neuf = m > best
      if (neuf) ecrireRecord(m)
      setResult({ m, best: Math.max(best, m), neuf, cause })
      setP('over')
    }

    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min((now - (last || now)) / 1000, 0.05)
      last = now

      if (s.phase === 'play') {
        s.time += dt
        // se diriger, avec un peu d'inertie ; on passe d'un bord à l'autre
        s.vx += (s.dir * MOVE_V - s.vx) * Math.min(1, dt * 12)
        s.x += s.vx * dt
        if (s.vx < -5) s.faceLeft = true
        else if (s.vx > 5) s.faceLeft = false
        if (s.x > width - RUN_W / 2) s.x -= width
        if (s.x < -RUN_W / 2) s.x += width

        const prevY = s.y
        s.vy -= G * dt
        s.y += s.vy * dt

        let removed = false
        for (const o of s.list) {
          if (o.kind === 'plat' && o.vx) {
            o.x += o.vx * dt
            if (o.x < 0) { o.x = 0; o.vx = -o.vx }
            if (o.x > width - o.w) { o.x = width - o.w; o.vx = -o.vx }
          } else if (o.kind === 'oiseau') {
            o.x += o.vx * dt
            if (o.x < 0) { o.x = 0; o.vx = -o.vx }
            if (o.x > width - o.w) { o.x = width - o.w; o.vx = -o.vx }
          } else if (o.plat) {
            o.x = o.plat.x + o.dx
          }
          if (o.broken) o.y -= 520 * dt
        }

        const feetL = s.x + FOOT_L
        const feetR = s.x + FOOT_R
        // rebond : seulement en descendant, quand les pieds passent le dessus d'une plateforme
        if (s.vy < 0) {
          for (const o of s.list) {
            if (o.kind !== 'plat' || o.broken) continue
            const topY = o.y + o.h
            if (prevY >= topY && s.y <= topY && overlap(feetL, feetR, o.x, o.x + o.w)) {
              if (o.variant === 'carton') {
                o.broken = true
                removed = true
                continue
              }
              s.y = topY
              s.vy = JUMP_V
              break
            }
          }
        }

        // gels, gourdes, oiseaux
        const bodyL = s.x + 14
        const bodyR = s.x + 46
        let hitBird = false
        for (const o of s.list) {
          if (o.gone || (o.kind !== 'gel' && o.kind !== 'gourde' && o.kind !== 'oiseau')) continue
          if (!overlap(bodyL, bodyR, o.x, o.x + o.w) || !overlap(s.y, s.y + 66, o.y, o.y + o.h)) continue
          if (o.kind === 'oiseau') {
            if (s.vy < 0 && prevY >= o.y + o.h * 0.5) {
              o.gone = true
              removed = true
              s.vy = JUMP_V
              s.bonus += 50
              flash('Hop ! +50 m')
            } else if (s.time > s.superUntil) {
              hitBird = true
            }
            continue
          }
          o.gone = true
          removed = true
          if (o.kind === 'gel') {
            s.vy = SUPER_V
            s.superUntil = s.time + 1.1
            flash('Gel ! Super saut')
          } else {
            s.bonus += 25
            flash('Gourde ! +25 m')
          }
        }

        // la caméra ne fait que monter
        if (s.y - s.camY > height * 0.55) s.camY = s.y - height * 0.55
        if (s.y > s.maxY) {
          const km = Math.floor(s.y / PX_PER_KM)
          if (km > Math.floor(s.maxY / PX_PER_KM)) flash(km * 1000 === HALF_M ? 'Mi-parcours : 5 km !' : `Km ${km} !`)
          s.maxY = s.y
        }

        spawnUpTo(s.camY + height + 300)
        const before = s.list.length
        s.list = s.list.filter((o) => !o.gone && o.y > s.camY - 160 && !(o.plat && o.plat.y <= s.camY - 160))
        if (removed || s.list.length !== before) sync()

        if (hitBird) finish('Percuté par un oiseau')
        else if (s.y < s.camY - 120) finish('Chute !')
        else if (!s.won && meters() >= WIN_M) { s.won = true; s.dir = 0; setP('win') }
      }

      // rendu sans passer par React : hauteur dans le monde → position à l'écran
      const cam = s.camY || 0
      const r = runnerEl.current
      if (r && !s.list) r.style.transform = `translate3d(${width / 2 - RUN_W / 2}px, -40px, 0)` // en attente sur la ligne de départ
      if (r && s.list) {
        r.style.transform = `translate3d(${s.x}px, ${-(s.y - cam)}px, 0)`
        r.classList.toggle('is-left', s.faceLeft)
        r.classList.toggle('is-running', s.phase === 'play')
        r.classList.toggle('is-boost', s.phase === 'play' && s.time < s.superUntil)
      }
      for (const o of s.list || []) {
        const el = nodes.current.get(o.id)
        if (el) el.style.transform = `translate3d(${o.x}px, ${-(o.y - cam)}px, 0)`
      }
      dlg.style.setProperty('--cam', `${cam * 0.35}px`)
      if (hudEl.current && s.list) hudEl.current.textContent = fmt(meters())
    }
    raf = requestAnimationFrame(frame)

    const keys = { left: false, right: false }
    const majDir = () => { s.dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0) }
    const LEFT = ['ArrowLeft', 'q', 'a']
    const RIGHT = ['ArrowRight', 'd']
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return }
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (LEFT.includes(k)) { e.preventDefault(); keys.left = true; majDir(); return }
      if (RIGHT.includes(k)) { e.preventDefault(); keys.right = true; majDir(); return }
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'Enter') {
        // Entrée / Espace sur un bouton du panneau : on laisse le bouton agir
        if (e.target.closest && e.target.closest('.game__btn')) return
        e.preventDefault()
        if (!e.repeat) action()
      }
    }
    const onKeyUp = (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (LEFT.includes(k)) keys.left = false
      if (RIGHT.includes(k)) keys.right = false
      majDir()
    }
    const onBlur = () => { keys.left = false; keys.right = false; majDir() }

    // toucher : moitié gauche = à gauche, moitié droite = à droite, tant que le doigt reste posé
    const pointers = new Map()
    const majTouch = () => {
      const v = [...pointers.values()]
      s.dir = v.length ? v[v.length - 1] : 0
    }
    const onDown = (e) => {
      if (e.target.closest('.game__close, .game__btn')) return
      if (s.phase !== 'play') { action(); return }
      const box = dlg.getBoundingClientRect()
      pointers.set(e.pointerId, e.clientX - box.left < box.width / 2 ? -1 : 1)
      majTouch()
    }
    const onMove = (e) => {
      if (!pointers.has(e.pointerId)) return
      const box = dlg.getBoundingClientRect()
      pointers.set(e.pointerId, e.clientX - box.left < box.width / 2 ? -1 : 1)
      majTouch()
    }
    const onUp = (e) => { pointers.delete(e.pointerId); majTouch() }

    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    dlg.addEventListener('pointerdown', onDown)
    dlg.addEventListener('pointermove', onMove)
    dlg.addEventListener('pointerup', onUp)
    dlg.addEventListener('pointercancel', onUp)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      dlg.removeEventListener('pointerdown', onDown)
      dlg.removeEventListener('pointermove', onMove)
      dlg.removeEventListener('pointerup', onUp)
      dlg.removeEventListener('pointercancel', onUp)
      document.body.style.overflow = prevOverflow
      if (prevFocus && prevFocus.focus) prevFocus.focus()
    }
  }, [onClose])

  const sInscrire = () => {
    onClose()
    if (edition.inscriptionsOuvertes) window.open(edition.inscriptionUrl, '_blank', 'noopener')
    else navigate('/la-course#inscription')
  }
  const reprendre = () => {
    g.current.phase = 'play'
    setPhase('play')
    stage.current?.focus()
  }

  return (
    <div className="game" role="dialog" aria-modal="true" aria-label="Foulées Jump, mini-jeu">
      <div className="game__stage game__stage--jump" ref={stage} tabIndex={-1}>
        <button type="button" className="game__close" onClick={onClose} aria-label="Fermer le jeu">✕</button>
        <div className="game__hud" aria-live="off">
          <span className="game__title">Foulées Jump</span>
          <span className="game__score" ref={hudEl}>0 m</span>
          <span className="game__best">Record {fmt(result.best)}</span>
        </div>
        <div className="game__flash" ref={flashEl} aria-hidden="true" />

        {items.map((o) => (
          <div
            key={o.id}
            className={`jump__obj jump__obj--${o.kind}${o.variant ? ` jump__plat--${o.variant}` : ''}`}
            style={o.kind === 'plat' ? { width: o.w } : undefined}
            ref={(el) => { if (el) nodes.current.set(o.id, el); else nodes.current.delete(o.id) }}
          >
            {o.kind === 'borne' && <Borne n={o.n} />}
            {(o.kind === 'gel' || o.kind === 'gourde' || o.kind === 'oiseau') && <Sprite type={o.kind} />}
          </div>
        ))}

        <div
          className={`runner runner--game runner--jump${look.femme ? ' is-woman' : ''}`}
          ref={runnerEl}
          style={{ '--skin': look.peau, '--hair': look.cheveux }}
        >
          <RunnerFigure look={look} />
        </div>

        {phase === 'ready' && (
          <div className="game__panel">
            <b>Foulées Jump</b>
            <span>Le coureur rebondit tout seul : dirige-le de plateforme en plateforme pour grimper jusqu'aux 10 km des Foulées.</span>
            <span>Les plateformes en carton cèdent, le gel donne un super saut, la gourde des mètres en plus. Évite les oiseaux… ou retombe dessus !</span>
            <span className="game__hint">← → pour se diriger · mobile : toucher à gauche ou à droite</span>
            <span className="game__hint">Espace ou toucher pour partir</span>
          </div>
        )}
        {phase === 'win' && (
          <div className="game__panel game__panel--win">
            <b>Bravo, 10 km bouclés !</b>
            <span>Tu as gravi les 10 km des Foulées du 12<sup>e</sup>. Maintenant, à plat : rendez-vous le {edition.date.toLowerCase()} dans le Bois de Vincennes.</span>
            <div className="game__actions">
              <button type="button" className="game__btn game__btn--solid" onClick={sInscrire}>
                {edition.inscriptionsOuvertes ? "S'inscrire aux Foulées" : 'Voir la course'}
              </button>
              <button type="button" className="game__btn" onClick={reprendre}>Continuer à grimper</button>
            </div>
          </div>
        )}
        {phase === 'over' && (
          <div className="game__panel">
            <b>{result.neuf ? 'Nouveau record !' : result.cause}</b>
            {result.neuf && <span>{result.cause}</span>}
            <span>{fmt(result.m)} gravis · record {fmt(result.best)}</span>
            <span className="game__hint">Espace ou toucher pour repartir · Échap pour fermer</span>
          </div>
        )}
      </div>
    </div>
  )
}
