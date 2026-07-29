'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Policy, Customer } from '../lib/types'
import { Badge } from '../components/shared/Badge'
import { fmtGBP, fmtDate, daysUntil } from '../lib/format'

type Row = Policy & {
  customer?: Pick<Customer, 'cid' | 'first_name' | 'last_name' | 'mailing_address'> | null
}

export function PolicyCenter() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState<string>('ALL')
  const [status, setStatus] = useState<string>('ALL')
  const [expSoon, setExpSoon] = useState<number>(0) // days
  const [query, setQuery] = useState('')

  useEffect(() => {
    let ignore = false
    setLoading(true)
    supabase
      .from('policies')
      .select('*, customer:customers(cid, first_name, last_name, mailing_address)')
      .order('expiration_date')
      .then(({ data }) => {
        if (ignore) return
        setRows((data as Row[]) ?? [])
        setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (type !== 'ALL' && r.type !== type) return false
      if (status !== 'ALL' && r.status !== status) return false
      if (expSoon > 0 && daysUntil(r.expiration_date) > expSoon) return false
      if (query) {
        const q = query.toLowerCase()
        const hay =
          `${r.policy_number} ${r.customer?.first_name ?? ''} ${r.customer?.last_name ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [rows, type, status, expSoon, query])

  const totalPremium = filtered.reduce((a, p) => a + Number(p.premium_amount ?? 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card" style={{ padding: 14, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', borderRadius: 8, padding: '8px 12px', flex: 1, minWidth: 240 }}>
          <Search size={14} color="var(--text-dim)" />
          <input
            placeholder="Policy # or customer…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ background: 'transparent', border: 0, outline: 'none', color: 'var(--text)', width: '100%', fontSize: 13 }}
          />
        </div>
        <Select value={type} onChange={setType} options={[['ALL', 'All LOBs'], ['auto', 'Auto'], ['home', 'Home'], ['umbrella', 'Umbrella']]} />
        <Select
          value={status}
          onChange={setStatus}
          options={[
            ['ALL', 'All statuses'],
            ['active', 'Active'],
            ['pending_renewal', 'Pending renewal'],
            ['cancelled', 'Cancelled'],
            ['lapsed', 'Lapsed'],
          ]}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 14, 45, 90].map((d) => (
            <button
              key={d}
              onClick={() => setExpSoon(d)}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: `1px solid ${expSoon === d ? 'var(--sky)' : 'var(--border-2)'}`,
                background: expSoon === d ? 'var(--sky-glow)' : 'var(--surface-2)',
                color: expSoon === d ? 'var(--text)' : 'var(--text-dim)',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {d === 0 ? 'Any exp.' : `≤ ${d}d`}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 14, display: 'flex', gap: 30 }}>
        <Stat label="In Filter" value={filtered.length} />
        <Stat label="Total Premium" value={fmtGBP(totalPremium)} />
        <Stat label="Renewals ≤ 45d" value={rows.filter((r) => daysUntil(r.expiration_date) <= 45 && r.status === 'active').length} />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <Header />
        {filtered.map((r) => {
          const days = daysUntil(r.expiration_date)
          const renewalColor = days <= 14 ? 'var(--red)' : days <= 45 ? 'var(--amber)' : 'var(--text-dim)'
          return (
            <Link
              key={r.id}
              href={r.customer ? `/customers/${r.customer.cid}` : '#'}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1.4fr 0.6fr 0.8fr 0.8fr 1fr 0.8fr 0.3fr',
                gap: 0,
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                color: 'inherit',
                textDecoration: 'none',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface-2)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = 'transparent')}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{r.policy_number}</div>
              <div>
                {r.customer ? `${r.customer.first_name} ${r.customer.last_name}` : '—'}
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                  {r.customer?.mailing_address?.city}{r.customer?.mailing_address?.state ? `, ${r.customer.mailing_address.state}` : ''}
                </div>
              </div>
              <div><Badge variant={r.type} size="xs" /></div>
              <div><Badge variant={r.status} size="xs" /></div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{fmtDate(r.effective_date)}</div>
              <div style={{ fontSize: 12 }}>
                {fmtDate(r.expiration_date)}
                <span style={{ marginLeft: 6, color: renewalColor, fontSize: 11 }}>
                  {days}d
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', textAlign: 'right' }}>{fmtGBP(r.premium_amount)}</div>
              <div style={{ textAlign: 'right', color: 'var(--text-dim)' }}><ArrowRight size={14} /></div>
            </Link>
          )
        })}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>No policies match.</div>
        )}
      </div>
    </div>
  )
}

function Header() {
  const labels = ['Policy #', 'Customer', 'LOB', 'Status', 'Effective', 'Expires', 'Premium', '']
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1.4fr 0.6fr 0.8fr 0.8fr 1fr 0.8fr 0.3fr',
        padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
        fontSize: 11,
        letterSpacing: '0.1em',
        color: 'var(--text-dim)',
        textTransform: 'uppercase',
      }}
    >
      {labels.map((l, i) => (
        <div key={i} style={{ textAlign: i === 6 ? 'right' : 'left' }}>{l}</div>
      ))}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div style={{ fontSize: 11, letterSpacing: '0.12em', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 26 }}>{value}</div>
    </div>
  )
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: 'var(--surface-2)',
        color: 'var(--text)',
        border: '1px solid var(--border-2)',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 13,
      }}
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  )
}
