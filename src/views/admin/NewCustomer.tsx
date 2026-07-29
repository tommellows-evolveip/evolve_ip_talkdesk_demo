'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserPlus, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react'
import { AdminGate } from './AdminGate'
import { Badge } from '../../components/shared/Badge'
import { fmtGBP } from '../../lib/format'

type Summary = {
  customer: { cid: string; first_name: string; last_name: string; email: string; phone: string; city: string }
  policy: { id: string; policy_number: string; premium_amount: number }
  vehicle: { id: string; year: number; make: string; model: string; ownership: string }
  driver: { id: string; date_of_birth: string; license_number: string }
  billing: { id: string; status: string; payment_frequency: string; balance: number }
  payment_method: { id: string; brand: string | null; type: string; last_four: string }
  payment: { id: string; confirmation_number: string; amount: number; status: string }
}

export function NewCustomer() {
  return (
    <AdminGate>
      <NewCustomerForm />
    </AdminGate>
  )
}

function NewCustomerForm() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<Summary | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, phone }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(body.error ?? 'Could not create customer')
        setLoading(false)
        return
      }
      setSummary(body.summary as Summary)
      setLoading(false)
    } catch {
      setError('Network error — please try again')
      setLoading(false)
    }
  }

  function resetForm() {
    setFirstName('')
    setLastName('')
    setEmail('')
    setPhone('')
    setSummary(null)
    setError(null)
  }

  if (summary) {
    return (
      <div style={{ maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div
          className="card"
          style={{
            padding: 22,
            display: 'flex',
            gap: 14,
            alignItems: 'center',
            borderColor: 'var(--green)',
          }}
        >
          <CheckCircle2 size={28} color="var(--green)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20 }}>
              {summary.customer.first_name} {summary.customer.last_name} added
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>
              Synthetic policy, vehicle, billing, and payment generated. Mailing city: {summary.customer.city}.
            </div>
          </div>
          <Link
            href={`/customers/${summary.customer.cid}`}
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--accent), #3D5A82)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 10px 24px rgba(182, 84, 51, 0.28)',
            }}
          >
            View customer <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: 12 }}>
            Generated data
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <KV label="Policy" value={`${summary.policy.policy_number} · ${fmtGBP(summary.policy.premium_amount)}/yr`} />
            <KV label="Vehicle" value={`${summary.vehicle.year} ${summary.vehicle.make} ${summary.vehicle.model}`} extra={<Badge variant={summary.vehicle.ownership} size="xs" />} />
            <KV label="Driver DOB" value={summary.driver.date_of_birth} extra={<span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>TX {summary.driver.license_number}</span>} />
            <KV
              label="Billing"
              value={`${fmtGBP(summary.billing.balance)} · ${summary.billing.payment_frequency}`}
              extra={<Badge variant={summary.billing.status} size="xs" />}
            />
            <KV
              label="Payment method"
              value={`${summary.payment_method.brand ?? summary.payment_method.type} ····${summary.payment_method.last_four}`}
            />
            <KV
              label="Last payment"
              value={<span style={{ fontFamily: 'var(--font-mono)' }}>{summary.payment.confirmation_number}</span>}
              extra={<Badge variant={summary.payment.status} size="xs" />}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={resetForm}
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              border: '1px solid var(--border-2)',
              background: 'var(--surface-2)',
              color: 'var(--text)',
              fontSize: 13,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <UserPlus size={14} /> Add another
          </button>
          <button
            onClick={() => router.push('/customers')}
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              border: '1px solid var(--border-2)',
              background: 'transparent',
              color: 'var(--text-dim)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Back to customers
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, var(--accent), #3D5A82)',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              boxShadow: '0 10px 22px rgba(182, 84, 51, 0.32)',
            }}
          >
            <UserPlus size={20} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, letterSpacing: '-0.01em', lineHeight: 1.05 }}>
              Add customer
            </div>
            <div style={{ fontSize: 11, color: 'var(--accent-deep)', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginTop: 4 }}>
              Admin · Demo Provisioning
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
            padding: '12px 14px',
            borderRadius: 10,
            background: 'rgba(192, 123, 44, 0.10)',
            border: '1px solid rgba(192, 123, 44, 0.35)',
            color: 'var(--text)',
            fontSize: 12,
            marginBottom: 18,
            lineHeight: 1.5,
          }}
        >
          <Sparkles size={16} color="var(--accent-deep)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            Provide just identity. A TX address, auto policy, vehicle, driver, billing, and first payment will be generated automatically.
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="First name" value={firstName} onChange={setFirstName} autoFocus required />
            <Field label="Last name" value={lastName} onChange={setLastName} required />
          </div>
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <Field
            label="Phone (E.164)"
            value={phone}
            onChange={setPhone}
            required
            placeholder="+447911123456"
            hint="Include country code with +. 8–15 digits."
          />

          {error && (
            <div
              style={{
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

          <button
            type="submit"
            disabled={loading || !firstName || !lastName || !email || !phone}
            style={{
              marginTop: 6,
              padding: '12px 16px',
              borderRadius: 10,
              border: 0,
              background: loading ? 'var(--surface-2)' : 'linear-gradient(135deg, var(--accent), #3D5A82)',
              color: loading ? 'var(--text-dim)' : '#fff',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: loading ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: loading ? 'none' : '0 10px 24px rgba(182, 84, 51, 0.28)',
            }}
          >
            {loading ? 'Generating…' : (<>Create customer <ArrowRight size={14} /></>)}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  autoFocus,
  required,
  hint,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  autoFocus?: boolean
  required?: boolean
  hint?: string
  placeholder?: string
  type?: string
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
        {label}
      </span>
      <div
        style={{
          background: 'var(--surface-2)',
          border: '1px solid var(--border-2)',
          borderRadius: 10,
          padding: '10px 14px',
        }}
      >
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
          required={required}
          placeholder={placeholder}
          style={{
            width: '100%',
            background: 'transparent',
            border: 0,
            outline: 'none',
            color: 'var(--text)',
            fontSize: 14,
            fontFamily: 'var(--font-body)',
          }}
        />
      </div>
      {hint && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>{hint}</span>}
    </label>
  )
}

function KV({ label, value, extra }: { label: string; value: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ marginTop: 4, fontSize: 14, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span>{value}</span>
        {extra}
      </div>
    </div>
  )
}
