import { useState, useRef } from 'react'
import { Search, Trash2, BookOpen, Tag, Clock, Play, Download, Upload, Plus, Edit2, Check, X } from 'lucide-react'
import type { SavedPrompt } from '../../lib/promptLibrary'
import {
  loadPrompts, deletePrompt, updatePrompt,
  exportLibrary, importLibrary, savePrompt,
} from '../../lib/promptLibrary'
import type { Domain } from '../../types'

const DOMAINS: (Domain | 'General')[] = [
  'General', 'CRE', 'Medical', 'Legal', 'Credit', 'Coding', 'Energy', 'Mining', 'Robotics', 'Custom',
]

const DOMAIN_COLORS: Record<string, string> = {
  CRE: 'text-[#E8B84B] border-[#7A5A10] bg-[#1A1208]',
  Medical: 'text-[#60A5FA] border-[#1E3E6E] bg-[#070F1A]',
  Legal: 'text-[#A78BFA] border-[#3E2878] bg-[#0D0A1A]',
  General: 'text-[#7878A0] border-[#32324A] bg-[#0F0F15]',
  Credit: 'text-[#F59E0B] border-[#7A400A] bg-[#1A0E04]',
  Coding: 'text-[#4ADE80] border-[#14532D] bg-[#061209]',
}

interface Props {
  onRunPrompt: (prompt: SavedPrompt) => void
}

