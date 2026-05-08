# Output Schemas

Full JSON schemas for all Tribunal eval artifacts.

## `_tribunal_verdict.json`

```json
{
  "run_id": "string — {domain}_{model_slug}_{YYYYMMDD}_{seq}",
  "timestamp": "ISO 8601",
  "eval_type": "base_only | base_vs_trained | curator_qc",
  "model_a": {
    "id": "string",
    "label": "string",
    "endpoint": "http://...",
    "api_type": "ollama | openai",
    "model_name": "string"
  },
  "model_b": null,
  "prompt_pack": {
    "name": "string",
    "domain": "CRE | legal | medical | grants | clawhash | agenthash",
    "n_prompts": "integer",
    "pack_file": "path/to/pack.json"
  },
  "rubric": {
    "dimensions": ["accuracy", "completeness", "specificity", "structure", "domain_expertise"],
    "score_range": [0.0, 1.0],
    "critical_failures_block_honey": true
  },
  "scores": {
    "per_prompt": [
      {
        "prompt_id": "string",
        "prompt_label": "string",
        "scores": {
          "accuracy": 0.0,
          "completeness": 0.0,
          "specificity": 0.0,
          "structure": 0.0,
          "domain_expertise": 0.0
        },
        "weight": 0.0,
        "notes": "string"
      }
    ],
    "aggregate": {
      "accuracy": 0.0,
      "completeness": 0.0,
      "specificity": 0.0,
      "structure": 0.0,
      "domain_expertise": 0.0,
      "final_weight": 0.0
    },
    "delta": null
  },
  "failures": [
    {
      "failure_id": "string",
      "prompt_id": "string",
      "layer_a": "fabricated_result | unsafe_claim | ...",
      "layer_b": "dscr_error | hallucinated_comp | ...",
      "severity": "critical | high | medium | low",
      "quote": "verbatim from model output",
      "correct_behavior": "what the model should have done",
      "blocks_honey": true
    }
  ],
  "math_validation": [
    {
      "metric": "DSCR | NOI | cap_rate | ICR | LTV | ...",
      "expected": "number or formula",
      "model_output": "what model stated",
      "delta": "number",
      "pass": false
    }
  ],
  "verdict": "Kill | Reprice | Needs More Data | Approve with Conditions | Approve",
  "verdict_evidence": "string — key facts that drove the verdict",
  "classification": "propolis | jelly | honey",
  "readiness": "Not Ready | Research Ready | Internal Analyst Assist Ready | IC Draft Assist Ready | Client-Facing Ready",
  "next_actions": ["string"],
  "artifacts": {
    "dev_eval_report_md": "reports/{run_id}_dev_eval_report.md",
    "eval_summary_md": "reports/{run_id}_eval_summary.md",
    "metrics_json": "reports/{run_id}_metrics.json",
    "metrics_csv": "reports/{run_id}_metrics.csv",
    "failure_taxonomy_json": "reports/{run_id}_failure_taxonomy.json",
    "verdict_md": "reports/{run_id}_tribunal_verdict.md",
    "verdict_json": "reports/{run_id}_tribunal_verdict.json",
    "repair_plan_json": "reports/{run_id}_repair_pair_plan.json",
    "candidate_pairs_jsonl": null,
    "candidate_pairs_meta_json": null,
    "raw_outputs_dir": "runs/{run_id}/raw_outputs/"
  }
}
```

---

## `_failure_taxonomy.json`

```json
{
  "run_id": "string",
  "timestamp": "ISO 8601",
  "domain": "CRE",
  "total_failures": 0,
  "critical_count": 0,
  "high_count": 0,
  "medium_count": 0,
  "low_count": 0,
  "honey_blocked": true,
  "failures": [
    {
      "failure_id": "f001",
      "prompt_id": "string",
      "layer_a": "unsafe_claim",
      "layer_b": "dscr_error",
      "severity": "critical",
      "quote": "verbatim from model output",
      "correct_behavior": "string",
      "blocks_honey": true,
      "repair_block_ref": "block_001"
    }
  ]
}
```

---

## `_repair_pair_plan.json`

```json
{
  "run_id": "string",
  "generated_at": "ISO 8601",
  "domain": "CRE",
  "total_blocks": 0,
  "total_pairs_planned": 0,
  "repair_blocks": [
    {
      "block_id": "block_001",
      "failure_id": "f001",
      "failure_label": "dscr_error",
      "layer_a_label": "math_error",
      "severity": "critical",
      "prompt_id": "string",
      "observed_error": "verbatim from model output",
      "correct_behavior": "The model should have calculated DSCR as NOI / ADS = ...",
      "pair_spec": {
        "system_prompt": "Full system prompt for this repair pair",
        "user_prompt_template": "Template with {placeholders} for data injection",
        "expected_output_guidance": "What a correct response must include"
      },
      "pair_count_target": 5,
      "status": "planned",
      "notes": "string"
    }
  ]
}
```

Status lifecycle: `planned` → `candidate` → `reviewed` → `sealed`

No pair advances to `sealed` without: (1) human review, (2) Curator audit, (3) Tribunal sign-off.

---

## `_candidate_pairs_meta.json`

```json
{
  "run_id": "string",
  "generated_at": "ISO 8601",
  "source": "tribunal-eval-skill | gpt4o-forge | manual",
  "domain": "CRE",
  "total_candidates": 0,
  "all_status": "candidate",
  "note": "All pairs in candidate_pairs.jsonl are Propolis-derived candidates. None are Honey. Review, audit, and Tribunal seal required before training use.",
  "pairs": [
    {
      "pair_id": "string",
      "block_id": "block_001",
      "failure_label": "dscr_error",
      "status": "candidate",
      "system_prompt": "string",
      "user_prompt": "string",
      "expected_output": "string",
      "generated_by": "string",
      "review_notes": null
    }
  ]
}
```

---

## `_metrics.json`

```json
{
  "run_id": "string",
  "timestamp": "ISO 8601",
  "model": "string",
  "domain": "CRE",
  "prompt_pack": "string",
  "n_prompts": 0,
  "scores": {
    "accuracy": 0.0,
    "completeness": 0.0,
    "specificity": 0.0,
    "structure": 0.0,
    "domain_expertise": 0.0,
    "final_weight": 0.0
  },
  "critical_failure_count": 0,
  "high_failure_count": 0,
  "classification": "propolis | jelly | honey",
  "readiness": "string"
}
```

---

## `candidate_pairs.jsonl`

One JSON object per line. Each line is a single training pair:

```json
{"pair_id": "string", "block_id": "block_001", "status": "candidate", "system": "string", "user": "string", "assistant": "string", "domain": "CRE", "failure_label": "dscr_error", "run_id": "string"}
```

Import into training pipeline only after status is `sealed`.
