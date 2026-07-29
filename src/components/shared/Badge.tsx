import type { CSSProperties } from 'react'

export type BadgeVariant =
  // LOB
  | 'auto' | 'home' | 'umbrella'
  // Policy status
  | 'active' | 'pending_renewal' | 'cancelled' | 'lapsed'
  // Billing status
  | 'current' | 'past_due' | 'payment_pending'
  // Claim status
  | 'reported' | 'assigned' | 'under_investigation' | 'estimate_pending' | 'closed' | 'denied'
  // Loss type
  | 'collision' | 'comprehensive' | 'glass' | 'water_damage' | 'fire' | 'theft' | 'liability'
  // Payment status
  | 'completed' | 'pending' | 'failed'
  // Ownership
  | 'owned' | 'financed' | 'leased'
  // Relationship
  | 'self' | 'spouse' | 'child'
  // Source
  | 'web' | 'synthetic'
  | 'neutral'

// Editorial palette: warm ground, strong ink text, tinted fills.
// fg = label color, bg = fill, dot = leading dot / border accent.
const RUST = '#16263D'
const RUST_DEEP = '#0D1826'
const PINE = '#2F6B5E'
const PINE_SOFT = '#4F7A6E'
const AMBER = '#B8790B'
const GOLD = '#D9A62A'
const SLATE = '#5A6B80'
const INK = '#16263D'
const PURPLE = '#4A5A80'
const INDIGO = '#2C3B5C'

const MAP: Record<BadgeVariant, { fg: string; bg: string; dot?: string; label?: string; pulse?: boolean }> = {
  auto:                { fg: RUST_DEEP, bg: 'rgba(182, 84, 51, 0.12)', dot: RUST, label: 'AUTO' },
  home:                { fg: PINE,      bg: 'rgba(23, 64, 59, 0.10)',  dot: PINE, label: 'HOME' },
  umbrella:            { fg: '#6B4A00', bg: 'rgba(184, 138, 58, 0.16)',dot: GOLD, label: 'UMBRELLA' },

  active:              { fg: PINE,      bg: 'rgba(23, 64, 59, 0.10)',  dot: PINE, label: 'ACTIVE' },
  pending_renewal:     { fg: '#8A5A00', bg: 'rgba(192, 123, 44, 0.16)', dot: AMBER, label: 'PENDING RENEWAL' },
  cancelled:           { fg: SLATE,     bg: 'rgba(27, 34, 48, 0.06)',  dot: SLATE, label: 'CANCELLED' },
  lapsed:              { fg: RUST_DEEP, bg: 'rgba(165, 63, 43, 0.14)', dot: '#A83246', label: 'LAPSED' },

  current:             { fg: PINE,      bg: 'rgba(23, 64, 59, 0.10)',  dot: PINE, label: 'CURRENT' },
  past_due:            { fg: '#8A5A00', bg: 'rgba(192, 123, 44, 0.20)', dot: AMBER, label: 'PAST DUE', pulse: true },
  payment_pending:     { fg: RUST_DEEP, bg: 'rgba(182, 84, 51, 0.12)',  dot: RUST, label: 'PAYMENT PENDING' },

  reported:            { fg: RUST_DEEP, bg: 'rgba(182, 84, 51, 0.12)',  dot: RUST, label: 'REPORTED' },
  assigned:            { fg: INDIGO,    bg: 'rgba(61, 74, 107, 0.12)',  dot: INDIGO, label: 'ASSIGNED' },
  under_investigation: { fg: '#8A5A00', bg: 'rgba(192, 123, 44, 0.16)', dot: AMBER, label: 'UNDER INVESTIGATION' },
  estimate_pending:    { fg: '#8A5A00', bg: 'rgba(192, 123, 44, 0.16)', dot: AMBER, label: 'ESTIMATE PENDING' },
  closed:              { fg: SLATE,     bg: 'rgba(27, 34, 48, 0.06)',  dot: SLATE, label: 'CLOSED' },
  denied:              { fg: RUST_DEEP, bg: 'rgba(165, 63, 43, 0.14)', dot: '#A83246', label: 'DENIED' },

  collision:           { fg: RUST_DEEP, bg: 'rgba(165, 63, 43, 0.12)', dot: '#A83246', label: 'COLLISION' },
  comprehensive:       { fg: '#8A5A00', bg: 'rgba(192, 123, 44, 0.14)', dot: AMBER, label: 'COMPREHENSIVE' },
  glass:               { fg: PINE,      bg: 'rgba(23, 64, 59, 0.10)',  dot: PINE_SOFT, label: 'GLASS' },
  water_damage:        { fg: INDIGO,    bg: 'rgba(61, 74, 107, 0.12)',  dot: INDIGO, label: 'WATER DAMAGE' },
  fire:                { fg: RUST_DEEP, bg: 'rgba(165, 63, 43, 0.16)', dot: '#A83246', label: 'FIRE' },
  theft:               { fg: '#2E3A5C', bg: 'rgba(109, 94, 130, 0.16)', dot: PURPLE, label: 'THEFT' },
  liability:           { fg: '#6B4A00', bg: 'rgba(184, 138, 58, 0.14)', dot: GOLD, label: 'LIABILITY' },

  completed:           { fg: PINE,      bg: 'rgba(23, 64, 59, 0.10)',  dot: PINE, label: 'COMPLETED' },
  pending:             { fg: '#8A5A00', bg: 'rgba(192, 123, 44, 0.14)', dot: AMBER, label: 'PENDING' },
  failed:              { fg: RUST_DEEP, bg: 'rgba(165, 63, 43, 0.16)', dot: '#A83246', label: 'FAILED' },

  owned:               { fg: PINE,      bg: 'rgba(23, 64, 59, 0.08)',  dot: PINE, label: 'OWNED' },
  financed:            { fg: '#8A5A00', bg: 'rgba(192, 123, 44, 0.12)', dot: AMBER, label: 'FINANCED' },
  leased:              { fg: RUST_DEEP, bg: 'rgba(182, 84, 51, 0.10)', dot: RUST, label: 'LEASED' },

  self:                { fg: INK,       bg: 'rgba(27, 34, 48, 0.06)',  label: 'SELF' },
  spouse:              { fg: '#2E3A5C', bg: 'rgba(109, 94, 130, 0.12)', label: 'SPOUSE' },
  child:               { fg: '#6B4A00', bg: 'rgba(184, 138, 58, 0.12)', label: 'CHILD' },

  web:                 { fg: PINE,      bg: 'rgba(23, 64, 59, 0.08)',  label: 'WEB' },
  synthetic:           { fg: SLATE,     bg: 'rgba(27, 34, 48, 0.06)',  label: 'SYNTHETIC' },

  neutral:             { fg: SLATE,     bg: 'rgba(27, 34, 48, 0.06)' },
}

