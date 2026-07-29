'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  CreditCard,
  FileText,
  AlertTriangle,
  CalendarDays,
  Car,
  Home as HomeIcon,
  Umbrella,
  ArrowUpRight,
  Zap,
  PhoneCall,
  User as UserIcon,
  Star,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useCustomer360 } from '../hooks/useCustomer360'
import { useSessionAgent } from '../hooks/useSessionAgent'
import { Avatar } from '../components/shared/Avatar'
import { Badge } from '../components/shared/Badge'
import { CopyField } from '../components/shared/CopyField'
import { JsonAddress } from '../components/shared/JsonAddress'
import { EmptyState } from '../components/shared/EmptyState'
import { SectionHeader } from '../components/shared/SectionHeader'
import { StatusPulse } from '../components/shared/StatusPulse'
import { fmtGBP, fmtGBPpence, fmtDate, fmtRel, fmtPhone, daysUntil, daysBetween } from '../lib/format'
import type { Policy } from '../lib/types'

type TabKey = 'policies' | 'claims' | 'billing' | 'quotes'

const TAB_DEFS: { key: TabKey; label: string; icon: typeof FileText }[] = [
  { key: 'policies', label: 'Policies', icon: FileText },
  { key: 'claims', label: 'Claims', icon: AlertTriangle },
  { key: 'billing', label: 'Billing', icon: CreditCard },
  { key: 'quotes', label: 'Quotes & Activity', icon: Zap },
]

