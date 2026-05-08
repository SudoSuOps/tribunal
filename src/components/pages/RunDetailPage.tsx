import { ArrowLeft, Target } from 'lucide-react'
import { StatusBadge } from '../StatusBadge'
import { ArtifactList } from '../ArtifactList'
import { ImportPanel } from '../ImportPanel'
import { ExportButton, ExportMarkdownButton } from '../ExportButton'
import type { EvalRun } from '../../types'

interface Props {
  run: EvalRun | null
  onBack: () => void
}

function generateRunMarkdown(run: EvalRun): string {
  return `# Eval Run: ${run.run_id}

**Date**: ${run.date}
**Domain**: ${run.domain} — ${run.subdomain}
**Base Model**: ${run.base_model}
**Trained Model**: ${run.trained_model ?? 'N/A'}
**Prompt Pack**: ${run.prompt_pack}
**Rubric**: ${run.rubric}
**Readiness**: ${run.readiness}

## Result Summary

${run.result_summary}

## Key Findings

${run.key_findings.map((f, i) => `${i + 1}. ${f}`).join('\n')}

## Score Summary

- Base Wins: ${run.base_wins}
- Cooked Wins: ${run.cooked_wins}
- Ties: ${run.ties}
- Critical Failures: ${run.critical_failures}
- Honey: ${run.honey_count} | Jelly: ${run.jelly_count} | Propolis: ${run.propolis_count}

## Deploy Path

${run.deploy_path}

## Next Corpus (Block 2)

${run.next_corpus.map((c) => `- ${c}`).join('\n')}

---
*Sealed by Granio Tribunal v0*
`
}

