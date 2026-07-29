import { format, formatDistanceToNowStrict, differenceInDays, parseISO } from 'date-fns'

export const fmtGBP = (n: number | string | null | undefined, opts: Intl.NumberFormatOptions = {}) => {
  if (n === null || n === undefined || n === '') return '—'
  const v = typeof n === 'string' ? Number(n) : n
  if (Number.isNaN(v)) return '—'
  return v.toLocaleString('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
    ...opts,
  })
}

export const fmtGBPpence = (n: number | string | null | undefined) =>
  fmtGBP(n, { maximumFractionDigits: 2, minimumFractionDigits: 2 })

export const fmtInt = (n: number | string | null | undefined) => {
  if (n === null || n === undefined) return '—'
  const v = typeof n === 'string' ? Number(n) : n
  if (Number.isNaN(v)) return '—'
  return v.toLocaleString('en-GB')
}

export const fmtDate = (iso: string | null | undefined, pattern = 'MMM d, yyyy') => {
  if (!iso) return '—'
  try {
    return format(parseISO(iso), pattern)
  } catch {
    return iso
  }
}

export const fmtDateShort = (iso: string | null | undefined) => fmtDate(iso, 'MMM d')

export const fmtTime = (iso: string | null | undefined) => fmtDate(iso, 'h:mm a')

export const fmtRel = (iso: string | null | undefined) => {
  if (!iso) return '—'
  try {
    return `${formatDistanceToNowStrict(parseISO(iso))} ago`
  } catch {
    return iso
  }
}

export const daysBetween = (isoA: string | null | undefined, isoB: string | null | undefined) => {
  if (!isoA || !isoB) return 0
  try {
    return differenceInDays(parseISO(isoB), parseISO(isoA))
  } catch {
    return 0
  }
}

export const daysUntil = (iso: string | null | undefined) => {
  if (!iso) return 0
  try {
    return differenceInDays(parseISO(iso), new Date())
  } catch {
    return 0
  }
}

export const initials = (first?: string | null, last?: string | null) =>
  `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?'

export const fmtPhone = (raw: string | null | undefined) => {
  if (!raw) return '—'
  const digits = raw.replace(/\D/g, '')
  // UK number stored as +44 followed by 10 digits (national number, leading 0 dropped)
  if (digits.length === 12 && digits.startsWith('44')) {
    const national = digits.slice(2)
    // Mobile: 07xxx xxxxxx style -> +44 7xxx xxxxxx
    if (national.startsWith('7')) {
      return `+44 ${national.slice(0, 4)} ${national.slice(4)}`
    }
    // Landline: +44 20 xxxx xxxx (London) or +44 xxxx xxxxxx (other areas)
    if (national.startsWith('20')) {
      return `+44 20 ${national.slice(2, 6)} ${national.slice(6)}`
    }
    return `+44 ${national.slice(0, 4)} ${national.slice(4)}`
  }
  // Fallback: already has a leading 0 (UK national format entered directly)
  if (digits.length === 11 && digits.startsWith('0')) {
    return `+44 ${digits.slice(1, 5)} ${digits.slice(5)}`
  }
  return raw
}