export function PromptLibraryPage({ onRunPrompt }: Props) {
  const [prompts, setPrompts] = useState<SavedPrompt[]>(loadPrompts)
  const [search, setSearch] = useState('')
  const [domainFilter, setDomainFilter] = useState<string>('All')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editTags, setEditTags] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [importMsg, setImportMsg] = useState<string | null>(null)
  const importRef = useRef<HTMLInputElement>(null)

  const refresh = () => setPrompts(loadPrompts())

  const handleDelete = (id: string) => {
    deletePrompt(id)
    refresh()
  }

  const startEdit = (p: SavedPrompt) => {
    setEditingId(p.id)
    setEditLabel(p.label)
    setEditNotes(p.notes ?? '')
    setEditTags(p.tags.join(', '))
  }

  const commitEdit = (id: string) => {
    updatePrompt(id, {
      label: editLabel.trim(),
      notes: editNotes.trim(),
      tags: editTags.split(',').map((t) => t.trim()).filter(Boolean),
    })
    setEditingId(null)
    refresh()
  }

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const count = importLibrary(ev.target?.result as string)
      setImportMsg(`Imported ${count} new prompt${count !== 1 ? 's' : ''}`)
      refresh()
      setTimeout(() => setImportMsg(null), 3000)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const filtered = prompts.filter((p) => {
    const matchSearch = !search ||
      p.label.toLowerCase().includes(search.toLowerCase()) ||
      p.user_prompt.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    const matchDomain = domainFilter === 'All' || p.domain === domainFilter
    return matchSearch && matchDomain
  })

  const domains = ['All', ...Array.from(new Set(prompts.map((p) => p.domain)))]

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-xl text-[#E0E0EC]">Prompt Library</h2>
          <p className="text-sm text-[#555575] mt-1">
            {prompts.length} saved prompt{prompts.length !== 1 ? 's' : ''} · persisted in localStorage
          </p>
        </div>
        <div className="flex items-center gap-2">
          {importMsg && (
            <span className="text-xs font-mono text-[#4ADE80] badge-pass px-2 py-1 rounded border">{importMsg}</span>
          )}
          <button
            onClick={() => importRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-mono
              text-[#555575] border-[#22222E] hover:border-[#32324A] transition-all"
          >
            <Upload size={13} />
            Import
          </button>
          <input ref={importRef} type="file" accept=".json" onChange={handleImportFile} className="hidden" />
          <button
            onClick={exportLibrary}
            disabled={prompts.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-mono
              text-[#7878A0] border-[#22222E] hover:border-[#32324A] transition-all disabled:opacity-40"
          >
            <Download size={13} />
            Export
          </button>
          <button
            onClick={() => setShowNewDialog(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-mono
              bg-[#1A1208] border border-[#7A5A10] text-[#E8B84B] hover:bg-[#251A0A] transition-all"
          >
            <Plus size={13} />
            New Prompt
          </button>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#404060]" />
          <input
            type="text"
            placeholder="Search prompts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0F0F15] border border-[#22222E] rounded pl-9 pr-3 py-2
              text-sm text-[#C0C0D8] placeholder-[#404060] focus:outline-none focus:border-[#555575]"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {domains.map((d) => (
            <button
              key={d}
              onClick={() => setDomainFilter(d)}
              className={`px-2.5 py-1 rounded text-xs font-mono border whitespace-nowrap transition-all
                ${domainFilter === d
                  ? DOMAIN_COLORS[d] ?? 'badge-honey'
                  : 'text-[#555575] border-[#1C1C26] hover:border-[#32324A]'
                }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="card-surface p-12 text-center">
          <BookOpen size={24} className="text-[#333350] mx-auto mb-3" />
          <div className="font-display text-base text-[#555575] mb-1">
            {prompts.length === 0 ? 'Library is empty' : 'No prompts match your search'}
          </div>
          <div className="text-xs text-[#404060]">
            {prompts.length === 0
              ? 'Run a prompt in the Prompt Runner and save it here'
              : 'Try a different search or domain filter'
            }
          </div>
        </div>
      )}

      {/* Prompt cards */}
      <div className="space-y-3">
        {filtered.map((p) => {
          const isEditing = editingId === p.id
          const isExpanded = expandedId === p.id

          return (
            <div key={p.id} className="card-surface overflow-hidden hover:border-[#32324A] transition-colors">
              <div className="p-4 flex items-start gap-3">
                {/* Domain badge */}
                <span className={`px-2 py-0.5 rounded text-xs font-mono border shrink-0 mt-0.5
                  ${DOMAIN_COLORS[p.domain] ?? DOMAIN_COLORS.General}`}>
                  {p.domain}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        autoFocus
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="w-full bg-[#0F0F15] border border-[#32324A] rounded px-2 py-1
                          text-sm text-[#E0E0EC] focus:outline-none focus:border-[#C8961F]"
                      />
                      <input
                        value={editTags}
                        onChange={(e) => setEditTags(e.target.value)}
                        placeholder="Tags (comma separated)"
                        className="w-full bg-[#0F0F15] border border-[#22222E] rounded px-2 py-1
                          text-xs font-mono text-[#A0A0C0] placeholder-[#404060] focus:outline-none focus:border-[#555575]"
                      />
                      <input
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Notes…"
                        className="w-full bg-[#0F0F15] border border-[#22222E] rounded px-2 py-1
                          text-xs text-[#A0A0C0] placeholder-[#404060] focus:outline-none focus:border-[#555575]"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="text-sm font-medium text-[#E0E0EC] mb-1">{p.label}</div>
                      {p.tags.length > 0 && (
                        <div className="flex items-center gap-1 mb-1">
                          <Tag size={10} className="text-[#404060]" />
                          {p.tags.map((t) => (
                            <span key={t} className="text-xs font-mono text-[#555575]">{t}</span>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Prompt preview */}
                  {!isEditing && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : p.id)}
                      className="text-left"
                    >
                      <p className={`text-xs text-[#555575] leading-relaxed font-mono
                        ${isExpanded ? '' : 'line-clamp-2'}`}
                      >
                        {p.user_prompt}
                      </p>
                    </button>
                  )}

                  {/* System prompt preview when expanded */}
                  {isExpanded && p.system_prompt && (
                    <div className="mt-3 p-3 bg-[#070F1A] rounded border border-[#1E3E6E]">
                      <div className="text-xs font-mono text-[#404060] mb-1">System prompt:</div>
                      <p className="text-xs text-[#60A5FA] font-mono leading-relaxed">{p.system_prompt}</p>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-3 mt-2 text-xs font-mono text-[#404060]">
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(p.created_at).toLocaleDateString()}
                    </span>
                    <span>used {p.use_count}×</span>
                    {p.notes && <span className="text-[#555575] truncate max-w-xs">{p.notes}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-start gap-1 shrink-0">
                  {isEditing ? (
                    <>
                      <button onClick={() => commitEdit(p.id)}
                        className="p-1.5 rounded text-[#4ADE80] hover:bg-[#061209] transition-colors">
                        <Check size={14} />
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="p-1.5 rounded text-[#555575] hover:text-[#C0C0D8] transition-colors">
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => onRunPrompt(p)}
                        title="Load into runner"
                        className="p-1.5 rounded text-[#C8961F] hover:bg-[#1A1208] transition-colors"
                      >
                        <Play size={14} />
                      </button>
                      <button
                        onClick={() => startEdit(p)}
                        className="p-1.5 rounded text-[#555575] hover:text-[#C0C0D8] transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded text-[#404060] hover:text-[#E74C3C] transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* New prompt dialog */}
      {showNewDialog && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowNewDialog(false)}>
          <div className="card-elevated p-6 w-full max-w-lg space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="font-display text-base text-[#E0E0EC]">New Prompt</div>
            <NewPromptForm
              onSave={(p) => {
                savePrompt(p)
                refresh()
                setShowNewDialog(false)
              }}
              onCancel={() => setShowNewDialog(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function NewPromptForm({ onSave, onCancel }: {
  onSave: (p: Omit<SavedPrompt, 'id' | 'created_at' | 'use_count'>) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState({
    label: '',
    domain: 'General' as Domain | 'General',
    tags: '',
    system_prompt: '',
    user_prompt: '',
    notes: '',
  })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="space-y-3">
      <input
        autoFocus
        placeholder="Label (e.g. Memphis 312 Interest Coverage Test)"
        value={form.label}
        onChange={(e) => set('label', e.target.value)}
        className="w-full bg-[#0F0F15] border border-[#22222E] rounded px-3 py-2
          text-sm text-[#C0C0D8] placeholder-[#404060] focus:outline-none focus:border-[#555575]"
      />
      <div className="grid grid-cols-2 gap-3">
        <select
          value={form.domain}
          onChange={(e) => set('domain', e.target.value)}
          className="bg-[#0F0F15] border border-[#22222E] rounded px-3 py-2
            text-sm text-[#C0C0D8] focus:outline-none focus:border-[#555575]"
        >
          {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <input
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={(e) => set('tags', e.target.value)}
          className="bg-[#0F0F15] border border-[#22222E] rounded px-3 py-2
            text-xs font-mono text-[#C0C0D8] placeholder-[#404060] focus:outline-none focus:border-[#555575]"
        />
      </div>
      <textarea
        placeholder="System prompt (optional)"
        value={form.system_prompt}
        onChange={(e) => set('system_prompt', e.target.value)}
        rows={2}
        className="w-full bg-[#0F0F15] border border-[#22222E] rounded px-3 py-2
          text-sm text-[#C0C0D8] placeholder-[#404060] focus:outline-none focus:border-[#555575] resize-none"
      />
      <textarea
        placeholder="User prompt *"
        value={form.user_prompt}
        onChange={(e) => set('user_prompt', e.target.value)}
        rows={4}
        className="w-full bg-[#0F0F15] border border-[#22222E] rounded px-3 py-2
          text-sm text-[#C0C0D8] placeholder-[#404060] focus:outline-none focus:border-[#555575] resize-none"
      />
      <input
        placeholder="Notes (optional)"
        value={form.notes}
        onChange={(e) => set('notes', e.target.value)}
        className="w-full bg-[#0F0F15] border border-[#22222E] rounded px-3 py-2
          text-xs text-[#C0C0D8] placeholder-[#404060] focus:outline-none focus:border-[#555575]"
      />
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => form.user_prompt.trim() && onSave({
            ...form,
            tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
          })}
          disabled={!form.label.trim() || !form.user_prompt.trim()}
          className="flex-1 py-2 rounded bg-[#1A1208] border border-[#7A5A10]
            text-sm font-mono text-[#E8B84B] hover:bg-[#251A0A] disabled:opacity-40 transition-all"
        >
          Save to Library
        </button>
        <button onClick={onCancel}
          className="px-4 py-2 rounded border border-[#22222E] text-sm font-mono text-[#555575] hover:border-[#32324A]">
          Cancel
        </button>
      </div>
    </div>
  )
}
