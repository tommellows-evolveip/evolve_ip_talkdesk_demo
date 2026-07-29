import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { fmtGBP } from '../../lib/format'

const COLORS: Record<string, string> = {
  auto: '#b65433',     // rust
  home: '#17403b',     // pine
  umbrella: '#B88A3A', // gold
}

export function LobDonut({
  data,
}: {
  data: { name: string; value: number }[]
}) {
  const total = data.reduce((a, r) => a + r.value, 0)
  return (
    <div style={{ position: 'relative', width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <PieChart>
          <Tooltip
            formatter={(value) => [fmtGBP(typeof value === 'number' ? value : Number(value ?? 0)), '']}
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--border-2)',
              borderRadius: 10,
              fontSize: 12,
              color: 'var(--ink)',
              boxShadow: '0 12px 30px rgba(42, 28, 14, 0.14)',
            }}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={62}
            outerRadius={92}
            paddingAngle={2}
            stroke="var(--surface)"
            strokeWidth={3}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={COLORS[d.name] ?? 'var(--ink)'} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 30,
            letterSpacing: '-0.02em',
            lineHeight: 1,
            color: 'var(--ink)',
          }}
        >
          {fmtGBP(total)}
        </div>
        <div
          style={{
            fontSize: 10,
            letterSpacing: '0.18em',
            color: 'var(--accent-deep)',
            textTransform: 'uppercase',
            marginTop: 4,
            fontWeight: 700,
          }}
        >
          Written Premium
        </div>
      </div>
    </div>
  )
}
