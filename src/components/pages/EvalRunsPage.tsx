import { Gavel, ChevronRight, Calendar, Database } from 'lucide-react'
import { StatusBadge } from '../StatusBadge'
import type { EvalRun } from '../../types'

interface Props {
  runs: EvalRun[]
  onSelectRun: (runId: string) => void
  onNavigate: (page: string) => void
}

export function EvalRunsPage({ runs, onSelectRun, onNavigate }: Props) {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-[#E0E0EC]">Eval Runs</h2>
          <p className="text-sm text-[#555575] mt-1">
            {runs.length} run{runs.length !== 1 ? 's' : ''} in the ledger
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#404060]">
          <Database size={14} />
          Local JSON storage · v0
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-3 p-3 border-b border-[#1C1C26] text-xs font-mono text-[#404060] uppercase tracking-wider">
          <div className="col-span-3">Run ID</div>
          <div className="col-span-1">Date</div>
          <div className="col-span-1">Domain</div>
          <div className="col-span-2">Models</div>
          <div className="col-span-1 text-center">Prompts</div>
          <div className="col-span-1 text-center">B/C/T</div>
          <div className="col-span-2">Readiness</div>
          <div className="col-span-1">Status</div>
        </div>

        {/* Rows */}
        {runs.map((run) => (
          <button
            key={run.run_id}
            onClick={() => { onSelectRun(run.run_id); onNavigate('run-detail') }}
            className="w-full grid grid-cols-12 gap-3 p-3 border-b border-[#1C1C26] last:border-0
              text-left hover:bg-[#0F0F15] transition-colors group items-start"
          >
            <div className="col-span-3">
              <div className="font-mono text-xs text-[#C0C0D8] group-hover:text-[#E8B84B] transition-colors leading-tight">
                {run.run_id}
              </div>
              <div className="text-xs text-[#404060] mt-0.5 truncate">{run.prompt_pack}</div>
            </div>

            <div className="col-span-1 flex items-start gap-1 text-xs font-mono text-[#555575]">
              <Calendar size={11} className="mt-0.5 shrink-0" />
              {run.date.slice(5)}
            </div>

            <div className="col-span-1">
              <span className="text-xs font-mono text-[#7878A0]">{run.domain}</span>
            </div>

            <div className="col-span-2 space-y-1">
              <div className="text-xs">
                <span className="badge-base px-1.5 py-0.5 rounded text-xs font-mono border">
                  {run.base_model.split(' ').slice(-2).join(' ')}
                </span>
              </div>
              {run.trained_model && (
                <div className="text-xs">
                  <span className="badge-cooked px-1.5 py-0.5 rounded text-xs font-mono border">
                    {run.trained_model.split(' ').slice(-2).join(' ')}
                  </span>
                </div>
              )}
            </div>

            <div className="col-span-1 text-center">
              <span className="metric-num text-sm text-[#E0E0EC]">{run.prompt_count}</span>
            </div>

            <div className="col-span-1 text-center">
              <div className="text-xs font-mono">
                <span className="text-[#60A5FA]">{run.base_wins}</span>
                <span className="text-[#404060]">/</span>
                <span className="text-[#A78BFA]">{run.cooked_wins}</span>
                <span className="text-[#404060]">/</span>
                <span className="text-[#555575]">{run.ties}</span>
              </div>
            </div>

            <div className="col-span-2">
              <StatusBadge type="readiness" value={run.readiness} />
            </div>

            <div className="col-span-1 flex items-center justify-between">
              <StatusBadge type="generic" value={run.status} />
              <ChevronRight size={14} className="text-[#404060] group-hover:text-[#C8961F] transition-colors" />
            </div>
          </button>
        ))}
      </div>

      {/* Run summary card */}
      {runs.map((run) => (
        <div key={`summary-${run.run_id}`} className="card-surface p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Gavel size={16} className="text-[#C4A231]" />
                <span className="font-display text-base text-[#E0E0EC]">Latest Sealed Verdict</span>
              </div>
              <div className="text-xs font-mono text-[#555575]">{run.run_id}</div>
            </div>
            <StatusBadge type="verdict" value="regressed_do_not_promote" size="md" />
          </div>
          <div className="text-sm text-[#A0A0C0] leading-relaxed mb-4">{run.result_summary}</div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#1C1C26]">
            <div>
              <div className="text-xs font-mono text-[#404060] mb-1">Rubric</div>
              <div className="text-sm font-mono text-[#7878A0]">{run.rubric}</div>
            </div>
            <div>
              <div className="text-xs font-mono text-[#404060] mb-1">Critical Failures</div>
              <div className="metric-num text-xl text-[#E74C3C]">{run.critical_failures}</div>
            </div>
            <div>
              <div className="text-xs font-mono text-[#404060] mb-1">Deploy Path</div>
              <div className="text-xs text-[#7878A0]">{run.deploy_path.slice(0, 60)}…</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
