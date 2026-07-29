'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })
      if (res.ok) {
        router.push('/')
        router.refresh()
      } else {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'Login failed')
        setLoading(false)
      }
    } catch {
      setError('Network error — please try again')
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 420,
          padding: 36,
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              overflow: 'hidden',
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 10px 22px rgba(22, 38, 61, 0.32)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/harrier-logo.png" alt="Harrier Insurance" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 28,
                letterSpacing: '-0.01em',
                lineHeight: 1,
                color: 'var(--ink)',
              }}
            >
              Harrier
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--accent-deep)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 700,
                marginTop: 4,
              }}
            >
              Core · CSR Workbench
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field
            icon={<Mail size={14} />}
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            autoFocus
            required
          />
          <Field
            icon={<Lock size={14} />}
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            required
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
            disabled={loading || !email || !password}
            style={{
              marginTop: 6,
              padding: '12px 16px',
              borderRadius: 10,
              border: 0,
              background: loading
                ? 'var(--surface-2)'
                : 'linear-gradient(135deg, var(--accent), #3D5A82)',
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
              transition: 'all 150ms',
            }}
          >
            {loading ? 'Signing in…' : (
              <>
                Sign in <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        <div
          style={{
            marginTop: 24,
            paddingTop: 16,
            borderTop: '1px solid var(--border)',
            fontSize: 11,
            color: 'var(--text-muted)',
            letterSpacing: '0.04em',
            textAlign: 'center',
          }}
        >
          Authorized Harrier staff only. Access is logged.
        </div>
      </div>
    </div>
  )
}

function Field({
  icon,
  label,
  type,
  value,
  onChange,
  autoFocus,
  required,
}: {
  icon: React.ReactNode
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  autoFocus?: boolean
  required?: boolean
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span
        style={{
          fontSize: 10,
          letterSpacing: '0.14em',
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--surface-2)',
          border: '1px solid var(--border-2)',
          borderRadius: 10,
          padding: '10px 14px',
          color: 'var(--text-dim)',
        }}
      >
        {icon}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
          required={required}
          autoComplete={type === 'password' ? 'current-password' : 'email'}
          style={{
            flex: 1,
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
