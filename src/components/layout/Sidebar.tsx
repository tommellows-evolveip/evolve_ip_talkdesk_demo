'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FileText,
  AlertTriangle,
  CreditCard,
  FilePlus,
  ShieldCheck,
  UserCog,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useSessionAgent } from '../../hooks/useSessionAgent'

type Item = { to: string; icon: LucideIcon; label: string; adminOnly?: boolean }
const ITEMS: Item[] = [
  { to: '/', icon: LayoutDashboard, label: 'Book Overview' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/policies', icon: FileText, label: 'PolicyCenter' },
  { to: '/claims', icon: AlertTriangle, label: 'ClaimCenter' },
  { to: '/billing', icon: CreditCard, label: 'BillingCenter' },
  { to: '/quotes', icon: FilePlus, label: 'Quotes' },
  { to: '/activity', icon: ShieldCheck, label: 'Auth & Activity' },
  { to: '/admin/agents', icon: UserCog, label: 'Agents', adminOnly: true },
]

export function Sidebar() {
  const pathname = usePathname() ?? '/'
  const { isAdmin } = useSessionAgent()
  const visibleItems = ITEMS.filter((item) => !item.adminOnly || isAdmin)
  return (
    <aside
      style={{
        width: 232,
        flexShrink: 0,
        minHeight: '100vh',
        background: 'rgba(255, 250, 245, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRight: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        padding: '16px 0',
        overflow: 'hidden',
        zIndex: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
          padding: '4px 20px 16px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Image
          src="/harrier-logo.png"
          alt="Harrier Insurance"
          width={438}
          height={438}
          priority
          style={{ width: '100%', height: 'auto', maxWidth: 168 }}
        />
        <div
          style={{
            fontSize: 10,
            color: 'var(--accent-deep)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          Core · CSR Workbench
        </div>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', padding: '12px 0' }}>
        {visibleItems.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to)
          return (
            <Link
              key={to}
              href={to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '10px 22px',
                color: isActive ? 'var(--accent-deep)' : 'var(--muted)',
                borderLeft: `3px solid ${isActive ? 'var(--accent)' : 'transparent'}`,
                background: isActive
                  ? 'linear-gradient(90deg, rgba(182, 84, 51, 0.12), transparent)'
                  : 'transparent',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'color 150ms, background 150ms',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
      <div style={{ marginTop: 'auto', padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: 'var(--pine)',
              boxShadow: '0 0 8px rgba(23, 64, 59, 0.5)',
            }}
          />
          <span
            style={{
              fontSize: 10,
              color: 'var(--accent-deep)',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              fontWeight: 700,
            }}
          >
            Core Live
          </span>
        </div>
      </div>
    </aside>
  )
}