export function Badge({
  variant,
  children,
  title,
  size = 'sm',
}: {
  variant: BadgeVariant | string
  children?: React.ReactNode
  title?: string
  size?: 'xs' | 'sm' | 'md'
}) {
  const v = (variant as BadgeVariant) in MAP ? (variant as BadgeVariant) : 'neutral'
  const cfg = MAP[v]
  const label = children ?? cfg.label ?? String(variant).toUpperCase().replace(/_/g, ' ')
  const px = size === 'xs' ? '6px' : size === 'md' ? '12px' : '9px'
  const py = size === 'xs' ? '2px' : size === 'md' ? '5px' : '3px'
  const fs = size === 'xs' ? '10px' : size === 'md' ? '13px' : '11px'

  const style: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: `${py} ${px}`,
    borderRadius: 999,
    fontFamily: 'var(--font-body)',
    fontWeight: 700,
    fontSize: fs,
    letterSpacing: '0.06em',
    color: cfg.fg,
    background: cfg.bg,
    border: `1px solid ${cfg.dot ?? cfg.fg}26`,
    whiteSpace: 'nowrap',
    animation: cfg.pulse ? 'badge-pulse 2.2s ease-in-out infinite' : undefined,
  }

  return (
    <span style={style} title={title}>
      {cfg.dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: cfg.dot,
            boxShadow: cfg.pulse ? `0 0 6px ${cfg.dot}` : undefined,
          }}
        />
      )}
      {label}
      <style>{`@keyframes badge-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.7 } }`}</style>
    </span>
  )
}
