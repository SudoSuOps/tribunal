import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Cell,
} from 'recharts'
import { StatusBadge } from '../StatusBadge'
import type { ModelComparison } from '../../types'

interface Props {
  comparison: ModelComparison
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card-elevated p-3 text-xs font-mono space-y-1">
        <div className="text-[#C0C0D8] mb-1">{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</div>
        ))}
      </div>
    )
  }
  return null
}

export function ModelComparisonPage({ comparison }: Props) {
  const radarData = comparison.dimensions.map((d) => ({
    dimension: d.dimension.length > 12 ? d.dimension.slice(0, 12) + '…' : d.dimension,
    base: Math.round(d.base_score * 100),
    cooked: Math.round(d.cooked_score * 100),
  }))

  const loadBearing = comparison.dimensions.filter((d) => d.weight === 'load-bearing')
  const valueAdd = comparison.dimensions.filter((d) => d.weight === 'value-add')

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl text-[#E0E0EC]">Model Comparison</h2>
          <p className="text-sm text-[#555575] mt-1">{comparison.base_model} vs {comparison.cooked_model}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#555575]">Overall Winner:</span>
          <StatusBadge type="winner" value={comparison.overall_winner} size="md" />
        </div>
      </div>

      {/* Summary */}
      <div className="card-surface p-5">
        <p className="text-sm text-[#C0C0D8] leading-relaxed">{comparison.summary}</p>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Radar */}
        <div className="card-surface p-5">
          <div className="text-xs font-mono text-[#404060] uppercase tracking-widest mb-4">
            Skill Radar — All Dimensions
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1C1C26" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono', fill: '#555575' }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={{ fontSize: 9, fontFamily: 'IBM Plex Mono', fill: '#404060' }}
                axisLine={false}
              />
              <Radar name="Base" dataKey="base" stroke="#4A80D4" fill="#4A80D4" fillOpacity={0.15} strokeWidth={2} />
              <Radar name="Cooked" dataKey="cooked" stroke="#8B6CD8" fill="#8B6CD8" fillOpacity={0.15} strokeWidth={2} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 justify-center mt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-[#60A5FA]">
              <span className="w-4 h-0.5 bg-[#4A80D4] inline-block" />Base
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#A78BFA]">
              <span className="w-4 h-0.5 bg-[#8B6CD8] inline-block" />Cooked
            </div>
          </div>
        </div>

        {/* Bar comparison */}
        <div className="card-surface p-5">
          <div className="text-xs font-mono text-[#404060] uppercase tracking-widest mb-4">
            Score Delta by Dimension
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={comparison.dimensions.map((d) => ({
                name: d.dimension.split(' ').slice(0, 2).join(' '),
                delta: Math.round((d.base_score - d.cooked_score) * 100),
                winner: d.winner,
              }))}
              layout="vertical"
              barSize={10}
            >
              <XAxis
                type="number"
                domain={[-60, 60]}
                tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono', fill: '#404060' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono', fill: '#7878A0' }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="card-elevated p-2 text-xs font-mono">
                      <div className="text-[#C0C0D8]">Base − Cooked: {payload[0].value}</div>
                      <div className="text-[#555575]">{(payload[0].value as number) > 0 ? 'Base leads' : 'Cooked leads'}</div>
                    </div>
                  ) : null
                }
              />
              <Bar dataKey="delta" radius={[0, 2, 2, 0]}>
                {comparison.dimensions.map((d, i) => (
                  <Cell key={i} fill={d.winner === 'base' ? '#4A80D4' : '#8B6CD8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Load-bearing dimensions */}
      <div>
        <div className="text-xs font-mono text-[#404060] uppercase tracking-widest mb-3">
          Load-Bearing Dimensions ({loadBearing.length})
          <span className="ml-2 text-[#E74C3C]">— IC-critical, must not regress</span>
        </div>
        <DimensionTable dimensions={loadBearing} />
      </div>

      {/* Value-add dimensions */}
      <div>
        <div className="text-xs font-mono text-[#404060] uppercase tracking-widest mb-3">
          Value-Add Dimensions ({valueAdd.length})
          <span className="ml-2 text-[#555575]">— enrichment, cooked typically leads</span>
        </div>
        <DimensionTable dimensions={valueAdd} />
      </div>
    </div>
  )
}

function DimensionTable({ dimensions }: { dimensions: ModelComparison['dimensions'] }) {
  return (
    <div className="card-surface overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#1C1C26]">
            {['Dimension', 'Base Score', 'Cooked Score', 'Winner', 'Base Notes', 'Cooked Notes'].map(h => (
              <th key={h} className="p-3 text-left text-xs font-mono text-[#404060] uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1C1C26]">
          {dimensions.map((d) => (
            <tr key={d.dimension} className="hover:bg-[#0F0F15] transition-colors">
              <td className="p-3">
                <div className="text-sm text-[#E0E0EC] font-medium">{d.dimension}</div>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <div className="win-bar-base" style={{ width: `${d.base_score * 60}px` }} />
                  <span className="font-mono text-xs text-[#60A5FA]">
                    {Math.round(d.base_score * 100)}
                  </span>
                </div>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <div className="win-bar-cooked" style={{ width: `${d.cooked_score * 60}px` }} />
                  <span className="font-mono text-xs text-[#A78BFA]">
                    {Math.round(d.cooked_score * 100)}
                  </span>
                </div>
              </td>
              <td className="p-3">
                <StatusBadge type="winner" value={d.winner} />
              </td>
              <td className="p-3 text-xs text-[#7878A0] max-w-xs">
                <div className="line-clamp-2">{d.base_notes}</div>
              </td>
              <td className="p-3 text-xs text-[#7878A0] max-w-xs">
                <div className="line-clamp-2">{d.cooked_notes}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
