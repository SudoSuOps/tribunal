import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Play, Square, ChevronDown, Settings, Plus, BookOpen,
  Copy, Check, AlertCircle, Loader2, Columns2, ArrowRight,
} from 'lucide-react'
import type { ModelEndpoint, SavedPrompt } from '../../lib/promptLibrary'
import {
  streamCompletion, loadEndpoints, saveEndpoints, DEFAULT_ENDPOINTS,
  savePrompt, touchPrompt,
} from '../../lib/promptLibrary'
import { StatusBadge } from '../StatusBadge'

const ENDPOINT_COLORS: Record<string, string> = {
  base: 'text-[#60A5FA] border-[#1E3E6E]',
  cooked: 'text-[#A78BFA] border-[#3E2878]',
  honey: 'text-[#E8B84B] border-[#7A5A10]',
  neutral: 'text-[#A0A0C0] border-[#32324A]',
}

interface RunResult {
  endpoint: ModelEndpoint
  output: string
  elapsed_ms: number
  done: boolean
  error?: string
}

interface Props {
  onGoToLibrary: () => void
  libraryPrompts: SavedPrompt[]
  onLibraryLoad: (prompt: SavedPrompt) => void
  preloadPrompt?: SavedPrompt | null
  onPreloadConsumed?: () => void
}

