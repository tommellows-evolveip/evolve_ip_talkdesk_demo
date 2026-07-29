'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { UserPlus, ArrowRight, CheckCircle2 } from 'lucide-react'
import { AdminGate } from './AdminGate'

export function NewAgent() {
  return (
    <AdminGate>
      <NewAgentForm />
    </AdminGate>
  )
}

function NewAgentForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('csr')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [created, setCreated] = useState<{ email: string; full_name: string; role: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/admin/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: fullName, role, password }),
      })
      const body = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(body.error ?? 'Could not create agent')
        setLoading(false)
        return
      }
      setCreated(body.agent)
      setLoading(false)
    } catch {
      setError('Network error — please try again')
      setLoading(false)
    }
  }

  function resetForm() {
    setEmail('')
    setFullName('')
    setRole('csr')
    setPassword('')
    setCreated(null)
    setError(null)
  }

  if (created) {
    return (
      <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div
          className="card"
          style={{ padding: 22, display: 'flex', gap: 14, alignItems: 'center', borderColor: 'var(--green)' }}
        >
          <CheckCircle2 size={28} color="var(--green)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20 }}>
              {created.full_name} added
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>
              Role: {created.role} · Must change password on first login
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={resetForm} style={secondaryBtnStyle}>
            <UserPlus size={14} /> Add another
          </button>
          <button onClick={() => router.push('/admin/agents')} style={ghostBtnStyle}>
            Back to agents
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <Link
        href="/admin/agents"
        style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none', marginBottom: 14 }}
      >
        ← Back to agents
      </Link>

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
              Add agent
            </div>
            <div style={{ fontSize: 11, color: 'var(--accent-deep)', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginTop: 4 }}>
              Admin · Agent Provisioning
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Full name" value={fullName} onChange={setFullName} autoFocus required />
          <Field label="Email" type="email" value={email} onChange={setEmail} required />

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={labelStyle}>Role</span>
            <div style={inputWrapStyle}>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 0,
                  outline: 'none',
                  color: 'var(--text)',
                  fontSize: 14,
                  fontFamily: 'var(--font-body)',
                }}
              >
                <option value="csr">CSR</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </label>

          <Field
            label="Temporary password"
            type="password"
            value={password}
            onChange={setPassword}
            required
            hint="Min 8 characters. Agent must change on first login."
          />

          {error && (
            <div style={errorStyle}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !fullName || !email || password.length < 8}
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
            {loading ? 'Creating…' : (<>Create agent <ArrowRight size={14} /></>)}
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
      <span style={labelStyle}>{label}</span>
      <div style={inputWrapStyle}>
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

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.14em',
  color: 'var(--text-dim)',
  textTransform: 'uppercase',
  fontWeight: 700,
}

const inputWrapStyle: React.CSSProperties = {
  background: 'var(--surface-2)',
  border: '1px solid var(--border-2)',
  borderRadius: 10,
  padding: '10px 14px',
}

const errorStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 8,
  background: 'rgba(165, 63, 43, 0.10)',
  border: '1px solid rgba(165, 63, 43, 0.35)',
  color: '#0D1826',
  fontSize: 12,
}

const secondaryBtnStyle: React.CSSProperties = {
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
}

const ghostBtnStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 10,
  border: '1px solid var(--border-2)',
  background: 'transparent',
  color: 'var(--text-dim)',
  fontSize: 13,
  cursor: 'pointer',
}
