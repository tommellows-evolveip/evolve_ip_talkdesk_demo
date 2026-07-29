const ORDER: { key: string; label: string; color: string }[] = [
  { key: 'reported',            label: 'Reported',            color: '#16263D' }, // rust
  { key: 'assigned',            label: 'Assigned',            color: '#2C3B5C' }, // indigo-slate
  { key: 'under_investigation', label: 'Under Investigation', color: '#B8790B' }, // burnt orange
  { key: 'estimate_pending',    label: 'Estimate Pending',    color: '#D9A62A' }, // gold
  { key: 'closed',              label: 'Closed',              color: '#5A6B80' }, // muted slate
]

export function ClaimFunnel({ counts }: { counts: Record<string, number> }) {
  const max = Math.max(1, ...ORDER.map((s) => counts[s.key] ?? 0))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {ORDER.map((s) => {
        const v = counts[s.key] ?? 0
        const pct = (v / max) * 100
        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 160,
                fontSize: 11,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontWeight: 700,
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                flex: 1,
                height: 22,
                background: 'rgba(27, 34, 48, 0.06)',
                borderRadius: 999,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  minWidth: v > 0 ? 28 : 0,
                  background: `linear-gradient(90deg, ${s.color}99, ${s.color})`,
                  transition: 'width 700ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 22,
                fontWeight: 500,
                letterSpacing: '-0.02em',
                width: 40,
                textAlign: 'right',
                color: v === 0 ? 'var(--text-muted)' : 'var(--ink)',
              }}
            >
              {v}
            </div>
          </div>
        )
      })}
    </div>
  )
}
