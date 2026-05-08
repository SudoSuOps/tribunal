# OpenAI Integration — Prompt Forge

## Role of OpenAI in Granio

OpenAI (or any local model) **assists generation** inside the Prompt Forge.
It does not evaluate, score, or seal anything.

| Layer | What Runs It | Finality |
|-------|-------------|---------|
| Prompt generation | OpenAI API or local model | None — all output is `candidate` |
| Eval execution | Local Ollama / vLLM | None — result logged to runner |
| Weighing / scoring | Swarm Tribunal (gemma3:12b + qwen2.5:32b) | `propolis` class until scored |
| Class assignment | Swarm Tribunal | Class A/B/C assigned at weigh time |
| Deed recording | Deed recorder (Zima Edge) | Sealed on Hedera HCS |

**Tribunal finality is always local.** OpenAI-generated prompts are candidates —
they only become weighted pairs after the local dual-scale tribunal evaluates
the model's response.

## Artifact Status vs. Tribunal Class

These are orthogonal and intentionally separate:

```
status: 'candidate' | 'accepted' | 'rejected'   ← workflow (you decide)
class:  'propolis'                                ← quality (tribunal decides)
```

A generated prompt starts as `status: candidate, class: propolis`.
Accepting it via the Forge UI makes it `status: accepted, class: propolis`.
Promoting it to the Prompt Library lets you run it through a model in the Runner.
The class only changes when the Swarm Tribunal actually weighs the response.

## Security Model

**This integration is dev-only.**

`VITE_` prefixed variables in Vite are compiled into the browser bundle.
The OpenAI API key set in `.env.local` as `VITE_OPENAI_API_KEY` is:
- Readable by anyone who opens browser devtools → Network tab
- Bundled into the compiled JS at build time
- Safe for local development on a trusted machine
- **Unsafe for any public or shared deployment**

For production or shared hosting, proxy OpenAI calls through a backend server
that holds `OPENAI_API_KEY` as a true server-side secret.

## Local Model Fallback

If `VITE_OPENAI_API_KEY` is not set, the Forge falls back to local model generation
via any configured Ollama or OpenAI-compatible endpoint (e.g. vLLM).

Local generation is less reliable for structured JSON output — responses are parsed
with a best-effort JSON extractor. A capable local model (27B+) produces good results.

## JSON Schema (Eval Prompts)

OpenAI generation uses `response_format: json_schema` (strict mode) with GPT-4o-mini
or GPT-4o. The schema is defined in `src/lib/forgeSchemas.ts`.

Each eval prompt artifact contains:
- `label` — short title
- `system_prompt` — empty string for base model evals
- `user_prompt` — the actual prompt (completion-style for base, instruction for instruct)
- `expected_signal` — what a domain-expert response looks like
- `failure_modes` — list of concrete ways a weak model would fail
- `tags` — taxonomy tags

## Export Format

Export produces a flat JSON array of `ForgeArtifact` objects.
The `tribunal_class: "propolis"` field on every exported artifact signals to any
downstream consumer that these have not been weighed yet.

Accepted artifacts promoted to the Prompt Library are tagged with `forge-generated`
and `propolis` so they're distinguishable from hand-written prompts.

## Future: Pass 2

Planned additional artifact types (v2):
- `repair_pair` — broken output + repaired output + failure label
- `rubric` — per-domain scoring rubric with weighted dimensions
- `validator_signal` — what to look for in a model response (positive/negative examples)
