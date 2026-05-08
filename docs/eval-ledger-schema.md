# Eval Ledger Schema

Data types for the Granio Tribunal eval ledger. All types are defined in `src/types/index.ts`.

---

## EvalRun

The primary record for a complete eval session.

```typescript
interface EvalRun {
  run_id: string               // Unique identifier, e.g. "atlas27b-qwen36-dev-eval-2026-05-08"
  date: string                 // ISO date string
  domain: Domain               // CRE | Medical | Legal | Credit | ...
  subdomain: string            // e.g. "Multifamily Institutional Underwriting"
  base_model: string           // e.g. "Qwen 3.6 27B Base"
  trained_model: string | null // e.g. "Atlas 27B Qwen 3.6 Cook v1"
  prompt_pack: string          // e.g. "MF-IC-Pack-v3"
  prompt_count: number
  rubric: string               // e.g. "Phase 2 v3 Strict"
  result_summary: string       // One-paragraph executive summary
  readiness: ProductionReadiness
  verdict: string
  base_wins: number
  cooked_wins: number
  ties: number
  critical_failures: number
  honey_count: number
  jelly_count: number
  propolis_count: number
  artifacts: ArtifactFile[]
  prompt_results: PromptResult[]
  key_findings: string[]
  deploy_path: string
  next_corpus: string[]
  status: 'active' | 'sealed' | 'archived'
}
```

---

## PromptResult

Result for a single prompt within an eval run.

```typescript
interface PromptResult {
  prompt_id: string
  prompt_label: string
  base_score?: number          // 0.0–1.0
  cooked_score?: number        // 0.0–1.0
  winner: 'base' | 'cooked' | 'tie'
  base_summary: string
  cooked_summary: string
  classification: Classification  // honey | jelly | propolis
  notes: string
}
```

---

## FailureMode

A documented failure observed during eval.

```typescript
interface FailureMode {
  failure_id: string           // Snake case, e.g. "mf_memphis_312_interest_coverage_miss"
  label: string                // Human-readable label
  severity: 'critical' | 'high' | 'medium' | 'low'
  source_run: string
  source_prompt: string
  base_behavior: string        // What the base model did
  trained_behavior: string     // What the trained model did (the failure)
  expected_behavior: string    // What correct behavior looks like
  classification: Classification
  repair_needed: boolean
  target_pair_block: string    // ID of the RepairPairBlock that should fix this
  example_input?: string
  example_base_output?: string
  example_trained_output?: string
}
```

---

## RepairPairBlock

A block of synthetic pairs designed to repair a set of failures.

```typescript
interface RepairPairBlock {
  block_id: string             // Snake case, matches target_pair_block in failures
  label: string
  target_count: number         // How many pairs to generate
  current_count: number        // How many exist so far
  source_failures: string[]    // failure_ids this block repairs
  repair_goal: string
  expected_behavior: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  pair_template: PairTemplate
}

interface PairTemplate {
  pair_id_prefix: string
  source_eval: string
  base_failure_type: string
  repair_goal: string
  domain: string
  expected_behavior: string
  classification_target: Classification
}
```

---

## TribunalVerdict

A sealed verdict from the Tribunal.

```typescript
interface TribunalVerdict {
  verdict_id: string
  run_id: string
  date: string
  model: string
  decision: VerdictDecision    // promote | promote_with_conditions | jelly_research_artifact | regressed_do_not_promote | kill_archive
  classification: Classification
  readiness: ProductionReadiness
  deploy_path: string
  blocked_from: string[]
  rationale: string
  conditions?: string[]
  doctrine_note: string
  sealed_by: string
  seal_timestamp: string       // ISO datetime
}
```

---

## Domain enum

```typescript
type Domain =
  | 'CRE'
  | 'Medical'
  | 'Legal'
  | 'Credit'
  | 'Coding'
  | 'Energy'
  | 'Mining'
  | 'Robotics'
  | 'Custom'
```

---

## ProductionReadiness enum

```typescript
type ProductionReadiness =
  | 'Client-Facing Ready'
  | 'IC Draft Ready'
  | 'Internal Analyst Assist Ready'
  | 'Research Only'
  | 'Do Not Deploy'
```

---

## JSON storage convention (v0)

All data lives in `src/data/seed.ts` as typed TypeScript constants. In v1, this will be backed by a SQLite database via `better-sqlite3` with the same schema.

File naming for report artifacts:

```
reports/<run_id>_eval_report.md
reports/<run_id>_eval_summary.md
reports/<run_id>_eval_metrics.json
reports/<run_id>_eval_metrics.csv
```
