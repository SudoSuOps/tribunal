import { useState, useRef } from 'react'
import {
  Flame, AlertTriangle, ChevronDown, Check, X,
  Download, Upload, Sparkles, Loader2, Server, KeyRound,
  ArrowUpRight, Info,
} from 'lucide-react'
import type { Domain } from '../../types'
import type { ForgeArtifact, ForgeOptions } from '../../lib/providers'
import {
  isOpenAIAvailable, OPENAI_MODELS,
  forgeArtifacts, loadForgeArtifacts, saveForgeArtifacts,
  updateForgeArtifact, exportForgeArtifacts,
} from '../../lib/providers'
import { loadEndpoints } from '../../lib/promptLibrary'
import { savePrompt } from '../../lib/promptLibrary'
import type { SavedPrompt } from '../../lib/promptLibrary'
import type { EvalPromptPayload } from '../../lib/forgeSchemas'

const DOMAINS: (Domain | 'General')[] = [
  'CRE', 'Medical', 'Legal', 'Credit', 'Coding', 'Energy', 'Mining', 'Robotics', 'General',
]

const STATUS_STYLES: Record<string, string> = {
  candidate: 'text-[#E8B84B] border-[#7A5A10] bg-[#1A1208]',
  accepted:  'text-[#4ADE80] border-[#14532D] bg-[#061209]',
  rejected:  'text-[#B83A2E] border-[#5C1A14] bg-[#120808]',
}

const STATUS_LABELS: Record<string, string> = {
  candidate: 'candidate · propolis',
  accepted:  'accepted · propolis',
  rejected:  'rejected',
}

interface Props {
  onPromoteToLibrary?: (prompt: SavedPrompt) => void
}

