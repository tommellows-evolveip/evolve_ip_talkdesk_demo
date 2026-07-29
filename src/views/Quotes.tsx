'use client'

import { useEffect, useState } from 'react'
import { FilePlus, User, Home, Shield, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import type { Quote } from '../lib/types'
import { EmptyState } from '../components/shared/EmptyState'
import { SectionHeader } from '../components/shared/SectionHeader'
import { Badge } from '../components/shared/Badge'
import { fmtGBP, fmtDate } from '../lib/format'

const WIZARD_STEPS = [
  { key: 'applicant', label: 'Applicant', icon: User, description: 'Primary insured, household, prior carrier' },
  { key: 'risk', label: 'Risk', icon: Home, description: 'Dwelling or vehicle, garaging, usage' },
  { key: 'coverage', label: 'Coverage', icon: Shield, description: 'Limits, deductibles, endorsements' },
  { key: 'review', label: 'Review & Bind', icon: Check, description: 'Disclosures, signature, effective date' },
]

export function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (ignore) return
        setQuotes((data as Quote[]) ?? [])
        setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="card" style={{ padding: 22, position: 'relative', overflow: 'hidden' }}>
        <div
          className="bg-grid"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.15 }}
          aria-hidden
        />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.16em',
                color: 'var(--text-dim)',
                textTransform: 'uppercase',
              }}
            >
              New Business
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 44, marginTop: 4 }}>
              Start a quote
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)', maxWidth: 520, marginTop: 8 }}>
              Bind a Harrier Auto, Home, or Umbrella policy in four steps. CSRs can begin on behalf of
              a caller or attach an in-flight quote to an existing customer.
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              style={{
                padding: '12px 18px',
                borderRadius: 10,
                border: 0,
                background: 'linear-gradient(90deg, var(--navy), var(--sky))',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                letterSpacing: '0.04em',
              }}
              onClick={() => alert('Demo only — would launch the quote wizard.')}
            >
              + NEW QUOTE
            </button>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'right' }}>
              TX · CO · FL · WA · AZ
            </div>
          </div>
        </div>

        <div style={{ position: 'relative', marginTop: 26, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {WIZARD_STEPS.map((s, i) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                padding: 16,
                borderRadius: 10,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.14em',
                }}
              >
                STEP {i + 1}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: 'var(--surface)',
                    border: '1px solid var(--border-2)',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--sky)',
                  }}
                >
                  <s.icon size={14} />
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15 }}>{s.label}</div>
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-dim)' }}>{s.description}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 18 }}>
        <SectionHeader eyebrow="Pipeline" title="In-flight Quotes" />
        {loading ? (
          <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>Loading…</div>
        ) : quotes.length === 0 ? (
          <EmptyState
            icon={<FilePlus size={32} />}
            title="No quotes in flight"
            description="Quotes you start from Customer 360 or the “New Quote” button will show up here with reference numbers, estimated premium, and coverage level."
            compact
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {quotes.map((q) => (
              <div
                key={q.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                  gap: 10,
                  padding: 12,
                  background: 'var(--surface-2)',
                  borderRadius: 10,
                  alignItems: 'center',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)' }}>{q.reference_number}</div>
                <div>{q.contact_name ?? '—'}</div>
                <div><Badge variant={q.status ?? 'neutral'} size="xs">{(q.status ?? '—').toUpperCase()}</Badge></div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{fmtGBP(q.estimated_premium)}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'right' }}>
                  expires {fmtDate(q.expires_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