export function RunDetailPage({ run, onBack }: Props) {
  if (!run) {
    return (
      <div className="flex items-center justify-center h-64 text-[#404060]">
        <div className="text-center">
          <div className="font-display text-lg mb-2">No run selected</div>
          <div className="text-sm">Select a run from Eval Runs to view details</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded border border-[#22222E] text-[#555575] hover:text-[#C0C0D8] hover:border-[#32324A] transition-all mt-0.5"
        >
          <ArrowLeft size={14} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h2 className="font-display text-xl text-[#E0E0EC]">{run.run_id}</h2>
            <StatusBadge type="generic" value={run.status} size="md" />
            <StatusBadge type="verdict" value="regressed_do_not_promote" size="md" />
          </div>
          <div className="text-sm text-[#555575]">
            {run.subdomain} · {run.date} · {run.rubric}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton label="Export JSON" filename={`${run.run_id}.json`} data={run} />
          <ExportMarkdownButton label="Export MD" filename={`${run.run_id}.md`} content={generateRunMarkdown(run)} />
        </div>
      </div>

      {/* Executive summary */}
      <div className="card-surface p-5">
        <div className="text-xs font-mono text-[#404060] uppercase tracking-widest mb-3">Executive Summary</div>
        <p className="text-sm text-[#C0C0D8] leading-relaxed">{run.result_summary}</p>
      </div>

      {/* Models */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card-surface p-4 border-[#1E3E6E]">
          <div className="text-xs font-mono text-[#404060] uppercase tracking-widest mb-2">Base Model</div>
          <div className="font-mono text-sm text-[#60A5FA]">{run.base_model}</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="metric-num text-xl text-[#60A5FA]">{run.base_wins}</div>
              <div className="text-xs font-mono text-[#404060]">Wins</div>
            </div>
            <div className="text-center">
              <div className="metric-num text-xl text-[#E0E0EC]">{run.ties}</div>
              <div className="text-xs font-mono text-[#404060]">Ties</div>
            </div>
            <div className="text-center">
              <div className="metric-num text-xl text-[#E74C3C]">{run.critical_failures}</div>
              <div className="text-xs font-mono text-[#404060]">Crits</div>
            </div>
          </div>
        </div>
        <div className="card-surface p-4 border-[#3E2878]">
          <div className="text-xs font-mono text-[#404060] uppercase tracking-widest mb-2">Trained Model</div>
          <div className="font-mono text-sm text-[#A78BFA]">{run.trained_model ?? '—'}</div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="metric-num text-xl text-[#A78BFA]">{run.cooked_wins}</div>
              <div className="text-xs font-mono text-[#404060]">Wins</div>
            </div>
            <div className="text-center">
              <div className="metric-num text-xl text-[#E8B84B]">{run.honey_count}</div>
              <div className="text-xs font-mono text-[#404060]">Honey</div>
            </div>
            <div className="text-center">
              <div className="metric-num text-xl text-[#E74C3C]">{run.propolis_count}</div>
              <div className="text-xs font-mono text-[#404060]">Propolis</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key findings */}
      <div className="card-surface p-5">
        <div className="text-xs font-mono text-[#404060] uppercase tracking-widest mb-4">Key Findings</div>
        <ol className="space-y-3">
          {run.key_findings.map((f, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="font-mono text-xs text-[#555575] mt-0.5 w-5 shrink-0">{i + 1}.</span>
              <span className="text-sm text-[#C0C0D8] leading-relaxed">{f}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Prompt results table */}
      <div className="card-surface overflow-hidden">
        <div className="p-4 border-b border-[#1C1C26] flex items-center gap-2">
          <Target size={14} className="text-[#555575]" />
          <div className="text-xs font-mono text-[#555575] uppercase tracking-widest">
            Prompt Results ({run.prompt_results.length})
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1C1C26]">
                {['ID', 'Prompt', 'Base', 'Cooked', 'Winner', 'Class', 'Notes'].map(h => (
                  <th key={h} className="p-3 text-left text-xs font-mono text-[#404060] uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1C26]">
              {run.prompt_results.map((pr) => (
                <tr key={pr.prompt_id} className="hover:bg-[#0F0F15] transition-colors">
                  <td className="p-3 font-mono text-xs text-[#555575] whitespace-nowrap">{pr.prompt_id}</td>
                  <td className="p-3 text-xs text-[#C0C0D8] max-w-xs">
                    <div className="truncate" title={pr.prompt_label}>{pr.prompt_label}</div>
                  </td>
                  <td className="p-3 font-mono text-xs text-[#60A5FA] text-center whitespace-nowrap">
                    {pr.base_score !== undefined ? (pr.base_score * 100).toFixed(0) : '—'}
                  </td>
                  <td className="p-3 font-mono text-xs text-[#A78BFA] text-center whitespace-nowrap">
                    {pr.cooked_score !== undefined ? (pr.cooked_score * 100).toFixed(0) : '—'}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <StatusBadge type="winner" value={pr.winner} />
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <StatusBadge type="classification" value={pr.classification} />
                  </td>
                  <td className="p-3 text-xs text-[#555575] max-w-xs">
                    <div className="truncate" title={pr.notes}>{pr.notes}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Artifacts + import */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <div className="text-xs font-mono text-[#404060] uppercase tracking-widest mb-3">Report Artifacts</div>
          <ArtifactList artifacts={run.artifacts} />
        </div>
        <div>
          <div className="text-xs font-mono text-[#404060] uppercase tracking-widest mb-3">Import Artifacts</div>
          <ImportPanel />
        </div>
      </div>

      {/* Deploy path + next corpus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-surface p-5">
          <div className="text-xs font-mono text-[#404060] uppercase tracking-widest mb-3">Near-Term Deploy Path</div>
          <p className="text-sm text-[#C0C0D8] leading-relaxed">{run.deploy_path}</p>
        </div>
        <div className="card-surface p-5">
          <div className="text-xs font-mono text-[#404060] uppercase tracking-widest mb-3">Block-2 Corpus Plan</div>
          <ul className="space-y-2">
            {run.next_corpus.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-[#C8961F] mt-1">·</span>
                <span className="text-[#A0A0C0]">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
