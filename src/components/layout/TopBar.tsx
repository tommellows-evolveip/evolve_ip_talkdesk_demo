'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LogOut, KeyRound } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Customer } from '../../lib/types'
import type { SessionAgent } from '../../lib/agent-types'

const TITLES: Record<string, string> = {
  '/': 'Book Overview',
  '/customers': 'Customers',
  '/policies': 'PolicyCenter',
  '/claims': 'ClaimCenter',
  '/billing': 'BillingCenter',
  '/quotes': 'Quotes',
  '/activity': 'Auth & Activity',
}

export function TopBar() {
  const pathname = usePathname() ?? '/'
  const router = useRouter()
  const customerMatch = pathname.match(/^\/customers\/([^/]+)$/)
  const id = customerMatch?.[1]

  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null)
  const [agent, setAgent] = useState<SessionAgent | null>(null)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => setAgent(d.agent ?? null))
      .catch(() => setAgent(null))
  }, [])

  useEffect(() => {
    let ignore = false
    if (!id) {
      setActiveCustomer(null)
      return
    }
    supabase
      .from('customers')
      .select('*')
      .eq('cid', id)
      .maybeSingle()
      .then(({ data }) => {
        if (!ignore) setActiveCustomer((data as Customer) ?? null)
      })
    return () => {
      ignore = true
    }
  }, [id])

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const title = id ? 'Customer 360' : TITLES[pathname] ?? 'Harrier Core'

  return (
    <header
      style={{
        height: 60,
        background: 'rgba(255, 250, 245, 0.82)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 5,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 24,
            letterSpacing: '-0.01em',
            color: 'var(--ink)',
          }}
        >
          {title}
        </div>
        {activeCustomer && (
          <Link
            href={`/customers/${activeCustomer.cid}`}
            style={{
              display: 'inline-flex',
              gap: 8,
              alignItems: 'center',
              padding: '6px 12px',
              border: '1px solid var(--border-2)',
              borderRadius: 999,
              fontSize: 12,
              color: 'var(--muted)',
              textDecoration: 'none',
              background: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            <span style={{ color: 'var(--ink)', fontWeight: 600 }}>
              {activeCustomer.first_name} {activeCustomer.last_name}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>·</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{activeCustomer.cid.slice(0, 8)}</span>
          </Link>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, color: 'var(--muted)', fontSize: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: 'var(--pine)',
              boxShadow: '0 0 10px rgba(23, 64, 59, 0.4)',
              animation: 'topbar-pulse 1.8s ease-in-out infinite',
            }}
          />
          <span
            style={{
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              fontSize: 10,
              color: 'var(--accent-deep)',
              fontWeight: 700,
            }}
          >
            Core Sync
          </span>
        </div>
        {agent && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ textAlign: 'right', lineHeight: 1.15 }}>
              <div style={{ color: 'var(--ink)', fontWeight: 600, fontSize: 13 }}>
                {agent.full_name}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.14em',
                  fontWeight: 700,
                }}
              >
                {agent.role}
              </div>
            </div>
            <Link
              href="/change-password"
              title="Change password"
              aria-label="Change password"
              style={{
                background: 'transparent',
                border: '1px solid var(--border-2)',
                borderRadius: 8,
                padding: 8,
                color: 'var(--text-dim)',
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none',
                transition: 'all 150ms',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-deep)'
                ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--accent)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-dim)'
                ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border-2)'
              }}
            >
              <KeyRound size={14} />
            </Link>
            <button
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
              style={{
                background: 'transparent',
                border: '1px solid var(--border-2)',
                borderRadius: 8,
                padding: 8,
                cursor: 'pointer',
                color: 'var(--text-dim)',
                display: 'inline-flex',
                alignItems: 'center',
                transition: 'all 150ms',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--accent-deep)'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-dim)'
                ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-2)'
              }}
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
      <style>{`@keyframes topbar-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.45 } }`}</style>
    </header>
  )
}
