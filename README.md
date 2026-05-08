# Granio Tribunal Dashboard

**Base model domain eval ledger · Failure-to-pair refinery · Swarm Tribunal**

Granio is the local operating room for base model domain evals. It records, documents, compares, and classifies model evaluations so we can generate repair pairs for future domain-specialist models.

This is not just a UI. This is the base-model eval ledger for the Swarm.

---

## Why base eval comes first

> Tribunal begins before training.
>
> Without a base eval, there is no delta. Without delta, there is no honey.

Every fine-tune begins with a base model. That base model has strengths and weaknesses on the target domain. If we cook without measuring the base, we cannot know whether the cook improved anything — or made things worse.

The Atlas 27B Cook v1 verdict is the proof: a 73-hour cook produced a model that regressed on 6 of 10 load-bearing institutional skills. We know this because we ran the base eval first. Without Granio, we would have shipped the regressed model as an improvement.

**No base eval. No delta. No honey.**

---

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

To build for production:

```bash
npm run build
npm run preview
```

Type check only:

```bash
npm run typecheck
```

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Vite + React 18 + TypeScript |
| Styling | Tailwind CSS 3 + custom CSS tokens |
| Charts | Recharts |
| Icons | lucide-react |
| Storage | Local JSON (v0) |
| Fonts | Libre Baskerville · IBM Plex Mono · DM Sans |

No backend. No database (v0). No auth. No cloud dependencies.

---

## Pages

| Page | Purpose |
|------|---------|
| Dashboard | Metrics overview, readiness status, recent runs |
| Eval Runs | Ledger of all eval sessions |
| Run Detail | Prompt-by-prompt results, artifacts, import/export |
| Model Comparison | Base vs cooked dimension-by-dimension with radar and delta charts |
| Failure Taxonomy | Classified failures with base/trained/expected behavior, examples |
| Pair Factory | Repair block specs, target counts, JSON export per block |
| Curator QC | Curator accuracy, acceptable uses, pipeline architecture |
| Tribunal Verdicts | Sealed verdicts with decision, rationale, deploy path |
| Doctrine | The principles governing eval, classification, and training integrity |

---

## How to add eval artifacts

1. Run your eval and produce:
   - `reports/<run_id>_eval_report.md` — full narrative
   - `reports/<run_id>_eval_summary.md` — executive summary
   - `reports/<run_id>_eval_metrics.json` — structured scores
   - `reports/<run_id>_eval_metrics.csv` — tabular data

2. Import them in the **Run Detail → Import Artifacts** panel (browser-side, no backend needed).

3. For v1, add the run to `src/data/seed.ts` following the `EvalRun` type. The app will show it immediately.

---

## How to generate pair specs

1. Navigate to **Failure Taxonomy** and identify failures with `repair_needed: true`.

2. Navigate to **Pair Factory** and expand the corresponding repair block.

3. Click **Generate Pair Spec JSON** to download the pair metadata template.

4. Use the template to brief your pair generation pipeline (SwarmCurator, vLLM, etc.).

The exported file format:

```json
{
  "block_id": "bridge_refi_failure_pairs",
  "generated_specs": [
    {
      "pair_id": "atlas_mf_bridge_refi_001",
      "source_eval": "base_eval_memphis_312",
      "base_failure_type": "missed_refinance_risk",
      "repair_goal": "force interest-coverage calculation and conservative IC verdict",
      "domain": "multifamily_underwriting",
      "expected_behavior": "...",
      "classification_target": "honey",
      "target_block": "bridge_refi_failure_pairs",
      "target_count": 5000
    }
  ]
}
```

---

## Data model overview

See `docs/eval-ledger-schema.md` for the full schema.

Key types:

- **EvalRun** — a complete eval session with prompt results, artifacts, findings
- **ModelComparison** — dimension-by-dimension base vs trained analysis
- **FailureMode** — classified failure with base/trained/expected behavior
- **RepairPairBlock** — repair corpus spec with target count and pair template
- **CuratorAudit** — curator model accuracy analysis
- **TribunalVerdict** — sealed verdict with decision, rationale, deploy path
- **DashboardStats** — aggregate metrics for overview

---

## Classification system

| Class | Threshold | Meaning |
|-------|-----------|---------|
| **Honey** | ≥ 0.85 weight | IC-grade, load-bearing, dense. You earn Honey. |
| **Jelly** | 0.70–0.84 | Value-add, solid, research quality |
| **Propolis** | < 0.70 or critical failure | Compost. Feeds the genome. Nothing wasted. |

---

## Production readiness tiers

| Tier | Description |
|------|-------------|
| Client-Facing Ready | Cleared all rubrics. Safe for external use. |
| IC Draft Ready | Cleared institutional math and verdict discipline. |
| Internal Analyst Assist Ready | Useful with mandatory senior review. |
| Research Only | Findings only, not for production. |
| Do Not Deploy | Active regressions or critical failures. |

---

## Current limitations (v0)

- **Single-run seed** — only Atlas 27B Qwen 3.6 eval is pre-loaded
- **In-memory import** — imported artifacts live in React state only (no persistence)
- **No backend** — all storage is local JSON / in-memory
- **No auth** — designed for local single-user use
- **No live inference** — does not call models directly

---

## Roadmap

- [ ] SQLite backend via better-sqlite3 (v1)
- [ ] Multi-run comparison view
- [ ] Prompt pack manager
- [ ] Live pair generation queue status
- [ ] Export to R2 / NFS
- [ ] Hedera anchor for sealed verdicts
- [ ] Rubric builder / calibration tool
- [ ] Curator audit live mode

---

## The Atlas 27B Verdict (May 2026)

The cook did not fail. The Tribunal found the failure before the market did.

See `docs/atlas27b-qwen36-cook-v1-verdict.md` for the full sealed verdict.
