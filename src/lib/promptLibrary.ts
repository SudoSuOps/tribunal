import type { Domain } from '../types'

export interface SavedPrompt {
  id: string
  label: string
  domain: Domain | 'General'
  tags: string[]
  system_prompt: string
  user_prompt: string
  created_at: string
  last_used?: string
  use_count: number
  notes?: string
}

export interface ModelEndpoint {
  id: string
  label: string
  base_url: string
  api_type: 'ollama' | 'openai'
  model_name: string
  color: 'base' | 'cooked' | 'honey' | 'neutral'
}

const STORAGE_KEY = 'granio_prompt_library'
const ENDPOINTS_KEY = 'granio_model_endpoints'

// ─── Default fleet endpoints ──────────────────────────────────────────────────

export const DEFAULT_ENDPOINTS: ModelEndpoint[] = [
  {
    id: 'qwen36-27b-base',
    label: 'Qwen 3.6 27B Base',
    base_url: 'http://localhost:11434',
    api_type: 'ollama',
    model_name: 'qwen2.5:32b',
    color: 'base',
  },
  {
    id: 'atlas27b-cook-v1',
    label: 'Atlas 27B Cook v1',
    base_url: 'http://localhost:8082',
    api_type: 'openai',
    model_name: 'swarmcurator-27b',
    color: 'cooked',
  },
  {
    id: 'swarmcurator-9b',
    label: 'SwarmCurator 9B',
    base_url: 'http://192.168.0.99:8081',
    api_type: 'openai',
    model_name: 'swarmcurator-9b',
    color: 'honey',
  },
  {
    id: 'masterwriter-31b',
    label: 'MasterWriter 31B',
    base_url: 'http://localhost:11434',
    api_type: 'ollama',
    model_name: 'masterwriter:31b',
    color: 'neutral',
  },
]

// ─── Prompt library CRUD ──────────────────────────────────────────────────────

export function loadPrompts(): SavedPrompt[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function savePrompt(prompt: Omit<SavedPrompt, 'id' | 'created_at' | 'use_count'>): SavedPrompt {
  const prompts = loadPrompts()
  const newPrompt: SavedPrompt = {
    ...prompt,
    id: `prompt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    created_at: new Date().toISOString(),
    use_count: 0,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newPrompt, ...prompts]))
  return newPrompt
}

export function updatePrompt(id: string, updates: Partial<SavedPrompt>): void {
  const prompts = loadPrompts()
  const idx = prompts.findIndex((p) => p.id === id)
  if (idx === -1) return
  prompts[idx] = { ...prompts[idx], ...updates }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts))
}

export function deletePrompt(id: string): void {
  const prompts = loadPrompts().filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts))
}

export function touchPrompt(id: string): void {
  const prompts = loadPrompts()
  const idx = prompts.findIndex((p) => p.id === id)
  if (idx === -1) return
  prompts[idx].last_used = new Date().toISOString()
  prompts[idx].use_count = (prompts[idx].use_count ?? 0) + 1
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts))
}

export function exportLibrary(): void {
  const prompts = loadPrompts()
  const blob = new Blob([JSON.stringify(prompts, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `granio_prompt_library_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importLibrary(json: string): number {
  try {
    const incoming: SavedPrompt[] = JSON.parse(json)
    if (!Array.isArray(incoming)) return 0
    const existing = loadPrompts()
    const existingIds = new Set(existing.map((p) => p.id))
    const merged = [...existing, ...incoming.filter((p) => !existingIds.has(p.id))]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    return incoming.filter((p) => !existingIds.has(p.id)).length
  } catch {
    return 0
  }
}

// ─── Endpoint management ──────────────────────────────────────────────────────

export function loadEndpoints(): ModelEndpoint[] {
  try {
    const raw = localStorage.getItem(ENDPOINTS_KEY)
    return raw ? JSON.parse(raw) : DEFAULT_ENDPOINTS
  } catch {
    return DEFAULT_ENDPOINTS
  }
}

export function saveEndpoints(endpoints: ModelEndpoint[]): void {
  localStorage.setItem(ENDPOINTS_KEY, JSON.stringify(endpoints))
}

// ─── Streaming inference ──────────────────────────────────────────────────────

export interface RunOptions {
  endpoint: ModelEndpoint
  system_prompt: string
  user_prompt: string
  temperature?: number
  max_tokens?: number
  onToken: (token: string) => void
  onDone: (full: string) => void
  onError: (err: string) => void
  signal?: AbortSignal
}

export async function streamCompletion(opts: RunOptions): Promise<void> {
  const { endpoint, system_prompt, user_prompt, temperature = 0.3, max_tokens = 2048, onToken, onDone, onError, signal } = opts

  const messages = [
    ...(system_prompt.trim() ? [{ role: 'system', content: system_prompt }] : []),
    { role: 'user', content: user_prompt },
  ]

  let url: string
  let body: unknown

  if (endpoint.api_type === 'ollama') {
    url = `${endpoint.base_url}/api/chat`
    body = {
      model: endpoint.model_name,
      messages,
      stream: true,
      options: { temperature, num_predict: max_tokens },
    }
  } else {
    url = `${endpoint.base_url}/v1/chat/completions`
    body = {
      model: endpoint.model_name,
      messages,
      stream: true,
      temperature,
      max_tokens,
    }
  }

  let full = ''

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    })

    if (!res.ok) {
      const text = await res.text()
      onError(`HTTP ${res.status}: ${text.slice(0, 200)}`)
      return
    }

    const reader = res.body?.getReader()
    if (!reader) { onError('No response body'); return }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') continue

        const jsonStr = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed
        try {
          const parsed = JSON.parse(jsonStr)
          let token = ''

          if (endpoint.api_type === 'ollama') {
            token = parsed?.message?.content ?? ''
          } else {
            token = parsed?.choices?.[0]?.delta?.content ?? ''
          }

          if (token) {
            full += token
            onToken(token)
          }
        } catch {
          // partial JSON line — skip
        }
      }
    }

    onDone(full)
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      onDone(full)
    } else {
      const msg = err instanceof Error ? err.message : String(err)
      onError(msg.includes('Failed to fetch') ? `Cannot reach ${endpoint.base_url} — is the model server running?` : msg)
    }
  }
}
