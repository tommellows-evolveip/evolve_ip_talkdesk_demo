'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { BillingAccount, Customer, Payment } from '../lib/types'
import { Badge } from '../components/shared/Badge'
import { KpiCard } from '../components/shared/KpiCard'
import { fmtGBP, fmtDate, daysBetween } from '../lib/format'

type Row = BillingAccount & {
  customer?: Pick<Customer, 'cid' | 'first_name' | 'last_name' | 'mailing_address'> | null
  payments?: Payment[]
}

export function BillingCenter() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('ALL')
  const [cadence, setCadence] = useState('ALL')
  const [autopay, setAutopay] = useState('ALL')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let ignore = false
    setLoading(true)
    supabase
      .from('billing_accounts')
      .select('*, customer:customers(cid, first_name, last_name, mailing_address), payments(*)')
      .order('due_date')
      .then(({ data }) => {
        if (ignore) return
        setRows((data as Row[]) ?? [])
        setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [])

  const arOutstanding = rows.reduce((a, r) => a + Number(r.balance), 0)
  const pastDueBalance = rows.filter((r) => r.status === 'past_due').reduce((a, r) => a + Number(r.balance), 0)
  const autopayCoverage = rows.length
    ? Math.round((rows.filter((r) => r.autopay_enabled).length / rows.length) * 100)
    : 0

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (status !== 'ALL' && r.status !== status) return false
      if (cadence !== 'ALL' && r.payment_frequency !== cadence) return false
      if (autopay !== 'ALL') {
        const want = autopay === 'on'
        if (Boolean(r.autopay_enabled) !== want) return false
      }
      if (query) {
        const q = query.toLowerCase()
        const hay = `${r.customer?.first_name ?? ''} ${r.customer?.last_name ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [rows, status, cadence, autopay, query])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        <KpiCard label="AR Outstanding" value={Math.round(arOutstanding)} prefix="£" color="sky" loading={loading} />
        <KpiCard
          label="Past-Due Balance"
          value={Math.round(pastDueBalance)}
          prefix="£"
          color="amber"
          pulse={pastDueBalance > 0}
          loading={loading}
        />
        <KpiCard label="Autopay Coverage" value={autopayCoverage} suffix="%" color="green" loading={loading} />
      </div>

      <div className="card" style={{ padding: 14, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--surface-2)',
            borderRadius: 8,
            padding: '8px 12px',
            flex: 1,
            minWidth: 200,
          }}
        >
          <Search size={14} color="var(--text-dim)" />
          <input
            placeholder="Search customer…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ background: 'transparent', border: 0, outline: 'none', color: 'var(--text)', width: '100%', fontSize: 13 }}
          />
        </div>
        <Select
          value={status}
          onChange={setStatus}
          options={[
            ['ALL', 'All statuses'],
            ['current', 'Current'],
            ['past_due', 'Past due'],
            ['payment_pending', 'Payment pending'],
          ]}
        />
        <Select
          value={cadence}
          onChange={setCadence}
          options={[
            ['ALL', 'All cadences'],
            ['monthly', 'Monthly'],
            ['quarterly', 'Quarterly'],
            ['semi_annual', 'Semi-annual'],
            ['annual', 'Annual'],
          ]}
        />
        <Select
          value={autopay}
          onChange={setAutopay}
          options={[
            ['ALL', 'Any autopay'],
            ['on', 'Autopay on'],
            ['off', 'Autopay off'],
          ]}
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.6fr 1fr 1fr 0.8fr 1fr 0.6fr 0.6fr 40px',
            padding: '10px 16px',
            borderBottom: '1px solid var(--border)',
            fontSize: 11,
            letterSpacing: '0.1em',
            color: 'var(--text-dim)',
            textTransform: 'uppercase',
          }}
        >
          <div>Customer</div>
          <div>Balance</div>
          <div>Status</div>
          <div>Cadence</div>
          <div>Due</div>
          <div>Auto</div>
          <div>ePay</div>
          <div />
        </div>
        {filtered.map((r) => {
          const late = r.status === 'past_due' ? daysBetween(r.due_date ?? '', new Date().toISOString()) : 0
          return (
            <Link
              key={r.id}
              href={r.customer ? `/customers/${r.customer.cid}` : '#'}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.6fr 1fr 1fr 0.8fr 1fr 0.6fr 0.6fr 40px',
                padding: '12px 16px',
                borderBottom: '1px solid var(--border)',
                color: 'inherit',
                textDecoration: 'none',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface-2)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = 'transparent')}
            >
              <div>
                <div style={{ fontWeight: 500 }}>
                  {r.customer ? `${r.customer.first_name} ${r.customer.last_name}` : '—'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                  {r.customer?.mailing_address?.city}
                  {r.customer?.mailing_address?.state ? `, ${r.customer.mailing_address.state}` : ''}
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)' }}>{fmtGBP(r.balance)}</div>
              <div>
                <Badge variant={r.status} size="xs" />
                {late > 0 && (
                  <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 2 }}>{late}d late</div>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{r.payment_frequency ?? '—'}</div>
              <div style={{ fontSize: 12 }}>{fmtDate(r.due_date)}</div>
              <div>{r.autopay_enabled ? <Dot tone="green" /> : <Dot tone="muted" />}</div>
              <div>{r.paperless_enabled ? <Dot tone="green" /> : <Dot tone="muted" />}</div>
              <div style={{ color: 'var(--text-dim)' }}>
                <ArrowRight size={14} />
              </div>
            </Link>
          )
        })}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-dim)' }}>No matching accounts.</div>
        )}
      </div>
    </div>
  )
}

function Dot({ tone }: { tone: 'green' | 'muted' }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: 999,
        background: tone === 'green' ? 'var(--green)' : 'var(--text-muted)',
      }}
    />
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
