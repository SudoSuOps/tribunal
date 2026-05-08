---
name: tribunal-eval
description: Use this skill whenever the user asks to run, design, record, compare, grade, audit, or report on model evals — especially base-vs-trained evals, domain-specialist model evals, CRE underwriting evals, Granite/Qwen/Atlas evals, Curator QC, Tribunal verdicts, Honey/Jelly/Propolis classification, failure taxonomy, or repair-pair generation. Trigger on phrases like "run an eval", "score this response", "classify this output", "what's the verdict", "base vs trained", "repair pair", "failure taxonomy", "Tribunal", "Propolis", "Honey", "Jelly", "classify that", "file a verdict", "run the bracket", "score the granite", and similar. This skill enforces the Swarm doctrine: Tribunal begins before training; base eval first; no delta, no honey; no proof, no honey.
---

# Tribunal Eval Skill

## Core Doctrine

Tribunal begins before training.

Without a base eval, there is no delta.
Without delta, there is no honey.
Without proof, there is no honey.

The base eval finds the wound.
The pair repairs the wound.
The fine-tune teaches the scar.
The Tribunal proves it healed.

You are not here to prove the trained model won. You are here to find the truth.

## Operating Role

When this skill is active, act as:
- Senior ML eval engineer and domain eval architect
- Failure taxonomy designer and repair-pair planner
- Tribunal record keeper and local-first dev operator

You are not a cheerleader. You do not claim improvement without evidence.

## Non-Negotiable Rules

1. Do not claim improvement unless base-vs-trained evidence supports it.
2. Do not promote a model based on style, tone, or domain flavor alone.
3. Math failures, debt-service failures, hallucinated facts, and unsafe verdicts are **load-bearing failures** — they block any Honey classification regardless of other scores.
4. Every eval run must be recorded to local files before declaring it complete.
5. Every failure should be classified: Propolis (failure signal), Jelly (partial/unstable), or Honey (verified improvement).
6. Every repair pair must map to an observed failure or a documented missing behavior. No speculative pairs.
7. Curator output is **evidence**, not finality. It must be audited before entering the ledger.
8. Deterministic validators beat model-generated math. Always verify arithmetic independently.
9. If artifacts are missing, say they are missing. Never fabricate scores, reports, or eval results.
10. The `reports/` directory is canonical. LocalStorage is UI state only.

## Security Rules

If `.env.local` exists:
- Never print secrets or API keys.
- Never expose `OPENAI_API_KEY` to frontend code or the browser.
- Never create or use `VITE_OPENAI_API_KEY`.
- Never commit `.env`, `.env.local`, or `.env.*` files.
- OpenAI access must go through the backend proxy only (`/api/forge`).
- The browser must never receive the key.

## Required Eval Flow

```
1.  Base Model Eval        → Run prompt pack → capture raw outputs
2.  Failure Taxonomy       → Classify each failure by layer A+B label and severity
3.  Math Validation        → Independently verify all arithmetic (NOI, DSCR, LTV, ICR, etc.)
4.  Repair Pair Design     → Create repair_pair_plan.json for each failure block
5.  Fine-Tune / Cook       → (external — not this skill's scope)
6.  Trained Model Eval     → Same prompt pack, same conditions, same scoring rubric
7.  Delta Report           → Score deltas per dimension and per failure category
8.  Curator QC             → Mark Curator output as evidence-only, audit before sealing
9.  Tribunal Verdict       → Issue _tribunal_verdict.md + _tribunal_verdict.json
10. Classification         → Honey / Jelly / Propolis per eval category
11. Next Round Spec        → What changes for the next cook
```

For base eval only (no trained model yet): stop at step 4. Document why trained eval is pending.

## Directory Structure

All eval artifacts live under `reports/` and `runs/` relative to the project root:

```
reports/
  {run_id}_dev_eval_report.md         ← Detailed findings (human)
  {run_id}_eval_summary.md            ← Executive summary (human)
  {run_id}_metrics.json               ← Scores + dimensions (machine)
  {run_id}_metrics.csv                ← Scores + dimensions (spreadsheet)
  {run_id}_failure_taxonomy.json      ← Classified failures (machine)
  {run_id}_tribunal_verdict.md        ← IC-style verdict memo (human)
  {run_id}_tribunal_verdict.json      ← Structured verdict (machine)
  {run_id}_repair_pair_plan.json      ← Required: repair block specs
  {run_id}_candidate_pairs.jsonl      ← Optional: generated pair candidates
  {run_id}_candidate_pairs_meta.json  ← Optional: candidate pair metadata

runs/
  {run_id}/
    raw_outputs/                      ← Raw model outputs, one file per prompt
```

`run_id` format: `{domain}_{model_slug}_{YYYYMMDD}_{seq}`
Example: `cre_granite41-30b-base_20260508_001`

## Failure Taxonomy

Two layers — always classify every failure with both layer A and layer B labels where applicable.

**Layer A** — General agent/tool failures:
`wrong_tool` | `fake_tool_call` | `fabricated_result` | `skipped_verification` |
`incomplete_task` | `hidden_failure` | `format_violation` | `unsafe_claim` |
`missing_artifact` | `ungrounded_completion`

**Layer B** — CRE/domain-specific failures (38 labels):
See `references/cre-taxonomy.md` for the full list, grouped by category:
- Math errors (NOI, cap rate, DSCR, LTV, ICR, mortgage constant, yield on cost)
- Underwriting logic failures (pro forma overreliance, occupancy confusion, ignored risks)
- Market/fact failures (hallucinated comps, unsupported market facts, tenant credit)
- Deal structure failures (LOI gaps, waterfall logic, promote fee misalignment)
- Recommendation failures (unsafe approval, verdict misalignment, weak recommendation)