export function PromptForgePage({ onPromoteToLibrary }: Props) {
  const openAIAvailable = isOpenAIAvailable()
  const endpoints = loadEndpoints()

  // Form state
  const [useOpenAI, setUseOpenAI] = useState(openAIAvailable)
  const [openAIModel, setOpenAIModel] = useState('gpt-4o-mini')
  const [localEndpointId, setLocalEndpointId] = useState(endpoints[0]?.id ?? '')
  const [domain, setDomain] = useState<Domain | 'General'>('CRE')
  const [count, setCount] = useState(4)
  const [modelType, setModelType] = useState<'base' | 'instruct'>('base')
  const [intent, setIntent] = useState('')
  const [forging, setForging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warnDismissed, setWarnDismissed] = useState(false)

  // Artifacts
  const [artifacts, setArtifacts] = useState<ForgeArtifact[]>(() => loadForgeArtifacts())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [promotedIds, setPromotedIds] = useState<Set<string>>(new Set())
  const [filterStatus, setFilterStatus] = useState<'all' | 'candidate' | 'accepted' | 'rejected'>('all')

  // Import ref
  const importRef = useRef<HTMLInputElement>(null)

  const localEndpoint = endpoints.find((e) => e.id === localEndpointId)

  const persist = (updated: ForgeArtifact[]) => {
    setArtifacts(updated)
    saveForgeArtifacts(updated)
  }

  const handleForge = async () => {
    if (!intent.trim()) return
    setForging(true)
    setError(null)

    const opts: ForgeOptions = {
      type: 'eval_prompt',
      domain,
      count,
      intent: intent.trim(),
      modelType,
      useOpenAI,
      openAIModel,
      localEndpoint: useOpenAI ? undefined : localEndpoint,
    }

    try {
      const newArtifacts = await forgeArtifacts(opts)
      const updated = [...newArtifacts, ...artifacts]
      persist(updated)
      setExpandedId(newArtifacts[0]?.id ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setForging(false)
    }
  }

  const handleStatus = (id: string, status: ForgeArtifact['status']) => {
    updateForgeArtifact(id, { status })
    setArtifacts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    )
  }

  const handlePromote = (artifact: ForgeArtifact<EvalPromptPayload>) => {
    const payload = artifact.payload
    const saved = savePrompt({
      label: payload.label,
      domain: artifact.domain,
      tags: [...payload.tags, 'forge-generated', 'propolis'],
      system_prompt: payload.system_prompt,
      user_prompt: payload.user_prompt,
      notes: `Forge-generated. Expected signal: ${payload.expected_signal}\n\nFailure modes:\n${payload.failure_modes.map((f) => `• ${f}`).join('\n')}`,
    })
    setPromotedIds((prev) => new Set([...prev, artifact.id]))
    onPromoteToLibrary?.(saved)
  }

  const handleExportAccepted = () => {
    const accepted = artifacts.filter((a) => a.status === 'accepted')
    if (!accepted.length) return
    exportForgeArtifacts(accepted)
  }

  const handleExportAll = () => {
    exportForgeArtifacts(artifacts)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const incoming: ForgeArtifact[] = JSON.parse(ev.target?.result as string)
        if (!Array.isArray(incoming)) return
        const existingIds = new Set(artifacts.map((a) => a.id))
        const merged = [...artifacts, ...incoming.filter((a) => !existingIds.has(a.id))]
        persist(merged)
      } catch { /* ignore malformed */ }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleClearRejected = () => {
    const cleaned = artifacts.filter((a) => a.status !== 'rejected')
    persist(cleaned)
  }

  const displayed = artifacts.filter((a) =>
    filterStatus === 'all' ? true : a.status === filterStatus
  )

  const counts = {
    candidate: artifacts.filter((a) => a.status === 'candidate').length,
    accepted:  artifacts.filter((a) => a.status === 'accepted').length,
    rejected:  artifacts.filter((a) => a.status === 'rejected').length,
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl text-[#E0E0EC] flex items-center gap-2">
            <Flame size={18} className="text-[#E8B84B]" />
            Prompt Forge
          </h2>
          <p className="text-xs text-[#555575] font-mono mt-0.5">
            AI-assisted generation · all artifacts start as candidate · propolis until tribunal stamps
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAccepted}
            disabled={!counts.accepted}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-mono
              text-[#555575] border-[#22222E] hover:border-[#32324A] disabled:opacity-30 transition-all"
          >
            <Download size={12} />
            Export accepted ({counts.accepted})
          </button>
          <button
            onClick={handleExportAll}
            disabled={!artifacts.length}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-mono
              text-[#555575] border-[#22222E] hover:border-[#32324A] disabled:opacity-30 transition-all"
          >
            <Download size={12} />
            Export all
          </button>
          <button
            onClick={() => importRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-mono
              text-[#555575] border-[#22222E] hover:border-[#32324A] transition-all"
          >
            <Upload size={12} />
            Import
          </button>
          <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>
      </div>

      {/* Dev-only warning banner */}
      {openAIAvailable && !warnDismissed && (
        <div className="flex items-start gap-3 px-4 py-3 rounded border border-[#7A5A10] bg-[#1A1208]">
          <AlertTriangle size={15} className="text-[#E8B84B] mt-0.5 shrink-0" />
          <div className="flex-1 text-xs font-mono text-[#A08040] leading-relaxed">
            <span className="text-[#E8B84B] font-semibold">DEV-ONLY:</span> OpenAI API key is loaded
            client-side via <code className="text-[#C8961F]">VITE_OPENAI_API_KEY</code> in{' '}
            <code className="text-[#C8961F]">.env.local</code>. This key is visible in browser devtools.
            Never deploy Granio to a public host with this configuration — use a backend proxy instead.
            OpenAI assists generation only. Tribunal finality stays local.
          </div>
          <button
            onClick={() => setWarnDismissed(true)}
            className="text-[#555575] hover:text-[#E8B84B] transition-colors"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* No API key notice */}
      {!openAIAvailable && (
        <div className="flex items-center gap-3 px-4 py-3 rounded border border-[#22222E] bg-[#0C0C14]">
          <KeyRound size={14} className="text-[#555575] shrink-0" />
          <p className="text-xs font-mono text-[#555575]">
            OpenAI not configured. Add{' '}
            <code className="text-[#7070A0]">VITE_OPENAI_API_KEY=sk-...</code> to{' '}
            <code className="text-[#7070A0]">.env.local</code> to enable cloud generation.
            Local model generation is available below.
          </p>
        </div>
      )}

      <div className="grid grid-cols-5 gap-4">
        {/* ── Generation form ── */}
        <div className="col-span-2 card-surface rounded-lg p-4 flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-2 border-b border-[#1C1C26]">
            <Sparkles size={13} className="text-[#E8B84B]" />
            <span className="text-xs font-mono text-[#A0A0C0] uppercase tracking-widest">Generate</span>
          </div>

          {/* Provider */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-[#555575] uppercase tracking-widest">Provider</label>
            <div className="flex gap-2">
              <button
                onClick={() => setUseOpenAI(true)}
                disabled={!openAIAvailable}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded border text-xs font-mono transition-all
                  ${useOpenAI && openAIAvailable
                    ? 'text-[#E8B84B] border-[#7A5A10] bg-[#1A1208]'
                    : 'text-[#555575] border-[#22222E] disabled:opacity-30 hover:border-[#32324A]'
                  }`}
              >
                <KeyRound size={11} />
                OpenAI
              </button>
              <button
                onClick={() => setUseOpenAI(false)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded border text-xs font-mono transition-all
                  ${!useOpenAI
                    ? 'text-[#60A5FA] border-[#1E3E6E] bg-[#070F1A]'
                    : 'text-[#555575] border-[#22222E] hover:border-[#32324A]'
                  }`}
              >
                <Server size={11} />
                Local
              </button>
            </div>

            {useOpenAI && openAIAvailable && (
              <select
                value={openAIModel}
                onChange={(e) => setOpenAIModel(e.target.value)}
                className="w-full bg-[#0E0E18] border border-[#22222E] rounded px-3 py-1.5 text-xs font-mono text-[#A0A0C0]"
              >
                {OPENAI_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            )}

            {!useOpenAI && (
              <select
                value={localEndpointId}
                onChange={(e) => setLocalEndpointId(e.target.value)}
                className="w-full bg-[#0E0E18] border border-[#22222E] rounded px-3 py-1.5 text-xs font-mono text-[#A0A0C0]"
              >
                {endpoints.map((ep) => (
                  <option key={ep.id} value={ep.id}>{ep.label}</option>
                ))}
              </select>
            )}
          </div>

          {/* Artifact type */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-[#555575] uppercase tracking-widest">Artifact Type</label>
            <div className="w-full flex items-center justify-between px-3 py-2 rounded border border-[#22222E] bg-[#0E0E18]">
              <span className="text-xs font-mono text-[#A0A0C0]">Eval Prompts</span>
              <span className="text-xs font-mono text-[#404060]">repair pairs · rubrics · signals → v2</span>
            </div>
          </div>

          {/* Domain */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-[#555575] uppercase tracking-widest">Domain</label>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value as Domain | 'General')}
              className="w-full bg-[#0E0E18] border border-[#22222E] rounded px-3 py-1.5 text-xs font-mono text-[#A0A0C0]"
            >
              {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Model type */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-[#555575] uppercase tracking-widest">Model Mode</label>
            <div className="flex gap-2">
              {(['base', 'instruct'] as const).map((mt) => (
                <button
                  key={mt}
                  onClick={() => setModelType(mt)}
                  className={`flex-1 py-2 rounded border text-xs font-mono transition-all uppercase tracking-wider
                    ${modelType === mt
                      ? 'text-[#E8B84B] border-[#7A5A10] bg-[#1A1208]'
                      : 'text-[#555575] border-[#22222E] hover:border-[#32324A]'
                    }`}
                >
                  {mt}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-[#555575] uppercase tracking-widest">
              Count: <span className="text-[#E8B84B]">{count}</span>
            </label>
            <input
              type="range" min={1} max={8} value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-[#C8961F]"
            />
          </div>

          {/* Intent */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-[#555575] uppercase tracking-widest">Intent</label>
            <textarea
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              placeholder={`Describe what to generate…\n\ne.g. "CRE base eval prompts testing DSCR underwriting, cap rate math, and NOI completion"`}
              rows={4}
              className="w-full bg-[#0E0E18] border border-[#22222E] rounded px-3 py-2.5 text-xs font-mono
                text-[#A0A0C0] placeholder-[#333350] resize-none focus:outline-none focus:border-[#555575]"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-3 py-2 rounded border border-[#5C1A14] bg-[#120808]">
              <AlertTriangle size={12} className="text-[#B83A2E] mt-0.5 shrink-0" />
              <p className="text-xs font-mono text-[#B83A2E] leading-relaxed">{error}</p>
            </div>
          )}

          {/* Forge button */}
          <button
            onClick={handleForge}
            disabled={forging || !intent.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded border
              border-[#7A5A10] bg-[#1A1208] text-[#E8B84B] text-sm font-mono font-medium
              hover:bg-[#221A0A] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {forging ? (
              <><Loader2 size={14} className="animate-spin" /> Forging…</>
            ) : (
              <><Flame size={14} /> Forge {count} Prompt{count !== 1 ? 's' : ''}</>
            )}
          </button>
        </div>

        {/* ── Artifacts panel ── */}
        <div className="col-span-3 flex flex-col gap-3">
          {/* Filter bar */}
          <div className="flex items-center gap-2">
            {(['all', 'candidate', 'accepted', 'rejected'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1 rounded border text-xs font-mono transition-all capitalize
                  ${filterStatus === s
                    ? 'text-[#E8B84B] border-[#7A5A10] bg-[#1A1208]'
                    : 'text-[#555575] border-[#22222E] hover:border-[#32324A]'
                  }`}
              >
                {s === 'all' ? `all (${artifacts.length})` : `${s} (${counts[s] ?? 0})`}
              </button>
            ))}
            {counts.rejected > 0 && (
              <button
                onClick={handleClearRejected}
                className="ml-auto text-xs font-mono text-[#555575] hover:text-[#B83A2E] transition-colors"
              >
                clear rejected
              </button>
            )}
          </div>

          {/* Artifact cards */}
          {displayed.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Flame size={28} className="text-[#2A2A3E] mb-3" />
              <p className="text-sm font-mono text-[#404060]">No artifacts yet</p>
              <p className="text-xs font-mono text-[#2A2A3E] mt-1">
                Set intent and hit Forge to generate eval prompts
              </p>
            </div>
          )}

          <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
            {displayed.map((artifact) => {
              const payload = artifact.payload as EvalPromptPayload
              const isExpanded = expandedId === artifact.id
              const isPromoted = promotedIds.has(artifact.id)

              return (
                <div
                  key={artifact.id}
                  className={`card-surface rounded-lg border transition-all
                    ${artifact.status === 'accepted' ? 'border-[#14532D]' : ''}
                    ${artifact.status === 'rejected' ? 'border-[#1C0A08] opacity-50' : ''}
                    ${artifact.status === 'candidate' ? 'border-[#1C1C26]' : ''}
                  `}
                >
                  {/* Card header */}
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : artifact.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-mono text-[#C0C0D8] truncate">{payload.label}</span>
                        <span className={`shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded border ${STATUS_STYLES[artifact.status]}`}>
                          {STATUS_LABELS[artifact.status]}
                        </span>
                        <span className="shrink-0 text-[10px] font-mono text-[#404060]">{artifact.domain}</span>
                      </div>
                      <p className="text-xs text-[#555575] font-mono mt-0.5 truncate">
                        via {artifact.generated_by}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {artifact.status === 'candidate' && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStatus(artifact.id, 'accepted') }}
                            title="Accept"
                            className="p-1.5 rounded border border-[#14532D] text-[#4ADE80] hover:bg-[#061209] transition-all"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStatus(artifact.id, 'rejected') }}
                            title="Reject"
                            className="p-1.5 rounded border border-[#5C1A14] text-[#B83A2E] hover:bg-[#120808] transition-all"
                          >
                            <X size={12} />
                          </button>
                        </>
                      )}
                      {artifact.status === 'accepted' && !isPromoted && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePromote(artifact as ForgeArtifact<EvalPromptPayload>)
                          }}
                          title="Promote to Prompt Library"
                          className="flex items-center gap-1 px-2 py-1 rounded border border-[#7A5A10] text-[#E8B84B] text-[10px] font-mono hover:bg-[#1A1208] transition-all"
                        >
                          <ArrowUpRight size={10} />
                          To Library
                        </button>
                      )}
                      {isPromoted && (
                        <span className="text-[10px] font-mono text-[#4ADE80]">in library</span>
                      )}
                      {artifact.status === 'rejected' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStatus(artifact.id, 'candidate') }}
                          className="text-[10px] font-mono text-[#555575] hover:text-[#A0A0C0] transition-colors"
                        >
                          restore
                        </button>
                      )}
                      <ChevronDown
                        size={13}
                        className={`text-[#555575] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>

                  {/* Expanded payload */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-[#1C1C26] pt-3">
                      {payload.system_prompt && (
                        <div>
                          <div className="text-[10px] font-mono text-[#404060] uppercase tracking-widest mb-1">System</div>
                          <pre className="text-xs font-mono text-[#8080A0] whitespace-pre-wrap bg-[#0A0A12] rounded px-3 py-2 border border-[#1C1C26]">
                            {payload.system_prompt}
                          </pre>
                        </div>
                      )}
                      <div>
                        <div className="text-[10px] font-mono text-[#404060] uppercase tracking-widest mb-1">Prompt</div>
                        <pre className="text-xs font-mono text-[#C0C0D8] whitespace-pre-wrap bg-[#0A0A12] rounded px-3 py-2 border border-[#1C1C26] leading-relaxed">
                          {payload.user_prompt}
                        </pre>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-[#404060] uppercase tracking-widest mb-1">Expected Signal</div>
                        <p className="text-xs font-mono text-[#8080A0] bg-[#0A0A12] rounded px-3 py-2 border border-[#14532D] leading-relaxed">
                          {payload.expected_signal}
                        </p>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono text-[#404060] uppercase tracking-widest mb-1">Failure Modes</div>
                        <ul className="space-y-1">
                          {payload.failure_modes.map((fm, i) => (
                            <li key={i} className="text-xs font-mono text-[#8080A0] flex items-start gap-2">
                              <span className="text-[#5C1A14] mt-0.5">✗</span>
                              {fm}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {payload.tags.map((tag) => (
                          <span key={tag} className="text-[10px] font-mono text-[#404060] border border-[#22222E] px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Doctrine footer */}
      <div className="flex items-start gap-2 px-4 py-3 rounded border border-[#1C1C26] bg-[#0A0A10]">
        <Info size={12} className="text-[#404060] mt-0.5 shrink-0" />
        <p className="text-xs font-mono text-[#404060] leading-relaxed">
          OpenAI (or local model) generates candidate artifacts. Accepting moves status to{' '}
          <span className="text-[#4ADE80]">accepted</span> but class remains{' '}
          <span className="text-[#B83A2E]">propolis</span> — quality class only changes
          when the local Swarm Tribunal weighs the pair. Promote accepted prompts to the library
          to run them through the Runner against your models.
        </p>
      </div>
    </div>
  )
}
