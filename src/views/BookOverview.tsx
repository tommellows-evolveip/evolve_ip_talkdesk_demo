'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FileText, ShieldAlert, AlertTriangle, Wallet, ArrowRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type {
  Policy,
  Claim,
  BillingAccount,
  Customer,
} from '../lib/types'
import { KpiCard } from '../components/shared/KpiCard'
import { SectionHeader } from '../components/shared/SectionHeader'
import { Badge } from '../components/shared/Badge'
import { Avatar } from '../components/shared/Avatar'
import { LobDonut } from '../components/charts/LobDonut'
import { StateBar } from '../components/charts/StateBar'
import { ClaimFunnel } from '../components/charts/ClaimFunnel'
import { fmtGBP, fmtRel, daysBetween } from '../lib/format'

const HARRIER_REGIONS = ['Greater London', 'West Midlands', 'Greater Manchester', 'West Yorkshire', 'Surrey']
const CLOSED_LIKE = new Set(['closed', 'denied'])

export function BookOverview() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [claims, setClaims] = useState<(Claim & { customer?: Pick<Customer, 'first_name' | 'last_name' | 'cid'> | null })[]>([])
  const [billing, setBilling] = useState<(BillingAccount & { customer?: Pick<Customer, 'first_name' | 'last_name' | 'cid' | 'mailing_address'> | null })[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    setLoading(true)
    Promise.all([
      supabase.from('policies').select('*'),
      supabase
        .from('claims')
        .select('*, customer:customers(cid, first_name, last_name)')
        .order('loss_date', { ascending: false }),
      supabase
        .from('billing_accounts')
        .select('*, customer:customers(cid, first_name, last_name, mailing_address)')
        .order('due_date'),
      supabase.from('customers').select('*'),
    ]).then(([p, c, b, cu]) => {
      if (ignore) return
      setPolicies((p.data as Policy[]) ?? [])
      setClaims((c.data as typeof claims) ?? [])
      setBilling((b.data as typeof billing) ?? [])
      setCustomers((cu.data as Customer[]) ?? [])
      setLoading(false)
    })
    return () => {
      ignore = true
    }
  }, [])

  const activePolicies = policies.filter((p) => p.status === 'active')
  const writtenPremium = activePolicies.reduce((acc, p) => acc + Number(p.premium_amount ?? 0), 0)
  const openClaims = claims.filter((c) => !CLOSED_LIKE.has(c.status))
  const pastDue = billing.filter((b) => b.status === 'past_due')

  const premiumByLob = useMemo(() => {
    const m: Record<string, number> = { auto: 0, home: 0, umbrella: 0 }
    activePolicies.forEach((p) => {
      m[p.type] = (m[p.type] ?? 0) + Number(p.premium_amount ?? 0)
    })
    return Object.entries(m).map(([name, value]) => ({ name, value }))
  }, [activePolicies])

  const policiesByState = useMemo(() => {
    const byCustomer: Record<string, string | undefined> = {}
    customers.forEach((c) => {
      byCustomer[c.cid] = c.mailing_address?.state
    })
    const counts: Record<string, number> = {}
    HARRIER_REGIONS.forEach((s) => (counts[s] = 0))
    policies.forEach((p) => {
      const st = p.dwelling_address?.state ?? byCustomer[p.customer_id]
      if (st && counts[st] !== undefined) counts[st] += 1
    })
    return HARRIER_REGIONS.map((s) => ({ state: s, count: counts[s] ?? 0 }))
  }, [policies, customers])

  const claimCounts = useMemo(() => {
    const m: Record<string, number> = {}
    claims.forEach((c) => (m[c.status] = (m[c.status] ?? 0) + 1))
    return m
  }, [claims])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 14,
        }}
      >
        <KpiCard
          label="In-Force Policies"
          value={activePolicies.length}
          color="sky"
          icon={<FileText size={18} />}
          hint={`${policies.length} total on book`}
          loading={loading}
        />
        <KpiCard
          label="Written Premium"
          value={Math.round(writtenPremium)}
          prefix="£"
          color="navy"
          icon={<Wallet size={18} />}
          hint={`Across ${activePolicies.length} active policies`}
          loading={loading}
        />
        <KpiCard
          label="Open Claims"
          value={openClaims.length}
          color="red"
          icon={<AlertTriangle size={18} />}
          hint={`${claims.length} total · ${claimCounts['closed'] ?? 0} closed`}
          loading={loading}
          pulse={openClaims.length > 0}
        />
        <KpiCard
          label="Past-Due Accounts"
          value={pastDue.length}
          color="amber"
          icon={<ShieldAlert size={18} />}
          hint={`${fmtGBP(pastDue.reduce((a, b) => a + Number(b.balance), 0))} delinquent`}
          loading={loading}
          pulse={pastDue.length > 0}
        />
      </div>

      {/* Row 2: charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 14 }}>
        <div className="card" style={{ padding: 18 }}>
          <SectionHeader eyebrow="Premium mix" title="Written Premium by LOB" />
          <LobDonut data={premiumByLob} />
          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 8 }}>
            {premiumByLob.map((d) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <Badge variant={d.name as 'auto' | 'home' | 'umbrella'} size="xs" />
                <span style={{ color: 'var(--text-dim)' }}>{fmtGBP(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <SectionHeader eyebrow="Footprint" title="Policies by State" />
          <StateBar data={policiesByState} />
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-dim)', textAlign: 'center' }}>
            5-state P&amp;C footprint: TX · CO · FL · WA · AZ
          </div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <SectionHeader eyebrow="ClaimCenter" title="Claims Pipeline" />
          <ClaimFunnel counts={claimCounts} />
        </div>
      </div>

      {/* Row 3: recent feeds */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>
        <div className="card" style={{ padding: 18 }}>
          <SectionHeader
            eyebrow="ClaimCenter"
            title="Recent FNOL"
            right={
              <Link href="/claims" style={{ fontSize: 12, color: 'var(--sky)', textDecoration: 'none' }}>
                View all →
              </Link>
            }
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {claims.slice(0, 5).map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr auto',
                  gap: 12,
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: 'var(--surface-2)',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{c.claim_number}</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
                  <Badge variant={c.loss_type} size="xs" />
                  <span style={{ color: 'var(--text-dim)', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.customer?.first_name} {c.customer?.last_name} · {c.loss_description}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Badge variant={c.status} size="xs" />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {c.loss_date}
                  </span>
                </div>
              </motion.div>
            ))}
            {claims.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-dim)', fontSize: 13 }}>
                No claims on book.
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <SectionHeader
            eyebrow="BillingCenter"
            title="Delinquency Watchlist"
            right={
              <Link href="/billing" style={{ fontSize: 12, color: 'var(--sky)', textDecoration: 'none' }}>
                View all →
              </Link>
            }
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pastDue.slice(0, 5).map((b, i) => {
              const overdue = daysBetween(b.due_date ?? '', new Date().toISOString())
              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={b.customer ? `/customers/${b.customer.cid}` : '/billing'}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '36px 1fr auto auto',
                      gap: 12,
                      alignItems: 'center',
                      padding: '10px 12px',
                      background: 'var(--surface-2)',
                      borderRadius: 10,
                      border: '1px solid rgba(192, 123, 44, 0.35)',
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <Avatar first={b.customer?.first_name} last={b.customer?.last_name} id={b.customer?.cid} size={32} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>
                        {b.customer?.first_name} {b.customer?.last_name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                        {b.customer?.mailing_address?.city}, {b.customer?.mailing_address?.state} · {b.payment_frequency}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'var(--amber)' }}>
                      {fmtGBP(b.balance)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-dim)', fontSize: 11 }}>
                      <span>{overdue > 0 ? `${overdue}d late` : 'due today'}</span>
                      <ArrowRight size={14} />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
            {pastDue.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-dim)', fontSize: 13 }}>
                No past-due accounts. 🎉
              </div>
            )}
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
            Last sync {fmtRel(new Date().toISOString())}
          </div>
        </div>
      </div>
    </div>
  )
}