export function PromptRunnerPage({ onGoToLibrary, libraryPrompts, preloadPrompt, onPreloadConsumed }: Props) {
  const [endpoints, setEndpoints] = useState<ModelEndpoint[]>(loadEndpoints)
  const [selectedA, setSelectedA] = useState<string>(endpoints[0]?.id ?? '')
  const [selectedB, setSelectedB] = useState<string>(endpoints[1]?.id ?? '')
  const [compareMode, setCompareMode] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState('')
  const [userPrompt, setUserPrompt] = useState('')
  const [temperature, setTemperature] = useState(0.15)
  const [maxTokens, setMaxTokens] = useState(2200)
  const [topP, setTopP] = useState(0.88)
  const [topK, setTopK] = useState(35)
  const [repeatPenalty, setRepeatPenalty] = useState(1.08)
  const [numCtx, setNumCtx] = useState(16384)
  const [showSettings, setShowSettings] = useState(false)
  const [showLibraryPicker, setShowLibraryPicker] = useState(false)
  const [showAddEndpoint, setShowAddEndpoint] = useState(false)
  const [resultA, setResultA] = useState<RunResult | null>(null)
  const [resultB, setResultB] = useState<RunResult | null>(null)
  const [running, setRunning] = useState(false)
  const [copied, setCopied] = useState<'a' | 'b' | null>(null)
  const [saveLabel, setSaveLabel] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const endpointA = endpoints.find((e) => e.id === selectedA)
  const endpointB = endpoints.find((e) => e.id === selectedB)

  const inferenceParams = { temperature, max_tokens: maxTokens, top_p: topP, top_k: topK, repeat_penalty: repeatPenalty, num_ctx: numCtx }

  const handleRun = useCallback(async () => {
    if (!userPrompt.trim()) return
    if (!endpointA) return

    setRunning(true)
    setResultA({ endpoint: endpointA, output: '', elapsed_ms: 0, done: false })
    if (compareMode && endpointB) {
      setResultB({ endpoint: endpointB, output: '', elapsed_ms: 0, done: false })
    } else {
      setResultB(null)
    }

    abortRef.current = new AbortController()

    const startA = Date.now()
    const startB = Date.now()
    let doneA = false
    let doneB = !compareMode || !endpointB

    const checkDone = () => {
      if (doneA && doneB) setRunning(false)
    }

    streamCompletion({
      endpoint: endpointA,
      system_prompt: systemPrompt,
      user_prompt: userPrompt,
      ...inferenceParams,
      signal: abortRef.current.signal,
      onToken: (token) => {
        setResultA((prev) => prev ? { ...prev, output: prev.output + token } : null)
      },
      onDone: (full) => {
        doneA = true
        setResultA({ endpoint: endpointA, output: full, elapsed_ms: Date.now() - startA, done: true })
        checkDone()
      },
      onError: (err) => {
        doneA = true
        setResultA({ endpoint: endpointA, output: '', elapsed_ms: Date.now() - startA, done: true, error: err })
        checkDone()
      },
    })

    if (compareMode && endpointB) {
      streamCompletion({
        endpoint: endpointB,
        system_prompt: systemPrompt,
        user_prompt: userPrompt,
        ...inferenceParams,
        signal: abortRef.current.signal,
        onToken: (token) => {
          setResultB((prev) => prev ? { ...prev, output: prev.output + token } : null)
        },
        onDone: (full) => {
          doneB = true
          setResultB({ endpoint: endpointB, output: full, elapsed_ms: Date.now() - startB, done: true })
          checkDone()
        },
        onError: (err) => {
          doneB = true
          setResultB({ endpoint: endpointB, output: '', elapsed_ms: Date.now() - startB, done: true, error: err })
          checkDone()
        },
      })
    }
  }, [userPrompt, systemPrompt, endpointA, endpointB, compareMode, inferenceParams])

  const handleStop = () => {
    abortRef.current?.abort()
    setRunning(false)
  }

  const handleCopy = (which: 'a' | 'b') => {
    const text = which === 'a' ? resultA?.output : resultB?.output
    if (!text) return
    const confirm = () => { setCopied(which); setTimeout(() => setCopied(null), 1500) }
    // navigator.clipboard requires HTTPS or localhost — use execCommand fallback on LAN HTTP
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(confirm).catch(() => execCopy(text, confirm))
    } else {
      execCopy(text, confirm)
    }
  }

  const execCopy = (text: string, onSuccess: () => void) => {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
    document.body.appendChild(ta)
    ta.focus(); ta.select()
    try { document.execCommand('copy'); onSuccess() } catch { /* silent */ }
    document.body.removeChild(ta)
  }

  const handleSavePrompt = () => {
    if (!saveLabel.trim() || !userPrompt.trim()) return
    savePrompt({
      label: saveLabel.trim(),
      domain: 'General',
      tags: [],
      system_prompt: systemPrompt,
      user_prompt: userPrompt,
      notes: '',
    })
    setSaveLabel('')
    setShowSaveDialog(false)
  }

  const handleLoadPrompt = (p: SavedPrompt) => {
    setSystemPrompt(p.system_prompt)
    setUserPrompt(p.user_prompt)
    touchPrompt(p.id)
    setShowLibraryPicker(false)
  }

  const handleAddEndpoint = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const newEp: ModelEndpoint = {
      id: `custom_${Date.now()}`,
      label: fd.get('label') as string,
      base_url: (fd.get('base_url') as string).replace(/\/$/, ''),
      api_type: fd.get('api_type') as 'ollama' | 'openai',
      model_name: fd.get('model_name') as string,
      color: 'neutral',
    }
    const updated = [...endpoints, newEp]
    setEndpoints(updated)
    saveEndpoints(updated)
    setShowAddEndpoint(false)
  }

  // Keyboard shortcut: Ctrl+Enter to run
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !running) handleRun()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleRun, running])

  // Preload prompt from library navigation
  useEffect(() => {
    if (preloadPrompt) {
      setSystemPrompt(preloadPrompt.system_prompt)
      setUserPrompt(preloadPrompt.user_prompt)
      touchPrompt(preloadPrompt.id)
      onPreloadConsumed?.()
    }
  }, [preloadPrompt, onPreloadConsumed])

  return (
    <div className="flex flex-col h-full gap-4 animate-fade-in">
      {/* Top bar */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-display text-xl text-[#E0E0EC]">Prompt Runner</h2>
          <p className="text-xs text-[#555575] font-mono mt-0.5">Ctrl+Enter to run · stream to model · save to library</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCompareMode((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-mono transition-all
              ${compareMode ? 'badge-cooked' : 'text-[#555575] border-[#22222E] hover:border-[#32324A]'}`}
          >
            <Columns2 size={13} />
            Compare
          </button>
          <button
            onClick={() => setShowAddEndpoint(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-mono
              text-[#555575] border-[#22222E] hover:border-[#32324A] transition-all"
          >
            <Plus size={13} />
            Add Model
          </button>
          <button
            onClick={() => setShowSettings((v) => !v)}
            className={`p-1.5 rounded border text-xs transition-all
              ${showSettings ? 'text-[#E8B84B] border-[#7A5A10]' : 'text-[#555575] border-[#22222E] hover:border-[#32324A]'}`}
          >
            <Settings size={14} />
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="card-surface p-4 animate-slide-up shrink-0">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <label className="flex items-center gap-2 text-xs font-mono text-[#7878A0]">
              temp
              <input type="range" min={0} max={1} step={0.01} value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-20 accent-[#C8961F]" />
              <span className="text-[#E8B84B] w-8">{temperature}</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-mono text-[#7878A0]">
              top_p
              <input type="range" min={0.5} max={1} step={0.01} value={topP}
                onChange={(e) => setTopP(parseFloat(e.target.value))}
                className="w-20 accent-[#C8961F]" />
              <span className="text-[#E8B84B] w-8">{topP}</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-mono text-[#7878A0]">
              top_k
              <input type="range" min={1} max={100} step={1} value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value))}
                className="w-20 accent-[#C8961F]" />
              <span className="text-[#E8B84B] w-8">{topK}</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-mono text-[#7878A0]">
              repeat_penalty
              <input type="range" min={1.0} max={1.5} step={0.01} value={repeatPenalty}
                onChange={(e) => setRepeatPenalty(parseFloat(e.target.value))}
                className="w-20 accent-[#C8961F]" />
              <span className="text-[#E8B84B] w-10">{repeatPenalty}</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-mono text-[#7878A0]">
              max_tokens
              <input type="number" min={64} max={8192} step={64} value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-20 bg-[#0F0F15] border border-[#22222E] rounded px-2 py-1 text-[#C0C0D8] text-xs font-mono" />
            </label>
            <label className="flex items-center gap-2 text-xs font-mono text-[#7878A0]">
              ctx
              <input type="number" min={2048} max={131072} step={2048} value={numCtx}
                onChange={(e) => setNumCtx(parseInt(e.target.value))}
                className="w-24 bg-[#0F0F15] border border-[#22222E] rounded px-2 py-1 text-[#C0C0D8] text-xs font-mono" />
            </label>
          </div>
        </div>
      )}

      {/* Model selectors */}
      <div className={`grid gap-3 shrink-0 ${compareMode ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <ModelSelector
          endpoints={endpoints}
          selected={selectedA}
          onSelect={setSelectedA}
          label={compareMode ? 'Model A (Base)' : 'Model'}
          colorKey={endpointA?.color ?? 'neutral'}
        />
        {compareMode && (
          <ModelSelector
            endpoints={endpoints}
            selected={selectedB}
            onSelect={setSelectedB}
            label="Model B (Cooked)"
            colorKey={endpointB?.color ?? 'neutral'}
          />
        )}
      </div>

      {/* System prompt */}
      <div className="shrink-0">
        <div className="text-xs font-mono text-[#404060] uppercase tracking-widest mb-1.5">System Prompt</div>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="You are a CRE underwriting analyst. You are evaluating multifamily investment opportunities..."
          rows={3}
          className="w-full bg-[#0F0F15] border border-[#22222E] rounded px-3 py-2
            text-sm text-[#C0C0D8] placeholder-[#333350] font-sans
            focus:outline-none focus:border-[#555575] resize-none"
        />
      </div>

      {/* User prompt + actions */}
      <div className="shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-xs font-mono text-[#404060] uppercase tracking-widest">User Prompt</div>
          <div className="flex items-center gap-3">
            {userPrompt && (
              <button
                onClick={() => { setUserPrompt(''); setResultA(null); setResultB(null) }}
                className="flex items-center gap-1 text-xs font-mono text-[#555575] hover:text-[#B83A2E] transition-colors"
              >
                <ArrowRight size={10} className="rotate-180" />
                Clear
              </button>
            )}
            <button
              onClick={() => setShowLibraryPicker((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-mono text-[#7878A0] hover:text-[#E8B84B] transition-colors"
            >
              <BookOpen size={12} />
              Load from library ({libraryPrompts.length})
            </button>
          </div>
        </div>
        <textarea
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="Drop your prompt here…&#10;&#10;Example: T12 NOI: $2.1M | Bridge rate: 8.5% | Loan amount: $29M | Going-in occupancy: 91% | Unit count: 312&#10;&#10;Evaluate this multifamily acquisition and provide your IC recommendation."
          rows={6}
          className="w-full bg-[#0F0F15] border border-[#22222E] rounded px-3 py-2
            text-sm text-[#C0C0D8] placeholder-[#333350] font-sans
            focus:outline-none focus:border-[#555575] resize-y min-h-[120px]"
        />
      </div>

      {/* Library picker dropdown */}
      {showLibraryPicker && (
        <div className="card-elevated border-[#32324A] p-3 space-y-2 max-h-48 overflow-y-auto shrink-0 animate-slide-up">
          {libraryPrompts.length === 0 ? (
            <div className="text-xs text-[#404060] text-center py-4">
              No saved prompts yet. Run a prompt and save it to the library.
            </div>
          ) : (
            libraryPrompts.map((p) => (
              <button
                key={p.id}
                onClick={() => handleLoadPrompt(p)}
                className="w-full text-left p-2 rounded hover:bg-[#1A1A22] transition-colors flex items-start gap-3"
              >
                <ArrowRight size={12} className="text-[#555575] mt-1 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm text-[#C0C0D8] truncate">{p.label}</div>
                  <div className="text-xs font-mono text-[#404060] truncate mt-0.5">
                    {p.domain} · used {p.use_count}×
                  </div>
                </div>
              </button>
            ))
          )}
          <button
            onClick={onGoToLibrary}
            className="w-full text-xs font-mono text-[#7878A0] hover:text-[#E8B84B] text-center pt-2 border-t border-[#22222E]"
          >
            Manage library →
          </button>
        </div>
      )}

      {/* Run controls */}
      <div className="flex items-center gap-3 shrink-0">
        {running ? (
          <button
            onClick={handleStop}
            className="flex items-center gap-2 px-5 py-2 rounded bg-[#1A0806] border border-[#6E2018]
              text-sm font-mono text-[#E74C3C] hover:bg-[#250A06] transition-all"
          >
            <Square size={14} />
            Stop
          </button>
        ) : (
          <button
            onClick={handleRun}
            disabled={!userPrompt.trim() || !endpointA}
            className="flex items-center gap-2 px-5 py-2 rounded
              bg-[#1A1208] border border-[#7A5A10] text-sm font-mono text-[#E8B84B]
              hover:bg-[#251A0A] hover:border-[#C8961F] transition-all
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play size={14} />
            Run {compareMode ? '(×2)' : ''}
          </button>
        )}

        <button
          onClick={() => { if (userPrompt.trim()) setShowSaveDialog(true) }}
          disabled={!userPrompt.trim()}
          className="flex items-center gap-1.5 px-3 py-2 rounded border text-xs font-mono
            text-[#7878A0] border-[#22222E] hover:text-[#C0C0D8] hover:border-[#32324A] transition-all
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <BookOpen size={13} />
          Save to Library
        </button>

        {running && (
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#555575]">
            <Loader2 size={12} className="animate-spin" />
            Streaming…
          </div>
        )}
      </div>

      {/* Save dialog */}
      {showSaveDialog && (
        <div className="card-surface p-4 flex items-center gap-3 shrink-0 animate-slide-up">
          <BookOpen size={14} className="text-[#C8961F] shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Prompt label (e.g. Memphis 312 Interest Coverage)"
            value={saveLabel}
            onChange={(e) => setSaveLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSavePrompt(); if (e.key === 'Escape') setShowSaveDialog(false) }}
            className="flex-1 bg-transparent border-b border-[#32324A] text-sm text-[#C0C0D8]
              placeholder-[#404060] focus:outline-none focus:border-[#C8961F] pb-0.5"
          />
          <button
            onClick={handleSavePrompt}
            disabled={!saveLabel.trim()}
            className="text-xs font-mono text-[#E8B84B] hover:text-[#C8961F] disabled:opacity-40"
          >
            Save
          </button>
          <button onClick={() => setShowSaveDialog(false)} className="text-xs font-mono text-[#404060]">Cancel</button>
        </div>
      )}

      {/* Results */}
      {(resultA || resultB) && (
        <div className={`grid gap-4 flex-1 min-h-0 ${compareMode && resultB ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {resultA && <OutputPanel result={resultA} side="a" onCopy={() => handleCopy('a')} copied={copied === 'a'} />}
          {resultB && compareMode && <OutputPanel result={resultB} side="b" onCopy={() => handleCopy('b')} copied={copied === 'b'} />}
        </div>
      )}

      {/* Add endpoint modal */}
      {showAddEndpoint && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowAddEndpoint(false)}>
          <div className="card-elevated p-6 w-96 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="font-display text-base text-[#E0E0EC]">Add Model Endpoint</div>
            <form onSubmit={handleAddEndpoint} className="space-y-3">
              {[
                { name: 'label', placeholder: 'Display label (e.g. My Qwen 27B)' },
                { name: 'base_url', placeholder: 'Base URL (e.g. http://localhost:11434)' },
                { name: 'model_name', placeholder: 'Model name (e.g. qwen2.5:32b)' },
              ].map((f) => (
                <input key={f.name} name={f.name} required placeholder={f.placeholder}
                  className="w-full bg-[#0F0F15] border border-[#22222E] rounded px-3 py-2
                    text-sm text-[#C0C0D8] placeholder-[#404060] focus:outline-none focus:border-[#555575]"
                />
              ))}
              <select name="api_type"
                className="w-full bg-[#0F0F15] border border-[#22222E] rounded px-3 py-2
                  text-sm text-[#C0C0D8] focus:outline-none focus:border-[#555575]"
              >
                <option value="ollama">Ollama (native)</option>
                <option value="openai">OpenAI-compatible (vLLM)</option>
              </select>
              <div className="flex gap-2 pt-2">
                <button type="submit"
                  className="flex-1 py-2 rounded bg-[#1A1208] border border-[#7A5A10] text-sm font-mono text-[#E8B84B] hover:bg-[#251A0A]">
                  Add
                </button>
                <button type="button" onClick={() => setShowAddEndpoint(false)}
                  className="px-4 py-2 rounded border border-[#22222E] text-sm font-mono text-[#555575]">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ModelSelector({ endpoints, selected, onSelect, label, colorKey }: {
  endpoints: ModelEndpoint[]
  selected: string
  onSelect: (id: string) => void
  label: string
  colorKey: string
}) {
  const [open, setOpen] = useState(false)
  const sel = endpoints.find((e) => e.id === selected)

  return (
    <div className="relative">
      <div className="text-xs font-mono text-[#404060] uppercase tracking-widest mb-1.5">{label}</div>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded border text-sm font-mono transition-all
          card-surface hover:border-[#32324A] ${ENDPOINT_COLORS[colorKey] ?? ENDPOINT_COLORS.neutral}`}
      >
        <span>{sel?.label ?? 'Select model…'}</span>
        <ChevronDown size={14} className="text-[#555575]" />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 z-20 card-elevated border border-[#32324A] mt-1 rounded overflow-hidden">
          {endpoints.map((ep) => (
            <button
              key={ep.id}
              onClick={() => { onSelect(ep.id); setOpen(false) }}
              className="w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-[#1A1A22] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-mono truncate ${ENDPOINT_COLORS[ep.color]?.split(' ')[0] ?? 'text-[#C0C0D8]'}`}>
                  {ep.label}
                </div>
                <div className="text-xs text-[#404060] truncate">{ep.base_url} · {ep.model_name}</div>
              </div>
              <span className="text-xs font-mono text-[#404060] shrink-0 mt-0.5">{ep.api_type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function OutputPanel({ result, side, onCopy, copied }: {
  result: RunResult
  side: 'a' | 'b'
  onCopy: () => void
  copied: boolean
}) {
  const [verdict, setVerdict] = useState<string | null>(null)
  const colorClass = side === 'a' ? 'text-[#60A5FA]' : 'text-[#A78BFA]'
  const borderClass = side === 'a' ? 'border-[#1E3E6E]' : 'border-[#3E2878]'

  return (
    <div className={`card-surface flex flex-col min-h-[240px] overflow-hidden ${borderClass}`}>
      {/* Output header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1C1C26] shrink-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono font-medium ${colorClass}`}>{result.endpoint.label}</span>
          {!result.done && !result.error && (
            <Loader2 size={11} className="animate-spin text-[#555575]" />
          )}
          {result.done && !result.error && (
            <span className="text-xs font-mono text-[#4ADE80]">✓ {(result.elapsed_ms / 1000).toFixed(1)}s</span>
          )}
          {result.error && (
            <span className="flex items-center gap-1 text-xs font-mono text-[#E74C3C]">
              <AlertCircle size={11} /> error
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {result.output && (
            <span className="text-xs font-mono text-[#404060]">
              ~{result.output.split(/\s+/).length} words
            </span>
          )}
          <button onClick={onCopy}
            className="p-1 rounded text-[#555575] hover:text-[#C0C0D8] transition-colors"
          >
            {copied ? <Check size={13} className="text-[#4ADE80]" /> : <Copy size={13} />}
          </button>
        </div>
      </div>

      {/* Output content */}
      <div className="flex-1 overflow-y-auto p-4">
        {result.error ? (
          <div className="flex items-start gap-2 text-sm text-[#E74C3C]">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{result.error}</span>
          </div>
        ) : result.output ? (
          <pre className="text-sm text-[#C0C0D8] font-sans whitespace-pre-wrap leading-relaxed">
            {result.output}
            {!result.done && <span className="inline-block w-2 h-4 bg-[#C8961F] ml-0.5 animate-pulse-slow" />}
          </pre>
        ) : (
          <div className="flex items-center gap-2 text-xs font-mono text-[#404060]">
            <Loader2 size={11} className="animate-spin" />
            Waiting for first token…
          </div>
        )}
      </div>

      {/* Classification selector (post-output) */}
      {result.done && result.output && !result.error && (
        <div className="shrink-0 border-t border-[#1C1C26] px-4 py-2.5 flex items-center gap-2">
          <span className="text-xs font-mono text-[#404060]">Classify:</span>
          {(['honey', 'jelly', 'propolis'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setVerdict(verdict === c ? null : c)}
              className={`rounded transition-all ${
                verdict === c
                  ? 'ring-2 ring-offset-1 ring-offset-[#13131A] ring-[#C8961F] scale-105'
                  : verdict !== null
                    ? 'opacity-30 hover:opacity-70'
                    : 'hover:scale-105'
              }`}
            >
              <StatusBadge type="classification" value={c} />
            </button>
          ))}
          {verdict && (
            <span className="ml-1 text-xs font-mono text-[#555575]">
              — {verdict} filed
            </span>
          )}
        </div>
      )}
    </div>
  )
}
