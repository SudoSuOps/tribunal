import { streamCompletion } from './promptLibrary'
import type { ModelEndpoint, RunOptions } from './promptLibrary'
import type { Domain } from '../types'
import type { EvalPromptPayload } from './forgeSchemas'

// ─── Provider types ───────────────────────────────────────────────────────────

export type ProviderKind = 'ollama' | 'openai-compatible' | 'openai-proxy'

export type ForgeArtifactType = 'eval_prompt'
// Future: 'repair_pair' | 'rubric' | 'validator_signal'

export type ForgeArtifactStatus = 'candidate' | 'accepted' | 'rejected'

export interface ForgeArtifact<T = EvalPromptPayload> {
  id: string
  type: ForgeArtifactType
  status: ForgeArtifactStatus
  // tribunal_class is always 'propolis' until the local Swarm Tribunal scores it
  tribunal_class: 'propolis'
  domain: Domain | 'General'
  created_at: string
  generated_by: string
  payload: T
}

// ─── Proxy health check ───────────────────────────────────────────────────────

export interface ProxyHealth {
  ok: boolean
  note: string
}

export async function checkProxyHealth(): Promise<ProxyHealth> {
  try {
    const res = await fetch('/api/forge/health')
    if (!res.ok) return { ok: false, note: `Proxy responded ${res.status}` }
    return await res.json() as ProxyHealth
  } catch {
    return { ok: false, note: 'Forge proxy not running — start with: npm run server' }
  }
}

export const OPENAI_MODELS = [
  { id: 'gpt-4o-mini', label: 'GPT-4o mini (fast · cheap)' },
  { id: 'gpt-4o', label: 'GPT-4o (quality)' },
  { id: 'o3-mini', label: 'o3-mini (reasoning)' },
] as const

// ─── OpenAI generation via backend proxy ─────────────────────────────────────

async function generateViaProxy(
  type: ForgeArtifactType,
  domain: string,
  count: number,
  intent: string,
  modelType: 'base' | 'instruct',
  model: string,
): Promise<EvalPromptPayload[]> {
  const res = await fetch('/api/forge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, domain, count, intent, modelType, model }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error ?? `Forge proxy error ${res.status}`)
  }

  const data = await res.json()
  return data.artifacts as EvalPromptPayload[]
}

// ─── Local model forge generation (JSON prompt + extract) ────────────────────

function buildLocalForgePrompt(
  type: ForgeArtifactType,
  domain: string,
  count: number,
  intent: string,
  modelType: 'base' | 'instruct',
): { system: string; user: string } {
  const modeNote =
    modelType === 'base'
      ? 'BASE mode: prompts must be partial professional documents/calculations for the model to continue as a text completion task — NOT questions.'
      : 'INSTRUCT mode: prompts are direct questions or instructions.'

  return {
    system: `You generate evaluation prompts for testing LLM domain knowledge. Output ONLY a valid JSON array — no markdown, no explanation.`,
    user: `Generate ${count} ${domain} domain evaluation prompts for ${modelType.toUpperCase()} model testing.
${modeNote}
Intent: ${intent}

Output a JSON array of objects, each with these exact keys:
- "label": short title
- "system_prompt": string (empty "" for base models)
- "user_prompt": the prompt text
- "expected_signal": what correct domain-expert output looks like
- "failure_modes": array of 2-3 failure descriptions
- "tags": array of taxonomy tags

Output ONLY the JSON array. No other text.`,
  }
}

async function extractJSONArray(raw: string): Promise<unknown[]> {
  const cleaned = raw.trim()
  const arrMatch = cleaned.match(/\[[\s\S]*\]/)
  if (arrMatch) return JSON.parse(arrMatch[0])
  return JSON.parse(cleaned)
}

async function generateWithLocalModel(
  endpoint: ModelEndpoint,
  type: ForgeArtifactType,
  domain: string,
  count: number,
  intent: string,
  modelType: 'base' | 'instruct',
): Promise<EvalPromptPayload[]> {
  const { system, user } = buildLocalForgePrompt(type, domain, count, intent, modelType)

  return new Promise((resolve, reject) => {
    let full = ''
    streamCompletion({
      endpoint,
      system_prompt: system,
      user_prompt: user,
      temperature: 0.7,
      max_tokens: 4096,
      onToken: (t) => { full += t },
      onDone: async () => {
        try {
          const arr = await extractJSONArray(full)
          resolve(arr as EvalPromptPayload[])
        } catch (e) {
          reject(new Error(`Failed to parse local model JSON: ${e}. Raw: ${full.slice(0, 200)}`))
        }
      },
      onError: reject,
    } as RunOptions)
  })
}

// ─── Unified forge entry point ────────────────────────────────────────────────

export interface ForgeOptions {
  type: ForgeArtifactType
  domain: Domain | 'General'
  count: number
  intent: string
  modelType: 'base' | 'instruct'
  useProxy: boolean
  openAIModel?: string
  localEndpoint?: ModelEndpoint
}

export async function forgeArtifacts(opts: ForgeOptions): Promise<ForgeArtifact[]> {
  const { type, domain, count, intent, modelType, useProxy, openAIModel, localEndpoint } = opts

  let payloads: EvalPromptPayload[]

  if (useProxy) {
    payloads = await generateViaProxy(type, domain, count, intent, modelType, openAIModel ?? 'gpt-4o-mini')
  } else {
    if (!localEndpoint) throw new Error('No local endpoint selected')
    payloads = await generateWithLocalModel(localEndpoint, type, domain, count, intent, modelType)
  }

  const now = new Date().toISOString()
  const generatedBy = useProxy
    ? `openai:${openAIModel ?? 'gpt-4o-mini'} (via proxy)`
    : `local:${localEndpoint?.id}`

  return payloads.map((payload, i) => ({
    id: `forge_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
    type,
    status: 'candidate' as const,
    tribunal_class: 'propolis' as const,
    domain,
    created_at: now,
    generated_by: generatedBy,
    payload,
  }))
}

// ─── Forge artifact persistence ───────────────────────────────────────────────

const FORGE_KEY = 'granio_forge_artifacts'

export function loadForgeArtifacts(): ForgeArtifact[] {
  try {
    const raw = localStorage.getItem(FORGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveForgeArtifacts(artifacts: ForgeArtifact[]): void {
  localStorage.setItem(FORGE_KEY, JSON.stringify(artifacts))
}

export function updateForgeArtifact(id: string, updates: Partial<ForgeArtifact>): void {
  const all = loadForgeArtifacts()
  const idx = all.findIndex((a) => a.id === id)
  if (idx === -1) return
  all[idx] = { ...all[idx], ...updates }
  saveForgeArtifacts(all)
}

export function exportForgeArtifacts(artifacts: ForgeArtifact[]): void {
  const blob = new Blob([JSON.stringify(artifacts, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `granio_forge_${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Unified stream — delegates to existing streamCompletion
export { streamCompletion } from './promptLibrary'
export type { RunOptions, ModelEndpoint } from './promptLibrary'
