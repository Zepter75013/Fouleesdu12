// Les titres sont en capitales (text-transform) : le « e » des ordinaux (12e, 22e édition)
// est mis en exposant, et l'exposant garde sa casse minuscule (voir sup dans index.css).
const ORDINAL = /(\d+)(e|er|re)(?=[\s,.)]|$)/g

export function Ordinaux({ children }) {
  if (typeof children !== 'string') return children
  const out = []
  let last = 0
  for (const m of children.matchAll(ORDINAL)) {
    out.push(children.slice(last, m.index), m[1], <sup key={m.index}>{m[2]}</sup>)
    last = m.index + m[0].length
  }
  out.push(children.slice(last))
  return out
}
