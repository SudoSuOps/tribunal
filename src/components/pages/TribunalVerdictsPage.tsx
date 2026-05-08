import { Gavel, Shield, XCircle, CheckCircle, AlertTriangle, Flame } from 'lucide-react'
import { StatusBadge } from '../StatusBadge'
import { ExportButton, ExportMarkdownButton } from '../ExportButton'
import type { TribunalVerdict, VerdictDecision } from '../../types'

interface Props {
  verdicts: TribunalVerdict[]
}

const verdictConfig: Record<VerdictDecision, {
  icon: typeof Gavel,
  color: string,
  bg: string,
  border: string,
  label: string,
  description: string,
}> = {
  promote: {
    icon: CheckCircle,
    color: '#4ADE80',
    bg: '#061209',
    border: '#14532D',
    label: 'PROMOTE',
    description: 'Model cleared all rubric gates. Safe to advance to next readiness tier.',
  },
  promote_with_conditions: {
    icon: Shield,
    color: '#E8B84B',
    bg: '#1A1208',
    border: '#7A5A10',
    label: 'PROMOTE ±',
    description: 'Model meets minimum bar with stated conditions. Monitor specified failure modes.',
  },
  jelly_research_artifact: {
    icon: AlertTriangle,
    color: '#F59E0B',
    bg: '#1A0E04',
    border: '#7A400A',
    label: 'JELLY / RESEARCH',
    description: 'Useful findings. Not production-ready. Valuable as research artifact only.',
  },
  regressed_do_not_promote: {
    icon: XCircle,
    color: '#E74C3C',
    bg: '#1A0806',
    border: '#6E2018',
    label: 'DO NOT PROMOTE',
    description: 'Cook regressed on load-bearing skills. Base model is safer. Block advancement.',
  },
  kill_archive: {
    icon: Flame,
    color: '#DC2626',
    bg: '#1A0606',
    border: '#6E2018',
    label: 'KILL / ARCHIVE',
    description: 'Critical failures across all dimensions. Archive and redesign corpus.',
  },
}

function generateVerdictMarkdown(v: TribunalVerdict): string {
  return `# Tribunal Verdict — ${v.model}

**Verdict ID**: ${v.verdict_id}
**Run**: ${v.run_id}
**Date**: ${v.date}
**Decision**: ${verdictConfig[v.decision].label}
**Classification**: ${v.classification.toUpperCase()}
**Readiness**: ${v.readiness}

## Rationale

${v.rationale}

## Deploy Path

${v.deploy_path}

## Blocked From

${v.blocked_from.map((b) => `- ~~${b}~~`).join('\n')}

## Conditions (if any)

${v.conditions?.map((c) => `- ${c}`).join('\n') ?? 'None'}

---

*${v.doctrine_note}*

**Sealed by**: ${v.sealed_by}
**Seal timestamp**: ${v.seal_timestamp}
`
}

export function TribunalVerdictsPage({ verdicts }: Props) {
  const verdictTypes = Object.entries(verdictConfig) as [VerdictDecision, typeof verdictConfig[VerdictDecision]][]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="font-display text-xl text-[#E0E0EC]">Tribunal Verdicts</h2>
        <p className="text-sm text-[#555575] mt-1">
          {verdicts.length} sealed verdict{verdicts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Verdict type reference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {verdictTypes.map(([key, cfg]) => {
          const Icon = cfg.icon
          const hasVerdict = verdicts.some((v) => v.decision === key)
          return (
            <div
              key={key}
              className={`p-4 rounded border ${hasVerdict ? 'card-elevated' : 'card-surface opacity-50'}`}
              style={{ borderColor: hasVerdict ? cfg.border : '#1C1C26' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={15} style={{ color: cfg.color }} />
                <span className="verdict-stamp text-xs" style={{ color: cfg.color }}>
                  {cfg.label}
                </span>
                {hasVerdict && (
                  <span className="ml-auto text-xs font-mono text-[#555575]">● active</span>
                )}
              </div>
              <p className="text-xs text-[#555575] leading-relaxed">{cfg.description}</p>
            </div>
          )
        })}
      </div>

      {/* Sealed verdicts */}
      {verdicts.map((v) => {
        const cfg = verdictConfig[v.decision]
        const Icon = cfg.icon

        return (
          <div
            key={v.verdict_id}
            className="card-surface overflow-hidden"
            style={{ borderColor: cfg.border }}
          >
            {/* Header */}
            <div className="p-5 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="seal-ring" style={{ borderColor: cfg.color + '80' }}>
                    <Gavel size={20} style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <div className="font-display text-lg text-[#E0E0EC]">{v.model}</div>
                    <div className="text-xs font-mono text-[#555575]">{v.verdict_id}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <StatusBadge type="verdict" value={v.decision} size="md" />
                  <StatusBadge type="classification" value={v.classification} size="md" />
                  <StatusBadge type="readiness" value={v.readiness} size="md" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ExportButton
                  label="Export JSON"
                  filename={`${v.verdict_id}.json`}
                  data={v}
                />
                <ExportMarkdownButton
                  label="Export MD"
                  filename={`${v.verdict_id}.md`}
                  content={generateVerdictMarkdown(v)}
                />
              </div>
            </div>

            {/* Decision badge */}
            <div
              className="mx-5 mb-4 p-4 rounded flex items-start gap-3"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
            >
              <Icon size={16} style={{ color: cfg.color }} className="shrink-0 mt-0.5" />
              <div>
                <div className="verdict-stamp text-sm mb-1" style={{ color: cfg.color }}>
                  {cfg.label}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: cfg.color + 'CC' }}>
                  {v.rationale}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 pb-5 space-y-4">
              {/* Doctrine note */}
              <div className="doctrine-text text-sm border-l-2 border-[#9B7A1A] pl-4">
                "{v.doctrine_note}"
              </div>

              {/* Deploy path */}
              <div>
                <div className="text-xs font-mono text-[#404060] uppercase tracking-widest mb-2">Deploy Path</div>
                <p className="text-sm text-[#C0C0D8] leading-relaxed">{v.deploy_path}</p>
              </div>

              {/* Blocked from */}
              <div>
                <div className="text-xs font-mono text-[#404060] uppercase tracking-widest mb-2">Blocked From</div>
                <div className="flex flex-wrap gap-2">
                  {v.blocked_from.map((b) => (
                    <span
                      key={b}
                      className="text-xs font-mono px-2 py-1 rounded border border-[#6E2018] bg-[#1A0806] text-[#E74C3C] line-through opacity-70"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Conditions */}
              {v.conditions && v.conditions.length > 0 && (
                <div>
                  <div className="text-xs font-mono text-[#404060] uppercase tracking-widest mb-2">Conditions</div>
                  <ul className="space-y-1.5">
                    {v.conditions.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-[#E8B84B] mt-1 shrink-0">·</span>
                        <span className="text-[#A0A080]">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Seal */}
              <div className="pt-4 border-t border-[#1C1C26] flex items-center justify-between text-xs font-mono text-[#404060]">
                <span>{v.sealed_by}</span>
                <span>{new Date(v.seal_timestamp).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
