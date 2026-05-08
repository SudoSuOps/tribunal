import type { Classification, Severity, VerdictDecision, ProductionReadiness } from '../types'

interface Props {
  type: 'classification' | 'severity' | 'verdict' | 'readiness' | 'winner' | 'generic'
  value: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ type, value, size = 'sm' }: Props) {
  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
  const base = `inline-flex items-center rounded font-mono font-medium ${px} border`

  if (type === 'classification') {
    const v = value as Classification
    if (v === 'honey') return <span className={`${base} badge-honey`}>⬡ Honey</span>
    if (v === 'jelly') return <span className={`${base} badge-jelly`}>◈ Jelly</span>
    if (v === 'propolis') return <span className={`${base} badge-propolis`}>▼ Propolis</span>
  }

  if (type === 'severity') {
    const v = value as Severity
    if (v === 'critical') return <span className={`${base} badge-critical`}>● Critical</span>
    if (v === 'high') return <span className={`${base} badge-jelly`}>● High</span>
    if (v === 'medium') return <span className={`${base} badge-honey`}>● Medium</span>
    return <span className={`${base} badge-pass`}>● Low</span>
  }

  if (type === 'verdict') {
    const v = value as VerdictDecision
    const map: Record<string, string> = {
      promote: 'badge-pass',
      promote_with_conditions: 'badge-honey',
      jelly_research_artifact: 'badge-jelly',
      regressed_do_not_promote: 'badge-propolis',
      kill_archive: 'badge-critical',
    }
    const labels: Record<string, string> = {
      promote: 'PROMOTE',
      promote_with_conditions: 'PROMOTE ±',
      jelly_research_artifact: 'JELLY',
      regressed_do_not_promote: 'DO NOT PROMOTE',
      kill_archive: 'KILL / ARCHIVE',
    }
    return <span className={`${base} ${map[v] ?? 'badge-base'} verdict-stamp text-xs`}>{labels[v] ?? v}</span>
  }

  if (type === 'readiness') {
    const v = value as ProductionReadiness
    if (v === 'Client-Facing Ready') return <span className={`${base} badge-pass`}>{v}</span>
    if (v === 'IC Draft Ready') return <span className={`${base} badge-honey`}>{v}</span>
    if (v === 'Internal Analyst Assist Ready') return <span className={`${base} badge-jelly`}>{v}</span>
    if (v === 'Research Only') return <span className={`${base} badge-base`}>{v}</span>
    return <span className={`${base} badge-propolis`}>{v}</span>
  }

  if (type === 'winner') {
    if (value === 'base') return <span className={`${base} badge-base`}>Base</span>
    if (value === 'cooked') return <span className={`${base} badge-cooked`}>Cooked</span>
    return <span className={`${base} text-[#7878A0] border-[#32324A] bg-[#1A1A22]`}>Tie</span>
  }

  return <span className={`${base} badge-sealed`}>{value}</span>
}
