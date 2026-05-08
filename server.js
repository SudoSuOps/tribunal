// Granio Tribunal — OpenAI forge proxy
// Runs on :3001. Vite dev server proxies /api → this server.
// OPENAI_API_KEY is read from .env.local — never exposed to the browser.

import express from 'express'
import dotenv from 'dotenv'

// Schema inlined from src/lib/forgeSchemas.ts — static, no runtime TS needed
const EVAL_PROMPT_SCHEMA = {
  name: 'eval_prompts',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      artifacts: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            label:           { type: 'string' },
            system_prompt:   { type: 'string' },
            user_prompt:     { type: 'string' },
            expected_signal: { type: 'string' },
            failure_modes:   { type: 'array', items: { type: 'string' } },
            tags:            { type: 'array', items: { type: 'string' } },
          },
          required: ['label', 'system_prompt', 'user_prompt', 'expected_signal', 'failure_modes', 'tags'],
          additionalProperties: false,
        },
      },
    },
    required: ['artifacts'],
    additionalProperties: false,
  },
}

dotenv.config({ path: '.env.local' })

const app = express()
const PORT = 3001

app.use(express.json())

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/api/forge/health', (_req, res) => {
  const ready = !!process.env.OPENAI_API_KEY
  res.json({
    ok: ready,
    note: ready ? 'forge proxy ready' : 'OPENAI_API_KEY not set in .env.local',
  })
})

// ─── Forge generation proxy ───────────────────────────────────────────────────

app.post('/api/forge', async (req, res) => {
  const key = process.env.OPENAI_API_KEY
  if (!key) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured — check .env.local' })
  }

  const { type, domain, count, intent, modelType, model = 'gpt-4o-mini' } = req.body

  // Basic validation
  if (!intent || typeof intent !== 'string') {
    return res.status(400).json({ error: '"intent" string required' })
  }
  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: '"domain" string required' })
  }
  if (type !== 'eval_prompt') {
    return res.status(400).json({ error: `Unknown artifact type "${type}"` })
  }

  const modeNote =
    modelType === 'base'
      ? 'BASE mode — prompts must be partial professional documents that the model completes as text continuation. NOT questions or instructions.'
      : 'INSTRUCT mode — prompts are direct questions or instructions to the model.'

  const systemPrompt = `You are an expert in generating high-quality LLM evaluation prompts for the ${domain} domain.
You write prompts that precisely test domain-specific knowledge, numerical reasoning, and professional vocabulary.
${modeNote}`

  const userPrompt = `Generate exactly ${count} ${domain} evaluation prompt(s).
Intent: ${intent}

Requirements:
- Each user_prompt must read like a fragment of a real ${domain} professional document
- system_prompt must be empty string "" for base model evals
- expected_signal must name specific numbers, terms, or reasoning steps a domain expert would produce
- failure_modes must describe concrete ways a poor model would fail (wrong number, wrong term, surface-level answer)
- tags must be specific taxonomy terms (not generic labels)`

  let upstream
  try {
    upstream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: EVAL_PROMPT_SCHEMA,
        },
        temperature: 0.8,
      }),
    })
  } catch (err) {
    return res.status(502).json({ error: `Cannot reach OpenAI: ${err.message}` })
  }

  if (!upstream.ok) {
    const text = await upstream.text()
    return res.status(upstream.status).json({ error: `OpenAI ${upstream.status}: ${text.slice(0, 300)}` })
  }

  const data = await upstream.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) {
    return res.status(502).json({ error: 'No content in OpenAI response' })
  }

  let artifacts
  try {
    artifacts = JSON.parse(content).artifacts
  } catch {
    return res.status(502).json({ error: 'Failed to parse OpenAI response as JSON' })
  }

  res.json({ artifacts })
})

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  const keyStatus = process.env.OPENAI_API_KEY ? 'loaded ✓' : 'NOT SET ✗'
  console.log(`Granio forge proxy  :${PORT}  OpenAI key: ${keyStatus}`)
})
