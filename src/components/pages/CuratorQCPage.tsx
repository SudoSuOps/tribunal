import { AlertTriangle, CheckCircle, XCircle, ChevronRight } from 'lucide-react'
import type { CuratorAudit } from '../../types'

interface Props {
  audit: CuratorAudit
}

const PIPELINE_STEPS = [
  { label: 'Producer Model', color: '#8B6CD8', sub: 'Atlas 27B / Base 27B' },
  { label: 'Deterministic Math', color: '#4A80D4', sub: 'Python validator' },
  { label: 'Curator QC', color: '#C8961F', sub: 'SwarmCurator 9B', highlight: true },
  { label: 'Senior Judge', color: '#E0E0EC', sub: 'Base as curator / Human' },
  { label: 'Human Tribunal', color: '#C4A231', sub: 'IC analyst sign-off' },
  { label: 'Verdict', color: '#4ADE80', sub: 'PROMOTE / REPRICE / KILL' },
]

export function CuratorQCPage({ audit }: Props) {
  const correctPct = (audit.correct_audit_rate * 100).toFixed(0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-xl text-[#E0E0EC]">Curator QC</h2>
        <p className="text-sm text-[#555575] mt-1">
          Audit accuracy analysis for {audit.curator_model}
        </p>
      </div>

      {/* Alert banner */}
      <div className="flex items-start gap-3 p-4 bg-[#1A1208] border border-[#7A5A10] rounded-md">
        <AlertTriangle size={16} className="text-[#E8B84B] shrink-0 mt-0.5" />
        <div>
          <div className="text-sm text-[#E8B84B] font-medium mb-1">
            SwarmCurator-9B is structurally undersized for 27B institutional audit
          </div>
          <div className="text-xs text-[#A08040]">{audit.recommendation}</div>
        </div>
      </div>

      {/* Curator status card */}
      <div className="card-surface p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div>
            <div className="text-xs font-mono text-[#404060] uppercase tracking-wider mb-1">Model</div>
            <div className="text-sm text-[#C0C0D8] font-mono">{audit.curator_model.split('(')[0].trim()}</div>
          </div>
          <div>
            <div className="text-xs font-mono text-[#404060] uppercase tracking-wider mb-1">Correct Rate</div>
            <div className="metric-num text-3xl text-[#E74C3C]">{correctPct}%</div>
            <div className="text-xs font-mono text-[#555575]">({audit.correct_audits}/{audit.total_audits} audits)</div>
          </div>
          <div>
            <div className="text-xs font-mono text-[#404060] uppercase tracking-wider mb-1">Status</div>
            <div className="text-sm font-mono text-[#E8B84B] uppercase tracking-wide">{audit.status}</div>
          </div>
          <div>
            <div className="text-xs font-mono text-[#404060] uppercase tracking-wider mb-1">Audited Run</div>
            <div className="text-xs font-mono text-[#555575] break-all">{audit.audited_run}</div>
          </div>
        </div>
      </div>

      {/* Pipeline architecture */}
      <div className="card-surface p-5">
        <div className="text-xs font-mono text-[#404060] uppercase tracking-widest mb-5">
          Tribunal Architecture — Correct Audit Chain
        </div>
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center shrink-0">
              <div
                className={`flex flex-col items-center px-3 py-2 rounded ${
                  step.highlight ? 'bg-[#1A1208] border border-[#7A5A10]' : ''
                }`}
              >
                <div
                  className={`text-xs font-medium text-center mb-0.5 ${step.highlight ? 'font-mono' : ''}`}
                  style={{ color: step.color }}
                >
                  {step.label}
                </div>
                <div className="text-xs text-[#404060] text-center whitespace-nowrap">{step.sub}</div>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <ChevronRight size={16} className="text-[#2A2A3E] mx-1 shrink-0" />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-[#555575] font-mono">
          Curator QC sits at stage 3. It is a guardrail, not the final judge.
          Final IC authority requires human or base-model-as-senior-judge at stage 4.
        </div>
      </div>

      {/* Acceptable / not acceptable */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card-surface p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={15} className="text-[#4ADE80]" />
            <div className="text-xs font-mono text-[#4ADE80] uppercase tracking-widest">Acceptable Uses</div>
          </div>
          <ul className="space-y-2">
            {audit.acceptable_uses.map((use, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-[#4ADE80] text-xs mt-1 shrink-0">✓</span>
                <span className="text-[#A0A0C0]">{use}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-surface p-5 border-[#6E2018]">
          <div className="flex items-center gap-2 mb-4">
            <XCircle size={15} className="text-[#E74C3C]" />
            <div className="text-xs font-mono text-[#E74C3C] uppercase tracking-widest">Not Acceptable</div>
          </div>
          <ul className="space-y-2">
            {audit.not_acceptable_uses.map((use, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-[#E74C3C] text-xs mt-1 shrink-0">✗</span>
                <span className="text-[#A07070]">{use}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Curator failure modes */}
      <div>
        <div className="text-xs font-mono text-[#404060] uppercase tracking-widest mb-3">
          Curator Failure Modes
        </div>
        <div className="space-y-3">
          {audit.failure_modes.map((fm, i) => (
            <div key={i} className="card-surface p-4 flex items-start gap-4">
              <div className={`text-xs font-mono px-2 py-0.5 rounded border shrink-0 mt-0.5 ${
                fm.frequency === 'common' ? 'badge-propolis' :
                fm.frequency === 'occasional' ? 'badge-jelly' : 'badge-base'
              }`}>
                {fm.frequency}
              </div>
              <div>
                <div className="text-sm text-[#E0E0EC] font-medium mb-1">{fm.type}</div>
                <div className="text-xs text-[#7878A0] leading-relaxed">{fm.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation */}
      <div className="card-surface p-5 border-[#2A2A3E]">
        <div className="text-xs font-mono text-[#404060] uppercase tracking-widest mb-3">Tribunal Recommendation</div>
        <div className="text-sm text-[#C0C0D8] leading-relaxed font-display italic">
          "{audit.recommendation}"
        </div>
      </div>
    </div>
  )
}
