'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Save, ArrowLeft, Pencil } from 'lucide-react'
import { AdminGate } from './AdminGate'
import { supabase } from '../../lib/supabase'
import type { Customer } from '../../lib/types'

export function EditCustomer() {
  return (
    <AdminGate>
      <EditCustomerInner />
    </AdminGate>
  )
}

function EditCustomerInner() {
  const router = useRouter()
  const { cid } = useParams<{ cid: string }>()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('customers')
      .select('cid, first_name, last_name, email, phone, source, mailing_address, created_at, updated_at')
      .eq('cid', cid)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        const c = data as Customer | null
        setCustomer(c)
        if (c) {
          setFirstName(c.first_name)
          setLastName(c.last_name)
          setEmail(c.email)
          setPhone(c.phone)
        }
        setLoadingInitial(false)
      })
    return () => {
      cancelled = true
    }
  }, [cid])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!customer) return
    setError(null)

    const patch: Record<string, string> = {}
    if (firstName !== customer.first_name) patch.first_name = firstName
    if (lastName !== customer.last_name) patch.last_name = lastName
    if (email !== customer.email) patch.email = email
    if (phone !== customer.phone) patch.phone = phone

    if (Object.keys(patch).length === 0) {
      setError('No changes to save')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/customers/${customer.cid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(body.error ?? 'Could not save changes')
        setSaving(false)
        return
      }
      setCustomer({ ...customer, ...body.customer })
      setSavedFlash(true)
      setSaving(false)
      setTimeout(() => setSavedFlash(false), 2400)
    } catch {
      setError('Network error — please try again')
      setSaving(false)
    }
  }

  if (loadingInitial) {
    return <div style={{ padding: 40, color: 'var(--text-dim)' }}>Loading customer…</div>
  }
  if (!customer) {
    return (
      <div className="card" style={{ padding: 22, maxWidth: 520 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18 }}>Customer not found</div>
        <div style={{ marginTop: 4, fontSize: 13, color: 'var(--text-dim)' }}>
          The customer may have been removed.
        </div>
        <button
          onClick={() => router.push('/customers')}
          style={{
            marginTop: 14,
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid var(--border-2)',
            background: 'var(--surface-2)',
            cursor: 'pointer',
            fontSize: 13,
          }}
        >
          Back to customers
        </button>
      </div>
    )
  }

  const dirty =
    firstName !== customer.first_name ||
    lastName !== customer.last_name ||
    email !== customer.email ||
    phone !== customer.phone

  return (
    <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Link
        href={`/customers/${customer.cid}`}
        style={{
          display: 'inline-flex',
          gap: 6,
          alignItems: 'center',
          fontSize: 12,
          color: 'var(--text-dim)',
          textDecoration: 'none',
        }}
      >
        <ArrowLeft size={12} /> Back to customer
      </Link>

      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #4A7291, #234060)',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
            }}
          >
            <Pencil size={20} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1.05 }}>
              Edit customer
            </div>
            <div style={{ fontSize: 11, color: 'var(--accent-deep)', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginTop: 4 }}>
              Admin · {customer.cid.slice(0, 8)}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="First name" value={firstName} onChange={setFirstName} required />
            <Field label="Last name" value={lastName} onChange={setLastName} required />
          </div>
          <Field label="Email" type="email" value={email} onChange={setEmail} required />
          <Field label="Phone (E.164)" value={phone} onChange={setPhone} required />

          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Name changes also sync to the primary named insured driver row on this customer&apos;s policies.
          </div>

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
          {savedFlash && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: 'rgba(23, 64, 59, 0.10)',
                border: '1px solid rgba(23, 64, 59, 0.35)',
                color: '#2F6B5E',
                fontSize: 12,
              }}
            >
              Changes saved.
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !dirty}
            style={{
              marginTop: 6,
              padding: '12px 16px',
              borderRadius: 10,
              border: 0,
              background: saving || !dirty ? 'var(--surface-2)' : 'linear-gradient(135deg, var(--accent), #3D5A82)',
              color: saving || !dirty ? 'var(--text-dim)' : '#fff',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: saving ? 'wait' : !dirty ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Save size={14} /> {saving ? 'Saving…' : 'Save changes'}
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
  required,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  type?: string
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 10, letterSpacing: '0.14em', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
        {label}
      </span>
      <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: 10, padding: '10px 14px' }}>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
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
    </label>
  )
}
