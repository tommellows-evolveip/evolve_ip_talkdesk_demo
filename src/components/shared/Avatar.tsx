import { initials } from '../../lib/format'

const PALETTE: [string, string][] = [
  ['rgba(182, 84, 51, 0.16)', '#0D1826'],   // rust
  ['rgba(23, 64, 59, 0.14)',  '#2F6B5E'],   // pine
  ['rgba(109, 94, 130, 0.18)', '#2E3A5C'],  // plum
  ['rgba(184, 138, 58, 0.18)', '#6B4A00'],  // gold
  ['rgba(192, 123, 44, 0.18)', '#8A5A00'],  // burnt orange
  ['rgba(61, 74, 107, 0.14)',  '#1B2E4D'],  // indigo-slate
]

export function Avatar({
  first,
  last,
  id,
  size = 36,
}: {
  first?: string | null
  last?: string | null
  id?: string
  size?: number
}) {
  const hash = (id ?? `${first}${last}`).split('').reduce((a, c) => (a + c.charCodeAt(0)) | 0, 0)
  const [bg, fg] = PALETTE[Math.abs(hash) % PALETTE.length]
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 999,
        display: 'grid',
        placeItems: 'center',
        background: bg,
        color: fg,
        fontFamily: 'var(--font-heading)',
        fontWeight: 700,
        fontSize: size * 0.4,
        letterSpacing: '0.04em',
        border: '1px solid var(--border-2)',
        flexShrink: 0,
      }}
    >
      {initials(first, last)}
    </div>
  )
}
