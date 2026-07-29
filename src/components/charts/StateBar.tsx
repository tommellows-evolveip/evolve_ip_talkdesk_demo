import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export function StateBar({ data }: { data: { state: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count))
  return (
    <div style={{ width: '100%', height: 220 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="state"
            tick={{ fontSize: 11, fill: 'var(--muted)' }}
            axisLine={{ stroke: 'var(--border-2)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--muted)' }}
            axisLine={{ stroke: 'var(--border-2)' }}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(27, 34, 48, 0.06)' }}
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--border-2)',
              borderRadius: 10,
              fontSize: 12,
              color: 'var(--ink)',
              boxShadow: '0 12px 30px rgba(42, 28, 14, 0.14)',
            }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((d) => (
              <Cell
                key={d.state}
                fill={
                  d.count === 0
                    ? 'rgba(27, 34, 48, 0.12)'
                    : d.count === max
                      ? '#16263D' /* rust for the leading state */
                      : '#2F6B5E' /* pine */
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
