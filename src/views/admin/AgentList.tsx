'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UserPlus, Pencil, Trash2, KeyRound, Shield, ShieldCheck, ShieldAlert } from 'lucide-react'
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

export function AgentList() {
  return (
    <AdminGate>
      <AgentListInner />
    </AdminGate>
  )
}

function AgentListInner() {
  const { agent: me } = useSessionAgent()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null)
  const [confirmName, setConfirmName] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [resetTarget, setResetTarget] = useState<Agent | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [resetting, setResetting] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)

  async function loadAgents() {
    const res = await fetch('/api/admin/agents')
    const body = await res.json().catch(() => ({}))
    if (res.ok) {
      setAgents(body.agents ?? [])
    } else {
      setError(body.error ?? 'Failed to load agents')
    }
    setLoading(false)
  }

  useEffect(() => { loadAgents() }, [])

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const res = await fetch(`/api/admin/agents/${deleteTarget.id}`, { method: 'DELETE' })
    const body = await res.json().catch(() => ({}))
    if (res.ok) {
      setAgents((prev) => prev.filter((a) => a.id !== deleteTarget.id))
      showFlash(`${deleteTarget.full_name} deleted`)
    } else {
      setError(body.error ?? 'Delete failed')
    }
    setDeleteTarget(null)
    setConfirmName('')
    setDeleting(false)
  }

  async function handleResetPassword() {
    if (!resetTarget) return
    setResetting(true)
    const res = await fetch(`/api/admin/agents/${resetTarget.id}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: resetPassword }),
    })
    const body = await res.json().catch(() => ({}))
    if (res.ok) {
      showFlash(`Password reset for ${resetTarget.full_name}`)
      setAgents((prev) =>
        prev.map((a) => (a.id === resetTarget.id ? { ...a, must_change_password: true } : a)),
      )
    } else {
      setError(body.error ?? 'Reset failed')
    }
    setResetTarget(null)
    setResetPassword('')
    setResetting(false)
  }

  function showFlash(msg: string) {
    setFlash(msg)
    setTimeout(() => setFlash(null), 3000)
  }

  const roleIcon = (role: string) => {
    if (role === 'admin') return <ShieldAlert size={14} color="var(--accent)" />
    if (role === 'supervisor') return <ShieldCheck size={14} color="var(--pine)" />
    return <Shield size={14} color="var(--text-dim)" />
  }

  if (loading) return <div style={{ padding: 40, color: 'var(--text-dim)' }}>Loading agents…</div>

  return (
    <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '-0.01em' }}>
            Agent Management
          </div>
          <div style={{ fontSize: 11, color: 'var(--accent-deep)', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginTop: 4 }}>
            Admin · {agents.length} agent{agents.length !== 1 ? 's' : ''}
          </div>
        </div>
        <Link
          href="/admin/agents/new"
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
          <UserPlus size={14} /> Add agent
        </Link>
      </div>

      {flash && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(23, 64, 59, 0.10)', border: '1px solid rgba(23, 64, 59, 0.35)', color: '#2F6B5E', fontSize: 12 }}>
          {flash}
        </div>
      )}
      {error && (
        <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(165, 63, 43, 0.10)', border: '1px solid rgba(165, 63, 43, 0.35)', color: '#0D1826', fontSize: 12 }}>
          {error}
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Status</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => {
              const isSelf = me?.id === agent.id
              return (
                <tr key={agent.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 600 }}>{agent.full_name}</span>
                    {isSelf && <span style={{ fontSize: 10, color: 'var(--accent)', marginLeft: 6 }}>(you)</span>}
                    {agent.must_change_password && (
                      <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 6 }}>must change pw</span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, fontFamily: 'var(--font-mono)', fontSize: 12 }}>{agent.email}</td>
                  <td style={tdStyle}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {roleIcon(agent.role)}
                      {agent.role}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 600,
                        background: agent.is_active ? 'rgba(23, 64, 59, 0.12)' : 'rgba(165, 63, 43, 0.12)',
                        color: agent.is_active ? 'var(--pine)' : '#0D1826',
                      }}
                    >
                      {agent.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Link
                        href={`/admin/agents/${agent.id}/edit`}
                        title="Edit"
                        style={iconBtnStyle}
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        title="Reset password"
                        onClick={() => { setResetTarget(agent); setResetPassword('') }}
                        style={iconBtnStyle}
                      >
                        <KeyRound size={14} />
                      </button>
                      {!isSelf && (
                        <button
                          title="Delete"
                          onClick={() => { setDeleteTarget(agent); setConfirmName('') }}
                          style={{ ...iconBtnStyle, color: '#0D1826' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {deleteTarget && (
        <Modal onClose={() => setDeleteTarget(null)}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, marginBottom: 8 }}>
            Delete {deleteTarget.full_name}?
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 14 }}>
            This will permanently remove the agent. Type their full name to confirm.
          </div>
          <input
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            placeholder={deleteTarget.full_name}
            style={modalInputStyle}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
            <button onClick={() => setDeleteTarget(null)} style={modalCancelStyle}>Cancel</button>
            <button
              onClick={handleDelete}
              disabled={confirmName !== deleteTarget.full_name || deleting}
              style={{
                ...modalConfirmStyle,
                opacity: confirmName !== deleteTarget.full_name || deleting ? 0.5 : 1,
                cursor: confirmName !== deleteTarget.full_name || deleting ? 'not-allowed' : 'pointer',
              }}
            >
              {deleting ? 'Deleting…' : 'Delete agent'}
            </button>
          </div>
        </Modal>
      )}

      {resetTarget && (
        <Modal onClose={() => setResetTarget(null)}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, marginBottom: 8 }}>
            Reset password for {resetTarget.full_name}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 14 }}>
            Set a new temporary password. The agent will be required to change it on next login.
          </div>
          <input
            type="password"
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
            placeholder="New password (min 8 characters)"
            style={modalInputStyle}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 14, justifyContent: 'flex-end' }}>
            <button onClick={() => setResetTarget(null)} style={modalCancelStyle}>Cancel</button>
            <button
              onClick={handleResetPassword}
              disabled={resetPassword.length < 8 || resetting}
              style={{
                ...modalConfirmStyle,
                background: 'linear-gradient(135deg, var(--accent), #3D5A82)',
                opacity: resetPassword.length < 8 || resetting ? 0.5 : 1,
                cursor: resetPassword.length < 8 || resetting ? 'not-allowed' : 'pointer',
              }}
            >
              {resetting ? 'Resetting…' : 'Reset password'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{ padding: 24, minWidth: 380, maxWidth: 460 }}
      >
        {children}
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: 10,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: 'var(--text-dim)',
  fontWeight: 700,
}

const tdStyle: React.CSSProperties = {
  padding: '10px 14px',
}

const iconBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 30,
  height: 30,
  borderRadius: 8,
  border: '1px solid var(--border-2)',
  background: 'var(--surface-2)',
  cursor: 'pointer',
  color: 'var(--text-dim)',
}

const modalInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid var(--border-2)',
  background: 'var(--surface-2)',
  color: 'var(--text)',
  fontSize: 14,
  fontFamily: 'var(--font-body)',
  outline: 'none',
}

const modalCancelStyle: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: 8,
  border: '1px solid var(--border-2)',
  background: 'var(--surface-2)',
  cursor: 'pointer',
  fontSize: 13,
}

const modalConfirmStyle: React.CSSProperties = {
  padding: '8px 14px',
  borderRadius: 8,
  border: 0,
  background: '#0D1826',
  color: '#fff',
  fontSize: 13,
  fontWeight: 700,
}