export function Customer360() {
  const { id } = useParams<{ id: string }>()
  const data = useCustomer360(id)
  const [tab, setTab] = useState<TabKey>('policies')
  const { isAdmin } = useSessionAgent()

  if (data.loading && !data.customer) {
    return <div style={{ padding: 40, color: 'var(--text-dim)' }}>Loading customer…</div>
  }
  if (!data.customer) {
    return <EmptyState title="Customer not found" description="This record may have been removed." />
  }
  const c = data.customer

  const openClaims = data.claims.filter((cl) => cl.status !== 'closed' && cl.status !== 'denied')
  const lastSuccessAuth = data.authEvents.find((e) => e.result === 'success')
  const failed30d = data.authEvents.filter(
    (e) => e.result === 'failure' && daysBetween(e.created_at ?? '', new Date().toISOString()) <= 30,
  )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 18, alignItems: 'start' }}>
      {/* LEFT RAIL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 80 }}>
        {/* Identity block */}
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <Avatar first={c.first_name} last={c.last_name} id={c.cid} size={60} />
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700,
                  fontSize: 28,
                  lineHeight: 1.05,
                  letterSpacing: '0.01em',
                }}
              >
                {c.first_name} {c.last_name}
              </div>
              <div style={{ marginTop: 4, display: 'flex', gap: 8, alignItems: 'center' }}>
                {c.source && <Badge variant={c.source} size="xs" />}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                  {c.cid.slice(0, 8)}
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
            <Row icon={<MapPin size={14} />}>
              <JsonAddress value={c.mailing_address} inline />
            </Row>
            <Row icon={<PhoneCall size={14} />}>
              <CopyField value={c.phone}>{fmtPhone(c.phone)}</CopyField>
            </Row>
            <Row icon={<UserIcon size={14} />}>
              <CopyField value={c.email}>{c.email}</CopyField>
            </Row>
          </div>

          <div
            style={{
              marginTop: 14,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 8,
            }}
          >
            <GlanceTile label="Policies" value={data.policies.length} color="sky" />
            <GlanceTile
              label="Balance"
              value={fmtGBP(data.billingAccount?.balance ?? 0)}
              color={data.billingAccount?.status === 'past_due' ? 'amber' : 'green'}
              small
            />
            <GlanceTile label="Open Claims" value={openClaims.length} color={openClaims.length > 0 ? 'red' : 'green'} />
          </div>
        </div>

        {/* Auth strip */}
        <div className="card" style={{ padding: 14 }}>
          <SectionHeader eyebrow="Identity · Talkdesk" title="Auth & OTP" />
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <ShieldCheck size={28} color={lastSuccessAuth ? 'var(--green)' : 'var(--text-dim)'} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Last success
              </div>
              <div style={{ fontSize: 13 }}>
                {lastSuccessAuth ? fmtRel(lastSuccessAuth.created_at) : 'Never'}
                {lastSuccessAuth?.delivery_method && (
                  <span style={{ marginLeft: 8, color: 'var(--text-dim)' }}>
                    via {lastSuccessAuth.delivery_method.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <div
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                background: failed30d.length > 0 ? 'rgba(165, 63, 43, 0.14)' : 'rgba(23, 64, 59, 0.12)',
                color: failed30d.length > 0 ? '#0D1826' : '#2F6B5E',
                fontSize: 11,
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
              }}
            >
              {failed30d.length} fail / 30d
            </div>
          </div>
          {data.authEvents.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 130, overflow: 'auto' }}>
              {data.authEvents.slice(0, 6).map((e) => (
                <div
                  key={e.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '8px 1fr auto auto',
                    gap: 8,
                    alignItems: 'center',
                    fontSize: 11,
                    padding: '4px 6px',
                    borderRadius: 6,
                    background: 'var(--surface-2)',
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: e.result === 'success' ? 'var(--green)' : 'var(--red)',
                    }}
                  />
                  <span style={{ color: 'var(--text-dim)' }}>{e.event_type}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{e.delivery_method ?? '—'}</span>
                  <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {fmtRel(e.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Billing mini card */}
        {data.billingAccount && (
          <BillingMini account={data.billingAccount} />
        )}

        {/* Payment methods */}
        <div className="card" style={{ padding: 14 }}>
          <SectionHeader eyebrow="On file" title="Payment Methods" />
          {data.paymentMethods.length === 0 && (
            <div style={{ color: 'var(--text-dim)', fontSize: 12 }}>No methods on file.</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.paymentMethods.map((pm) => (
              <div
                key={pm.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '24px 1fr auto',
                  gap: 10,
                  alignItems: 'center',
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: 'var(--surface-2)',
                  border: pm.is_default ? '1px solid var(--sky)' : '1px solid var(--border)',
                }}
              >
                <CreditCard size={16} color="var(--text-dim)" />
                <div style={{ fontSize: 12 }}>
                  {pm.brand ?? pm.type}
                  <span style={{ marginLeft: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                    ·{pm.last_four}
                  </span>
                </div>
                {pm.is_default && <Badge variant="active" size="xs">DEFAULT</Badge>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
        {/* Tab strip */}
        <div
          className="card"
          style={{
            padding: 4,
            display: 'flex',
            gap: 4,
          }}
        >
          {TAB_DEFS.map(({ key, label, icon: Icon }) => {
            const active = tab === key
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: 0,
                  background: active ? 'var(--surface-2)' : 'transparent',
                  color: active ? 'var(--text)' : 'var(--text-dim)',
                  fontSize: 13,
                  letterSpacing: '0.02em',
                  cursor: 'pointer',
                  boxShadow: active ? '0 0 0 1px var(--border-2)' : 'none',
                }}
              >
                <Icon size={14} />
                {label}
                {key === 'claims' && openClaims.length > 0 && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      padding: '2px 6px',
                      borderRadius: 999,
                      background: 'rgba(165, 63, 43, 0.16)',
                      color: '#0D1826',
                      fontWeight: 700,
                    }}
                  >
                    {openClaims.length}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {tab === 'policies' && <PoliciesTab policies={data.policies} />}
        {tab === 'claims' && <ClaimsTab claims={data.claims} />}
        {tab === 'billing' && <BillingTab account={data.billingAccount} methods={data.paymentMethods} />}
        {tab === 'quotes' && <QuotesActivityTab quotes={data.quotes} authEvents={data.authEvents} />}

        {isAdmin && (
          <DangerZone
            customerId={c.cid}
            customerName={`${c.first_name} ${c.last_name}`}
            counts={{
              policies: data.policies.length,
              claims: data.claims.length,
              payments: data.billingAccount?.payments.length ?? 0,
              billing: data.billingAccount ? 1 : 0,
              paymentMethods: data.paymentMethods.length,
            }}
          />
        )}
      </div>
    </div>
  )
}

function DangerZone({
  customerId,
  customerName,
  counts,
}: {
  customerId: string
  customerName: string
  counts: { policies: number; claims: number; payments: number; billing: number; paymentMethods: number }
}) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [typedName, setTypedName] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`, { method: 'DELETE' })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(body.error ?? 'Could not delete customer')
        setDeleting(false)
        return
      }
      router.push('/customers')
      router.refresh()
    } catch {
      setError('Network error — please try again')
      setDeleting(false)
    }
  }

  return (
    <div
      className="card"
      style={{ padding: 20, borderColor: 'rgba(165, 63, 43, 0.4)', background: 'rgba(165, 63, 43, 0.04)' }}
    >
      <SectionHeader eyebrow="Admin · Irreversible" title="Danger zone" />
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ fontSize: 13, color: 'var(--text)' }}>
            Edit identity fields or remove this customer entirely. Removal cascades to all
            associated policies, vehicles, drivers, claims, billing, payment methods, and payments.
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            {counts.policies} polic{counts.policies === 1 ? 'y' : 'ies'} · {counts.claims} claim{counts.claims === 1 ? '' : 's'} ·{' '}
            {counts.billing} billing · {counts.payments} payment{counts.payments === 1 ? '' : 's'} ·{' '}
            {counts.paymentMethods} method{counts.paymentMethods === 1 ? '' : 's'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link
            href={`/admin/customers/${customerId}/edit`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid var(--border-2)',
              background: 'var(--surface-2)',
              color: 'var(--text)',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textDecoration: 'none',
            }}
          >
            <Pencil size={14} /> Edit
          </Link>
          <button
            onClick={() => setConfirming(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid rgba(165, 63, 43, 0.5)',
              background: 'transparent',
              color: '#0D1826',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            <Trash2 size={14} /> Delete customer
          </button>
        </div>
      </div>

      {confirming && (
        <div
          onClick={() => !deleting && setConfirming(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 24, 28, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{ width: '100%', maxWidth: 480, padding: 24, borderColor: 'rgba(165, 63, 43, 0.5)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ShieldAlert size={20} color="#0D1826" />
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18 }}>Delete {customerName}?</div>
              </div>
              <button
                onClick={() => !deleting && setConfirming(false)}
                aria-label="Close"
                style={{ background: 'transparent', border: 0, color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
              This will permanently remove the customer and cascade through{' '}
              <b>{counts.policies}</b> polic{counts.policies === 1 ? 'y' : 'ies'},{' '}
              <b>{counts.claims}</b> claim{counts.claims === 1 ? '' : 's'},{' '}
              <b>{counts.billing}</b> billing account, <b>{counts.payments}</b> payment
              {counts.payments === 1 ? '' : 's'}, and <b>{counts.paymentMethods}</b> payment method
              {counts.paymentMethods === 1 ? '' : 's'}. This cannot be undone.
            </div>
            <div style={{ marginTop: 14, fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700 }}>
              Type the customer&apos;s name to confirm
            </div>
            <div style={{ marginTop: 6, background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: 10, padding: '10px 14px' }}>
              <input
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder={customerName}
                disabled={deleting}
                style={{ width: '100%', background: 'transparent', border: 0, outline: 'none', color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font-body)' }}
              />
            </div>
            {error && (
              <div
                style={{
                  marginTop: 12,
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'rgba(165, 63, 43, 0.10)',
                  border: '1px solid rgba(165, 63, 43, 0.35)',
                  color: '#0D1826',
                  fontSize: 12,
                }}
              >
                {error}
              </div>
            )}
            <div style={{ marginTop: 18, display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirming(false)}
                disabled={deleting}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border-2)',
                  background: 'transparent',
                  color: 'var(--text-dim)',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: deleting ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || typedName.trim() !== customerName}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: 0,
                  background:
                    typedName.trim() === customerName && !deleting
                      ? 'linear-gradient(135deg, #A83246, #0A1420)'
                      : 'var(--surface-2)',
                  color: typedName.trim() === customerName && !deleting ? '#fff' : 'var(--text-dim)',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor:
                    typedName.trim() === customerName && !deleting ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Trash2 size={14} /> {deleting ? 'Deleting…' : 'Delete forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--text-dim)' }}>
      <span>{icon}</span>
      <span style={{ color: 'var(--text)', minWidth: 0 }}>{children}</span>
    </div>
  )
}

function GlanceTile({
  label,
  value,
  color,
  small,
}: {
  label: string
  value: number | string
  color: 'sky' | 'green' | 'red' | 'amber'
  small?: boolean
}) {
  const c = { sky: 'var(--sky)', green: 'var(--green)', red: 'var(--red)', amber: 'var(--amber)' }[color]
  return (
    <div
      style={{
        borderRadius: 10,
        padding: 10,
        background: 'var(--surface-2)',
        border: `1px solid ${c}33`,
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: small ? 22 : 28,
          color: c,
          marginTop: 4,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  )
}

function BillingMini({ account }: { account: import('../lib/types').BillingAccount & { payments: import('../lib/types').Payment[] } }) {
  const pastDue = account.status === 'past_due'
  const lastPayment = account.payments?.[0]
  const inner = (
    <div className={pastDue ? '' : 'card'} style={{ padding: pastDue ? 0 : 18 }}>
      <SectionHeader eyebrow="BillingCenter" title="Current Balance" />
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 46, lineHeight: 1, color: pastDue ? 'var(--amber)' : 'var(--text)' }}>
          {fmtGBP(account.balance)}
        </div>
        <Badge variant={account.status} size="xs" />
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-dim)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <span>
          Due <span style={{ color: 'var(--text)' }}>{fmtDate(account.due_date)}</span>
        </span>
        <span>· {account.payment_frequency}</span>
        <span>
          · Autopay{' '}
          <span style={{ color: account.autopay_enabled ? 'var(--green)' : 'var(--text-muted)' }}>
            {account.autopay_enabled ? 'on' : 'off'}
          </span>
        </span>
        <span>
          · Paperless{' '}
          <span style={{ color: account.paperless_enabled ? 'var(--green)' : 'var(--text-muted)' }}>
            {account.paperless_enabled ? 'on' : 'off'}
          </span>
        </span>
      </div>
      {lastPayment && (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 8,
            background: 'var(--surface-2)',
            fontSize: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            Last payment{' '}
            <span style={{ color: 'var(--text-dim)' }}>{fmtRel(lastPayment.created_at)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
              {lastPayment.confirmation_number}
            </span>
            <Badge variant={lastPayment.status} size="xs" />
          </div>
        </div>
      )}
    </div>
  )
  if (pastDue) return <StatusPulse tone="amber">{inner}</StatusPulse>
  return inner
}

function PoliciesTab({ policies }: { policies: ReturnType<typeof useCustomer360>['policies'] }) {
  if (policies.length === 0) {
    return <EmptyState icon={<FileText size={28} />} title="No policies" description="This customer has no policies in force." />
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {policies.map((p, i) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <PolicyCard policy={p} />
        </motion.div>
      ))}
    </div>
  )
}

function PolicyCard({
  policy,
}: {
  policy: Policy & {
    vehicles: import('../lib/types').Vehicle[]
    drivers: import('../lib/types').Driver[]
  }
}) {
  const days = daysUntil(policy.expiration_date)
  const renewalColor = days <= 14 ? 'var(--red)' : days <= 45 ? 'var(--amber)' : 'var(--text-dim)'
  const Icon = policy.type === 'auto' ? Car : policy.type === 'home' ? HomeIcon : Umbrella

  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: 'var(--surface-2)',
            border: '1px solid var(--border-2)',
            display: 'grid',
            placeItems: 'center',
            color: policy.type === 'auto' ? 'var(--sky)' : policy.type === 'home' ? 'var(--green)' : 'var(--gold)',
          }}
        >
          <Icon size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CopyField value={policy.policy_number} mono>{policy.policy_number}</CopyField>
            <Badge variant={policy.type} size="xs" />
            <Badge variant={policy.status} size="xs" />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
            {fmtDate(policy.effective_date)} → {fmtDate(policy.expiration_date)}
            <span style={{ color: renewalColor, marginLeft: 10 }}>
              · Renews in {days}d
            </span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, lineHeight: 1 }}>
            {fmtGBP(policy.premium_amount)}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Annual premium
          </div>
        </div>
      </div>

      {/* Vehicles */}
      {policy.type === 'auto' && policy.vehicles?.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: '0.14em',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Covered Vehicles
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
            {policy.vehicles.map((v) => (
              <div
                key={v.id}
                style={{
                  padding: 12,
                  background: 'var(--surface-2)',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14 }}>
                  {v.year} {v.make} {v.model}
                  {v.trim && <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}> · {v.trim}</span>}
                </div>
                {v.vin && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>
                    VIN {v.vin}
                  </div>
                )}
                <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {v.ownership && <Badge variant={v.ownership} size="xs" />}
                  {v.usage && (
                    <span style={{ fontSize: 10, color: 'var(--text-dim)', alignSelf: 'center' }}>
                      {v.usage}
                      {v.annual_mileage ? ` · ${v.annual_mileage.toLocaleString()}mi/yr` : ''}
                    </span>
                  )}
                </div>
                {v.lienholder_name && (
                  <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-dim)' }}>
                    Lienholder: {v.lienholder_name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Drivers */}
      {policy.drivers?.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: '0.14em',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Rated Drivers
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {policy.drivers.map((d) => (
              <div
                key={d.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  borderRadius: 999,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--border)',
                  fontSize: 12,
                }}
              >
                <Avatar first={d.first_name} last={d.last_name} id={d.id} size={22} />
                <span>
                  {d.first_name} {d.last_name}
                </span>
                {d.is_primary_named_insured && <Star size={12} color="var(--gold)" />}
                {d.relationship && <Badge variant={d.relationship} size="xs" />}
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{d.license_state ?? '—'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Home dwelling */}
      {policy.type === 'home' && policy.dwelling_address && (
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: '0.14em',
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Insured Dwelling
          </div>
          <div
            style={{
              padding: 12,
              borderRadius: 10,
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              fontSize: 13,
            }}
          >
            <JsonAddress value={policy.dwelling_address} />
          </div>
        </div>
      )}
    </div>
  )
}

function ClaimsTab({ claims }: { claims: import('../lib/types').Claim[] }) {
  if (claims.length === 0) {
    return <EmptyState icon={<AlertTriangle size={28} />} title="No claims on file" />
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {claims.map((c, i) => (
        <motion.div
          key={c.id}
          className="card"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          style={{ padding: 16 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16 }}>{c.claim_number}</div>
            <Badge variant={c.loss_type} size="xs" />
            <Badge variant={c.status} size="xs" />
            <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-dim)' }}>
              <CalendarDays size={12} style={{ verticalAlign: -1, marginRight: 4 }} />
              {fmtDate(c.loss_date)}
            </div>
          </div>
          {c.loss_description && (
            <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text)' }}>{c.loss_description}</div>
          )}
          <div style={{ marginTop: 10, display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12 }}>
            {c.loss_location && (
              <div style={{ color: 'var(--text-dim)' }}>
                <MapPin size={12} style={{ verticalAlign: -1, marginRight: 4 }} />
                {c.loss_location}
              </div>
            )}
            {c.police_report_number && (
              <div style={{ color: 'var(--text-dim)' }}>
                Police Report{' '}
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
                  {c.police_report_number}
                </span>
              </div>
            )}
          </div>
          {c.adjuster_name && (
            <div
              style={{
                marginTop: 12,
                padding: 10,
                borderRadius: 8,
                background: 'var(--surface-2)',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: 12,
                alignItems: 'center',
                fontSize: 12,
              }}
            >
              <Avatar first={c.adjuster_name.split(' ')[0]} last={c.adjuster_name.split(' ')[1] ?? ''} id={c.id} size={30} />
              <div>
                <div style={{ fontWeight: 500 }}>{c.adjuster_name}</div>
                <div style={{ color: 'var(--text-dim)' }}>Assigned adjuster</div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {c.adjuster_phone && <CopyField value={c.adjuster_phone} dim>{fmtPhone(c.adjuster_phone)}</CopyField>}
                {c.adjuster_email && <CopyField value={c.adjuster_email} dim>{c.adjuster_email}</CopyField>}
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

function BillingTab({
  account,
  methods,
}: {
  account: (import('../lib/types').BillingAccount & { payments: import('../lib/types').Payment[] }) | null
  methods: import('../lib/types').PaymentMethod[]
}) {
  if (!account) {
    return <EmptyState icon={<Wallet size={28} />} title="No billing account" />
  }
  const methodById = useMemo(() => {
    const m: Record<string, import('../lib/types').PaymentMethod> = {}
    methods.forEach((pm) => (m[pm.id] = pm))
    return m
  }, [methods])
  const failed = account.payments.filter((p) => p.status === 'failed')
  const autopayNudge = !account.autopay_enabled && Number(account.balance) > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card" style={{ padding: 18 }}>
        <SectionHeader eyebrow="Summary" title="Account" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <KV label="Balance" value={fmtGBP(account.balance)} />
          <KV label="Status" value={<Badge variant={account.status} size="xs" />} />
          <KV label="Cadence" value={account.payment_frequency ?? '—'} />
          <KV label="Next due" value={fmtDate(account.due_date)} />
        </div>
      </div>

      {failed.length > 0 && (
        <StatusPulse tone="red">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <ShieldAlert size={28} color="var(--red)" />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 16 }}>
                Payment failed · {failed.length} attempt{failed.length > 1 ? 's' : ''}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 4 }}>
                Most recent {fmtRel(failed[0].created_at)} · {fmtGBPpence(failed[0].amount)}. Retry with the default
                method on file to bring the account current.
              </div>
            </div>
            <button
              style={{
                padding: '10px 16px',
                borderRadius: 8,
                border: '1px solid var(--accent)',
                background: 'linear-gradient(135deg, var(--accent), #3D5A82)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.04em',
                cursor: 'pointer',
                boxShadow: '0 10px 24px rgba(182, 84, 51, 0.28)',
              }}
              onClick={() => alert('Demo only — would retry default payment method.')}
            >
              Retry payment
            </button>
          </div>
        </StatusPulse>
      )}

      {autopayNudge && (
        <div
          className="card"
          style={{
            padding: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderColor: 'var(--amber)',
          }}
        >
          <Zap size={20} color="var(--amber)" />
          <div style={{ flex: 1, fontSize: 13 }}>
            Autopay is off. Enroll to prevent future lapses and save the CSR a call.
          </div>
          <button
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: 0,
              background: 'var(--surface-2)',
              color: 'var(--text)',
              fontSize: 12,
              cursor: 'pointer',
            }}
            onClick={() => alert('Demo only — would enroll in autopay.')}
          >
            Enroll
          </button>
        </div>
      )}

      <div className="card" style={{ padding: 18 }}>
        <SectionHeader eyebrow="BillingCenter" title="Payment History" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
              gap: 10,
              fontSize: 11,
              color: 'var(--text-dim)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '8px 12px',
            }}
          >
            <div>Date</div>
            <div>Amount</div>
            <div>Status</div>
            <div>Method</div>
            <div>Confirmation</div>
          </div>
          {account.payments.map((p) => {
            const pm = p.payment_method_id ? methodById[p.payment_method_id] : undefined
            return (
              <div
                key={p.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                  gap: 10,
                  fontSize: 12,
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'var(--surface-2)',
                  alignItems: 'center',
                }}
              >
                <div>{fmtDate(p.created_at)}</div>
                <div style={{ fontFamily: 'var(--font-mono)' }}>{fmtGBPpence(p.amount)}</div>
                <div><Badge variant={p.status} size="xs" /></div>
                <div style={{ color: 'var(--text-dim)' }}>
                  {pm ? `${pm.brand ?? pm.type} ·${pm.last_four}` : '—'}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{p.confirmation_number}</div>
              </div>
            )
          })}
          {account.payments.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-dim)', fontSize: 12 }}>
              No payments on file.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function QuotesActivityTab({
  quotes,
  authEvents,
}: {
  quotes: import('../lib/types').Quote[]
  authEvents: import('../lib/types').AuthEvent[]
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="card" style={{ padding: 18 }}>
        <SectionHeader
          eyebrow="Quoting"
          title="In-flight Quotes"
          right={
            <Link href="/quotes" style={{ fontSize: 12, color: 'var(--sky)', textDecoration: 'none' }}>
              Start a quote <ArrowUpRight size={12} style={{ verticalAlign: -1 }} />
            </Link>
          }
        />
        {quotes.length === 0 ? (
          <div style={{ padding: 14, color: 'var(--text-dim)', fontSize: 13 }}>
            No active quotes for this customer. Start one to begin the bind flow.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {quotes.map((q) => (
              <div
                key={q.id}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: 'var(--surface-2)',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)' }}>{q.reference_number}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                    {q.coverage_level} · expires {fmtDate(q.expires_at)}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>{fmtGBP(q.estimated_premium)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ padding: 18 }}>
        <SectionHeader eyebrow="Identity audit" title="Auth Events" />
        {authEvents.length === 0 ? (
          <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>No auth events logged.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {authEvents.slice(0, 12).map((e) => (
              <div
                key={e.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '10px 1fr 1fr 1fr 1fr',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'var(--surface-2)',
                  fontSize: 12,
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: e.result === 'success' ? 'var(--green)' : 'var(--red)',
                  }}
                />
                <span>{e.event_type}</span>
                <span style={{ color: 'var(--text-dim)' }}>{e.delivery_method ?? '—'}</span>
                <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{e.ip_address ?? '—'}</span>
                <span style={{ color: 'var(--text-dim)', textAlign: 'right' }}>{fmtRel(e.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div
        style={{
          fontSize: 10,
          letterSpacing: '0.14em',
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 4, fontSize: 14 }}>{value}</div>
    </div>
  )
}