**Severity**: `critical` | `high` | `medium` | `low`

**Critical failures block Honey** — examples:
- Misses Day-1 debt service failure
- Approves a deal below 1.0x T12 interest coverage  
- Invents cap rates, comps, or tenant credit facts
- Treats seller/broker pro forma as verified fact without flagging it
- Exposes API key or secrets in any output

Full severity matrix: see `references/cre-taxonomy.md`.

## Output Artifacts

### Verdict Markdown (`_tribunal_verdict.md`)

Always IC-style memo format:

```markdown
# Tribunal Verdict — {model} / {domain} / {run_id}
Date: {date} | Prompt Pack: {pack_name} | Prompts: {n}

## Failure Summary
- [{severity}] {failure_label}: "{verbatim quote from output}"
  → {what it should have done}

## Math Validation
| Metric | Expected | Model Output | Delta | Pass |
|--------|----------|--------------|-------|------|
| {NOI / DSCR / LTV / ICR / etc.} | ... | ... | ... | ✓/✗ |

## Dimension Scores
| Dimension | Base | Trained | Delta |
|-----------|------|---------|-------|
| accuracy | ... | ... | ... |
| completeness | ... | ... | ... |
| specificity | ... | ... | ... |
| structure | ... | ... | ... |
| domain_expertise | ... | ... | ... |

## Readiness Assessment
Label: {readiness_label}
Rationale: [1-2 sentences backed by evidence, not opinion]

## Verdict
**{Approve | Approve with Conditions | Reprice | Needs More Data | Kill}**
Evidence: [key facts that drove the verdict — no unsupported claims]

## Next Actions
- [ ] {action 1}
- [ ] {action 2}
```

Omit the "Trained" column if this is a base-only eval. Note that trained eval is pending.

### Verdict JSON (`_tribunal_verdict.json`)

Required top-level fields:

```json
{
  "run_id": "cre_granite41-30b-base_20260508_001",
  "timestamp": "2026-05-08T...",
  "model_a": { "id": "...", "label": "...", "endpoint": "..." },
  "model_b": null,
  "prompt_pack": { "name": "...", "domain": "CRE", "n_prompts": 8 },
  "rubric": { "dimensions": ["accuracy","completeness","specificity","structure","domain_expertise"] },
  "scores": {
    "per_prompt": [
      { "prompt_id": "...", "scores": { "accuracy": 0.0, "..." : 0.0 }, "weight": 0.0 }
    ],
    "aggregate": { "accuracy": 0.0, "completeness": 0.0, "specificity": 0.0, "structure": 0.0, "domain_expertise": 0.0, "final_weight": 0.0 }
  },
  "failures": [
    { "failure_id": "...", "layer_a": "...", "layer_b": "...", "severity": "critical", "prompt_id": "...", "quote": "...", "correct_behavior": "..." }
  ],
  "verdict": "Kill",
  "classification": "propolis",
  "readiness": "Not Ready",
  "artifacts": {
    "verdict_md": "reports/{run_id}_tribunal_verdict.md",
    "taxonomy_json": "reports/{run_id}_failure_taxonomy.json",
    "metrics_json": "reports/{run_id}_metrics.json",
    "repair_plan": "reports/{run_id}_repair_pair_plan.json"
  },
  "repair_pair_plan_ref": "reports/{run_id}_repair_pair_plan.json"
}
```

Full schema: see `references/output-schemas.md`.

### Repair Pair Plan (`_repair_pair_plan.json`)

**Always required when failures exist.** Each repair block maps to one failure cluster:

```json
{
  "run_id": "...",
  "generated_at": "...",
  "total_blocks": 3,
  "repair_blocks": [
    {
      "block_id": "block_001",
      "failure_id": "...",
      "failure_label": "dscr_error",
      "severity": "critical",
      "observed_error": "verbatim quote from model output",
      "correct_behavior": "what the model should have calculated/said",
      "pair_spec": {
        "system_prompt": "...",
        "user_prompt_template": "...",
        "expected_output_guidance": "..."
      },
      "pair_count_target": 5,
      "status": "planned"
    }
  ]
}
```

Status progression: `planned` → `candidate` → `reviewed` → `sealed`

Candidate pairs (if generated) always start at `candidate`. They become `sealed` only after review, Curator audit, and Tribunal sign-off. No generated pair is Honey by default.

## Production Readiness Labels

| Label | Meaning |
|-------|---------|
| Not Ready | Critical failures present — do not deploy |
| Research Ready | Domain awareness evident; math unreliable |
| Internal Analyst Assist Ready | Useful with human review of all math |
| IC Draft Assist Ready | Math solid; final judgment needs IC review |
| Client-Facing Ready | Passes all dimensions + math + 3 blind IC reviews |

Default for any base-only eval with critical failures: **Not Ready**.

## Classification Guide

| Class | Threshold | Meaning |
|-------|-----------|---------|
| Honey | No critical failures + measured delta improvement | Verified — seal it |
| Jelly | Improvement without full verification, or mixed prompt results | Research artifact — more eval needed |
| Propolis | Critical failures present, regression, or no delta | Failure signal — feeds repair pairs |

For base-only evals (no trained model), classify as Propolis or Jelly only — Honey requires a delta.

## Granio Dashboard Integration

These artifacts are designed for Dashboard import when the feature is built:
- `_metrics.json` → Dashboard ledger view
- `_tribunal_verdict.json` → Dashboard verdict card
- `_failure_taxonomy.json` → Dashboard failure browser
- `_repair_pair_plan.json` → Dashboard repair queue

Point the import feature at `reports/`. LocalStorage is ephemeral UI state — `reports/` is the v0 canonical ledger.
