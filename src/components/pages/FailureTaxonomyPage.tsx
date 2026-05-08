import { useState } from 'react'
import { AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'
import { StatusBadge } from '../StatusBadge'
import { ExportButton } from '../ExportButton'
import type { FailureMode, Severity } from '../../types'

interface Props {
  failures: FailureMode[]
  onNavigatePairFactory: () => void
}

const severityOrder: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3 }

export function FailureTaxonomyPage({ failures, onNavigatePairFactory }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filterSeverity, setFilterSeverity] = useState<Severity | 'all'>('all')

  const sorted = [...failures]
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    .filter((f) => filterSeverity === 'all' || f.severity === filterSeverity)

  const counts = {
    critical: failures.filter((f) => f.severity === 'critical').length,
    high: failures.filter((f) => f.severity === 'high').length,
    medium: failures.filter((f) => f.severity === 'medium').length,
    low: failures.filter((f) => f.severity === 'low').length,
    repair_needed: failures.filter((f) => f.repair_needed).length,
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl text-[#E0E0EC]">Failure Taxonomy</h2>
          <p className="text-sm text-[#555575] mt-1">
            {failures.length} documented failures · {counts.repair_needed} flagged for repair pairs
          </p>
        </div>
        <ExportButton
          label="Export Taxonomy JSON"
          filename="granio_failure_taxonomy.json"
          data={failures}
          variant="primary"
        />
      </div>

      {/* Severity summary */}
      <div className="grid grid-cols-4 gap-3">
        {(['critical', 'high', 'medium', 'low'] as Severity[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilterSeverity(filterSeverity === s ? 'all' : s)}
            className={`card-surface p-3 text-left transition-all ${
              filterSeverity === s ? 'border-[#C8961F]' : 'hover:border-[#32324A]'
            }`}
          >
            <StatusBadge type="severity" value={s} />
            <div className="metric-num text-2xl mt-2 text-[#E0E0EC]">{counts[s]}</div>
          </button>
        ))}
      </div>

      {filterSeverity !== 'all' && (
        <button
          onClick={() => setFilterSeverity('all')}
          className="text-xs font-mono text-[#C8961F] hover:text-[#E8B84B]"
        >
          ← Show all failures
        </button>
      )}

      {/* Failures list */}
      <div className="space-y-3">
        {sorted.map((f) => (
          <div
            key={f.failure_id}
            className={`card-surface overflow-hidden transition-all ${
              f.severity === 'critical' ? 'border-[#6E2018]' :
              f.severity === 'high' ? 'border-[#7A400A]' : ''
            }`}
          >
            {/* Row header */}
            <button
              onClick={() => setExpanded(expanded === f.failure_id ? null : f.failure_id)}
              className="w-full p-4 flex items-start gap-4 text-left hover:bg-[#0F0F15] transition-colors"
            >
              <div className="shrink-0 mt-0.5">
                {expanded === f.failure_id
                  ? <ChevronDown size={14} className="text-[#C8961F]" />
                  : <ChevronRight size={14} className="text-[#555575]" />
                }
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-medium text-[#E0E0EC]">{f.label}</span>
                  {f.severity === 'critical' && (
                    <AlertTriangle size={13} className="text-[#E74C3C] shrink-0" />
                  )}
                </div>
                <div className="font-mono text-xs text-[#404060]">{f.failure_id}</div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge type="severity" value={f.severity} />
                <StatusBadge type="classification" value={f.classification} />
                {f.repair_needed && (
                  <span className="px-2 py-0.5 rounded text-xs font-mono border badge-honey">⚒ Repair</span>
                )}
              </div>
            </button>

            {/* Expanded detail */}
            {expanded === f.failure_id && (
              <div className="border-t border-[#1C1C26] p-4 space-y-4 animate-slide-up">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs font-mono text-[#404060] uppercase tracking-wider mb-2">Base Behavior</div>
                    <p className="text-xs text-[#60A5FA] leading-relaxed bg-[#070F1A] p-3 rounded border border-[#1E3E6E]">
                      {f.base_behavior}
                    </p>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-[#404060] uppercase tracking-wider mb-2">Trained Behavior</div>
                    <p className="text-xs text-[#E74C3C] leading-relaxed bg-[#1A0806] p-3 rounded border border-[#6E2018]">
                      {f.trained_behavior}
                    </p>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-[#404060] uppercase tracking-wider mb-2">Expected Behavior</div>
                    <p className="text-xs text-[#4ADE80] leading-relaxed bg-[#061209] p-3 rounded border border-[#14532D]">
                      {f.expected_behavior}
                    </p>
                  </div>
                </div>

                {(f.example_input || f.example_base_output || f.example_trained_output) && (
                  <div className="space-y-3">
                    <div className="text-xs font-mono text-[#404060] uppercase tracking-wider">Example</div>
                    {f.example_input && (
                      <div>
                        <div className="text-xs font-mono text-[#555575] mb-1">Input:</div>
                        <pre className="text-xs font-mono text-[#C0C0D8] bg-[#0F0F15] p-3 rounded border border-[#22222E] whitespace-pre-wrap">
                          {f.example_input}
                        </pre>
                      </div>
                    )}
                    {f.example_base_output && (
                      <div>
                        <div className="text-xs font-mono text-[#60A5FA] mb-1">Base output:</div>
                        <pre className="text-xs font-mono text-[#8080C0] bg-[#070F1A] p-3 rounded border border-[#1E3E6E] whitespace-pre-wrap">
                          {f.example_base_output}
                        </pre>
                      </div>
                    )}
                    {f.example_trained_output && (
                      <div>
                        <div className="text-xs font-mono text-[#E74C3C] mb-1">Trained output (failure):</div>
                        <pre className="text-xs font-mono text-[#C08080] bg-[#1A0806] p-3 rounded border border-[#6E2018] whitespace-pre-wrap">
                          {f.example_trained_output}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-4 pt-2 border-t border-[#1C1C26]">
                  <div className="flex items-center gap-2 text-xs font-mono text-[#555575]">
                    <span className="text-[#404060]">Source prompt:</span>
                    <span className="text-[#7878A0]">{f.source_prompt}</span>
                  </div>
                  {f.repair_needed && (
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-[#404060]">→ Repair block:</span>
                      <button
                        onClick={onNavigatePairFactory}
                        className="text-[#E8B84B] hover:text-[#C8961F] underline"
                      >
                        {f.target_pair_block}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
