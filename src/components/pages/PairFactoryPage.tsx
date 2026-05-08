import { useState } from 'react'
import { Wrench, ChevronDown, ChevronRight } from 'lucide-react'
import { ExportButton } from '../ExportButton'
import { StatusBadge } from '../StatusBadge'
import type { RepairPairBlock } from '../../types'

interface Props {
  blocks: RepairPairBlock[]
}

export function PairFactoryPage({ blocks }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const totalTarget = blocks.reduce((s, b) => s + b.target_count, 0)
  const totalCurrent = blocks.reduce((s, b) => s + b.current_count, 0)

  const allSpecs = blocks.map((b) => ({
    block_id: b.block_id,
    block_label: b.label,
    priority: b.priority,
    target_count: b.target_count,
    repair_goal: b.repair_goal,
    source_failures: b.source_failures,
    pair_template: b.pair_template,
  }))

  const generatePairSpecJSON = (block: RepairPairBlock) => {
    const specs = Array.from({ length: 3 }, (_, i) => ({
      pair_id: `${block.pair_template.pair_id_prefix}_${String(i + 1).padStart(3, '0')}`,
      source_eval: block.pair_template.source_eval,
      base_failure_type: block.pair_template.base_failure_type,
      repair_goal: block.pair_template.repair_goal,
      domain: block.pair_template.domain,
      expected_behavior: block.pair_template.expected_behavior,
      classification_target: block.pair_template.classification_target,
      target_block: block.block_id,
      target_count: block.target_count,
      created_at: new Date().toISOString(),
    }))
    return { block_id: block.block_id, generated_specs: specs }
  }

  const priorityBorder: Record<string, string> = {
    critical: 'border-[#6E2018]',
    high: 'border-[#7A400A]',
    medium: 'border-[#32324A]',
    low: 'border-[#22222E]',
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl text-[#E0E0EC]">Pair Factory</h2>
          <p className="text-sm text-[#555575] mt-1">
            {blocks.length} repair blocks · {totalTarget.toLocaleString()} target pairs
          </p>
        </div>
        <ExportButton
          label="Export All Pair Specs"
          filename="granio_pair_specs_atlas27b_block2.json"
          data={allSpecs}
          variant="primary"
        />
      </div>

      {/* Progress overview */}
      <div className="card-surface p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-mono text-[#555575] uppercase tracking-widest">Block-2 Corpus Progress</div>
          <div className="text-xs font-mono text-[#404060]">
            {totalCurrent.toLocaleString()} / {totalTarget.toLocaleString()} pairs
          </div>
        </div>
        <div className="h-2 bg-[#0F0F15] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#C8961F] to-[#E8B84B] rounded-full transition-all"
            style={{ width: `${totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs font-mono text-[#404060]">
          <span>0</span>
          <span>{totalTarget.toLocaleString()} target</span>
        </div>
      </div>

      {/* Block cards */}
      <div className="space-y-3">
        {blocks.map((block) => (
          <div key={block.block_id} className={`card-surface overflow-hidden ${priorityBorder[block.priority]}`}>
            <button
              onClick={() => setExpanded(expanded === block.block_id ? null : block.block_id)}
              className="w-full p-5 text-left flex items-start gap-4 hover:bg-[#0F0F15] transition-colors"
            >
              <div className="shrink-0 mt-1">
                <Wrench size={16} className="text-[#555575]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-base font-medium text-[#E0E0EC]">{block.label}</span>
                  <StatusBadge type="severity" value={block.priority} />
                </div>
                <div className="text-xs font-mono text-[#404060] mb-2">{block.block_id}</div>
                <div className="text-sm text-[#7878A0] line-clamp-2">{block.repair_goal}</div>
              </div>

              <div className="shrink-0 text-right space-y-2">
                <div>
                  <div className="metric-num text-2xl text-[#C8961F]">
                    {block.target_count.toLocaleString()}
                  </div>
                  <div className="text-xs font-mono text-[#404060]">target pairs</div>
                </div>
                {expanded === block.block_id
                  ? <ChevronDown size={14} className="text-[#C8961F] ml-auto" />
                  : <ChevronRight size={14} className="text-[#555575] ml-auto" />
                }
              </div>
            </button>

            {/* Progress bar per block */}
            <div className="px-5 pb-3">
              <div className="flex items-center justify-between text-xs font-mono text-[#404060] mb-1">
                <span>{block.current_count} / {block.target_count.toLocaleString()}</span>
                <span>{block.target_count > 0 ? ((block.current_count / block.target_count) * 100).toFixed(0) : 0}%</span>
              </div>
              <div className="h-1 bg-[#0F0F15] rounded-full">
                <div
                  className="h-full bg-[#C8961F] rounded-full"
                  style={{ width: `${block.target_count > 0 ? (block.current_count / block.target_count) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Expanded detail */}
            {expanded === block.block_id && (
              <div className="border-t border-[#1C1C26] p-5 space-y-5 animate-slide-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <div className="text-xs font-mono text-[#404060] uppercase tracking-wider mb-2">Repair Goal</div>
                    <p className="text-sm text-[#C0C0D8] leading-relaxed">{block.repair_goal}</p>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-[#404060] uppercase tracking-wider mb-2">Expected Behavior</div>
                    <p className="text-sm text-[#C0C0D8] leading-relaxed">{block.expected_behavior}</p>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-mono text-[#404060] uppercase tracking-wider mb-2">Source Failures</div>
                  <div className="flex flex-wrap gap-2">
                    {block.source_failures.map((f) => (
                      <span key={f} className="font-mono text-xs px-2 py-1 rounded border border-[#32324A] text-[#7878A0] bg-[#0F0F15]">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-mono text-[#404060] uppercase tracking-wider mb-2">Pair Metadata Template</div>
                  <pre className="text-xs font-mono text-[#A0A0C0] bg-[#0F0F15] p-4 rounded border border-[#22222E] overflow-x-auto leading-relaxed">
                    {JSON.stringify(block.pair_template, null, 2)}
                  </pre>
                </div>

                <div className="flex items-center gap-3">
                  <ExportButton
                    label="Generate Pair Spec JSON"
                    filename={`granio_pair_specs_${block.block_id}.json`}
                    data={generatePairSpecJSON(block)}
                    variant="primary"
                  />
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#555575]">
                    <StatusBadge type="classification" value={block.pair_template.classification_target} />
                    <span>target classification</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
