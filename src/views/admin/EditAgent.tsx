'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Save, Pencil } from 'lucide-react'
import { AdminGate } from './AdminGate'
import { useSessionAgent } from '../../hooks/useSessionAgent'

type Agent = {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  must_change_password: boolean
  last_login_at: string | null
  created_at: string
}

export function EditAgent() {
  return (
    <AdminGate>
      <EditAgentInner />
    </AdminGate>
  )
}

function EditAgentInner() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const { agent: me } = useSessionAgent()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/admin/agents')
      .then((r) => r.json())
      .then((body) => {
        if (cancelled) return
        const found = (body.agents ?? []).find((a: Agent) => a.id === id)
        setAgent(found ?? null)
        if (found) {
          setFullName(found.full_name)
          setRole(found.role)
          setIsActive(found.is_active)
        }
        setLoadingInitial(false)
      })
      .catch(() => !cancelled && setLoadingInitial(false))
    return () => { cancelled = true }
  }, [id])

  const isSelf = me?.id === agent?.id

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!agent) return
    setError(null)

    const patch: Record<string, unknown> = {}
    if (fullName !== agent.full_name) patch.full_name = fullName
    if (role !== agent.role) patch.role = role
    if (isActive !== agent.is_active) patch.is_active = isActive

    if (Object.keys(patch).length === 0) {
      setError('No changes to save')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/agents/${agent.id}`, {
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
      setAgent(body.agent)
      setSavedFlash(true)
      setSaving(false)
      setTimeout(() => setSavedFlash(false), 2400)
    } catch {
      setError('Network error — please try again')
      setSaving(false)
    }
  }

  if (loadingInitial) return <div style={{ padding: 40, color: 'var(--text-dim)' }}>Loading agent…</div>
  if (!agent) {
    return (
      <div className="card" style={{ padding: 22, maxWidth: 520 }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18 }}>Agent not found</div>
        <button onClick={() => router.push('/admin/agents')} style={{ marginTop: 14, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-2)', background: 'var(--surface-2)', cursor: 'pointer', fontSize: 13 }}>
          Back to agents
        </button>
      </div>
    )
  }

  const dirty = fullName !== agent.full_name || role !== agent.role || isActive !== agent.is_active

  return (
    <div style={{ maxWidth: 520, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Link
        href="/admin/agents"
        style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 12, color: 'var(--text-dim)', textDecoration: 'none' }}
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
              Edit agent
            </div>
            <div style={{ fontSize: 11, color: 'var(--accent-deep)', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginTop: 4 }}>
              Admin · {agent.email}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Full name" value={fullName} onChange={setFullName} required />

          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
            Email: <span style={{ fontFamily: 'var(--font-mono)' }}>{agent.email}</span>
            <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-muted)' }}>(not editable)</span>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={labelStyle}>Role</span>
            <div style={inputWrapStyle}>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={isSelf}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 0,
                  outline: 'none',
                  color: 'var(--text)',
                  fontSize: 14,
                  fontFamily: 'var(--font-body)',
                  opacity: isSelf ? 0.5 : 1,
                }}
              >
                <option value="csr">CSR</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {isSelf && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>You cannot change your own role</span>}
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: isSelf ? 'not-allowed' : 'pointer' }}>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={isSelf}
              style={{ width: 16, height: 16 }}
            />
            <span style={{ fontSize: 14 }}>Active</span>
            {isSelf && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>You cannot deactivate yourself</span>}
          </label>

          {error && <div style={errorStyle}>{error}</div>}
          {savedFlash && (
            <div style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(23, 64, 59, 0.10)', border: '1px solid rgba(23, 64, 59, 0.35)', color: '#2F6B5E', fontSize: 12 }}>
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
      <span style={labelStyle}>{label}</span>
      <div style={inputWrapStyle}>
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
