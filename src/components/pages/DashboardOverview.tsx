import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { TrendingUp, AlertTriangle, CheckCircle, Gavel, Target } from 'lucide-react'
import { MetricCard } from '../MetricCard'
import { StatusBadge } from '../StatusBadge'
import type { DashboardStats, EvalRun } from '../../types'

const COLORS = {
  base: '#4A80D4',
  cooked: '#8B6CD8',
  honey: '#C8961F',
  jelly: '#D4720B',
  propolis: '#B83A2E',
}

interface Props {
  stats: DashboardStats
  runs: EvalRun[]
  onSelectRun: (runId: string) => void
  onNavigate: (page: string) => void
}

const categoryData = [
  { category: 'Math Depth', base: 87, cooked: 54 },
  { category: 'Reconcil.', base: 87, cooked: 52 },
  { category: 'Exit Math', base: 84, cooked: 61 },
  { category: 'Day-1 Trap', base: 92, cooked: 38 },
  { category: 'LOI Correct.', base: 79, cooked: 55 },
  { category: 'Synthesis', base: 71, cooked: 88 },
  { category: 'IC Discipline', base: 82, cooked: 68 },
]

const classificationData = [
  { name: 'Honey', value: 0, color: COLORS.honey },
  { name: 'Jelly', value: 1, color: COLORS.jelly },
  { name: 'Propolis', value: 4, color: COLORS.propolis },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="card-elevated p-3 text-xs font-mono">
        <div className="text-[#C0C0D8] mb-1">{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ color: p.color }}>
            {p.name}: {p.value}
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function DashboardOverview({ stats, runs, onSelectRun, onNavigate }: Props) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Critical alert */}
      {stats.critical_failures > 0 && (
        <div className="flex items-start gap-3 p-4 bg-[#1A0806] border border-[#6E2018] rounded-md">
          <AlertTriangle size={16} className="text-[#E74C3C] shrink-0 mt-0.5" />
          <div>
            <div className="text-sm text-[#E74C3C] font-medium mb-1">
              {stats.critical_failures} Critical Failure{stats.critical_failures > 1 ? 's' : ''} Detected
            </div>
            <div className="text-xs text-[#A06060]">
              Memphis 312 Day-1 interest coverage miss · Broker pro-forma acceptance · LOI invented terms · Mortgage constant precision error.
              Cook v1 must not advance to IC Draft Ready.
            </div>
          </div>
        </div>
      )}

      {/* Primary metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <MetricCard label="Eval Runs" value={stats.total_runs} accent="neutral" icon={<Gavel size={14} />} />
        <MetricCard label="Total Prompts" value={stats.total_prompts} accent="neutral" icon={<Target size={14} />} />
        <MetricCard label="Base Wins" value={stats.base_wins} sub={`of ${stats.base_wins + stats.cooked_wins} comparable`} accent="base" />
        <MetricCard label="Cooked Wins" value={stats.cooked_wins} accent="cooked" />
        <MetricCard label="Ties" value={stats.ties} accent="neutral" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Critical Failures" value={stats.critical_failures} accent="propolis" icon={<AlertTriangle size={14} />} />
        <MetricCard label="Honey Outputs" value={stats.honey} sub="≥ 0.85 weight" accent="honey" />
        <MetricCard label="Jelly Outputs" value={stats.jelly} sub="0.70–0.84 weight" accent="jelly" />
        <MetricCard label="Propolis" value={stats.propolis} sub="< 0.70 or critical" accent="propolis" />
      </div>

      {/* Readiness card */}
      <div className="card-surface p-5 border-[#7A400A]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-[#555575] uppercase tracking-widest mb-2">Production Readiness</div>
            <div className="flex items-center gap-3">
              <StatusBadge type="readiness" value={stats.readiness} size="md" />
              <span className="text-sm text-[#7878A0]">with mandatory senior review on every output</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono text-[#555575] mb-1">Blocked From</div>
            <div className="space-y-1">
              {['IC Draft Ready', 'Client-Facing'].map(b => (
                <div key={b} className="text-xs font-mono text-[#E74C3C] line-through opacity-60">{b}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card-surface p-5">
          <div className="text-xs font-mono text-[#555575] uppercase tracking-widest mb-4">
            Base vs Cooked — Skill Score by Category
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData} barGap={2} barSize={10}>
              <XAxis
                dataKey="category"
                tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono', fill: '#555575' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono', fill: '#404060' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="base" name="Base" fill={COLORS.base} radius={[2, 2, 0, 0]} />
              <Bar dataKey="cooked" name="Cooked" fill={COLORS.cooked} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#60A5FA]">
              <span className="w-3 h-2 rounded-sm bg-[#4A80D4] inline-block" />
              Base (Qwen 3.6 27B)
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#A78BFA]">
              <span className="w-3 h-2 rounded-sm bg-[#8B6CD8] inline-block" />
              Cooked (Atlas v1)
            </div>
          </div>
        </div>

        <div className="card-surface p-5">
          <div className="text-xs font-mono text-[#555575] uppercase tracking-widest mb-4">
            Output Classification
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={classificationData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {classificationData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="card-elevated p-2 text-xs font-mono">
                      <span style={{ color: payload[0].payload.color }}>{payload[0].name}: {payload[0].value}</span>
                    </div>
                  ) : null
                }
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {classificationData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: d.color }} />
                  <span className="text-[#7878A0]">{d.name}</span>
                </div>
                <span style={{ color: d.color }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent runs */}
      <div className="card-surface">
        <div className="p-4 border-b border-[#22222E] flex items-center justify-between">
          <div className="text-xs font-mono text-[#555575] uppercase tracking-widest">Recent Eval Runs</div>
          <button
            onClick={() => onNavigate('eval-runs')}
            className="text-xs font-mono text-[#7878A0] hover:text-[#C8961F] transition-colors"
          >
            View all →
          </button>
        </div>
        <div className="divide-y divide-[#1C1C26]">
          {runs.map((run) => (
            <button
              key={run.run_id}
              onClick={() => { onSelectRun(run.run_id); onNavigate('run-detail') }}
              className="w-full p-4 text-left flex items-start gap-4 hover:bg-[#0F0F15] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-mono text-[#C0C0D8]">{run.run_id}</span>
                  <StatusBadge type="generic" value={run.status} />
                </div>
                <div className="text-xs text-[#555575]">{run.subdomain} · {run.date}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge type="readiness" value={run.readiness} />
                <span className="text-xs font-mono text-[#60A5FA]">Base +{run.base_wins}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Deploy path */}
      <div className="card-surface p-5">
        <div className="flex items-start gap-3">
          <CheckCircle size={16} className="text-[#4ADE80] shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-mono text-[#555575] uppercase tracking-widest mb-2">Near-Term Deploy Path</div>
            <div className="text-sm text-[#C0C0D8]">
              Base Qwen 3.6 27B + v4 prompt engineering + deterministic Python math validator + post-hoc output checker
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs font-mono text-[#7878A0]">
              <TrendingUp size={12} />
              v2 cook deferred until Block-2 corpus is designed with explicit repair pairs
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
