'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react'
import type { SessionAgent } from '@/lib/agent-types'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [agent, setAgent] = useState<SessionAgent | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setAgent(d.agent ?? null))
      .catch(() => setAgent(null))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation don't match")
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      })
      if (res.ok) {
        router.push('/')
        router.refresh()
      } else {
        const body = await res.json().catch(() => ({}))
        setError(body.error ?? 'Could not change password')
        setLoading(false)
      }
    } catch {
      setError('Network error — please try again')
      setLoading(false)
    }
  }

  const forced = agent?.must_change_password === true

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
          maxWidth: 460,
          padding: 36,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: forced
                ? 'linear-gradient(135deg, #C07B2C, #8f381f)'
                : 'linear-gradient(135deg, #b65433, #8f381f)',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              boxShadow: '0 10px 22px rgba(182, 84, 51, 0.32)',
            }}
          >
            {forced ? <ShieldAlert size={20} /> : <Lock size={20} />}
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 24,
                letterSpacing: '-0.01em',
                lineHeight: 1.05,
                color: 'var(--ink)',
              }}
            >
              {forced ? 'Set a new password' : 'Change password'}
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
              Harrier · CSR Workbench
            </div>
          </div>
        </div>

        {forced && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: 'rgba(192, 123, 44, 0.10)',
              border: '1px solid rgba(192, 123, 44, 0.35)',
              color: 'var(--text)',
              fontSize: 13,
              marginBottom: 18,
              lineHeight: 1.45,
            }}
          >
            Your password was set by an administrator. Please change it before continuing.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoFocus
            required
          />
          <Field
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
            required
            hint="At least 8 characters"
          />
          <Field
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
          />

          {error && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                background: 'rgba(165, 63, 43, 0.10)',
                border: '1px solid rgba(165, 63, 43, 0.35)',
                color: '#8f381f',
                fontSize: 12,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            style={{
              marginTop: 6,
              padding: '12px 16px',
              borderRadius: 10,
              border: 0,
              background: loading
                ? 'var(--surface-2)'
                : 'linear-gradient(135deg, var(--accent), #cf7746)',
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
            {loading ? 'Updating…' : (
              <>
                Update password <ArrowRight size={14} />
              </>
            )}
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
}: {
  label: string
  value: string
  onChange: (v: string) => void
  autoFocus?: boolean
  required?: boolean
  hint?: string
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
        <Lock size={14} />
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus={autoFocus}
          required={required}
          autoComplete="new-password"
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
      {hint && (
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 2 }}>{hint}</span>
      )}
    </label>
  )
}
