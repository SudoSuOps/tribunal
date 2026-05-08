# Tribunal Verdict — Granite 4.1 30B Q8_0 / CRE Institutional Underwriting / cre_granite41-30b-base_20260508_001
Date: 2026-05-08 | Prompt Pack: CRE Institutional Underwriting Bracket | Prompts: 8

---

## Executive Summary

Granite 4.1 30B Q8_0 demonstrates meaningful CRE domain awareness — correct identification of distress signals, sound qualitative risk framing, precise recall of 1031 rules, and accurate cap rate spread analysis. However, the model carries two critical arithmetic failures on multi-variable buildup problems and a pattern of over-firing Kill verdicts on repriceable situations. Critical failures block Honey. This model is **Research Ready** at best and requires repair pairs in three distinct domains before it can be trusted for any output that enters a ledger or reaches an analyst desk without full math review.

---

## Failure Summary

| ID | Severity | Layer A | Layer B | Prompt | Quote |
|----|----------|---------|---------|--------|-------|
| fail_001 | **critical** | `fabricated_result` | `renovation_budget_error` | P1 Memphis | 180 × $9,750 = "$17,775,000" (correct: $1,755,000 — 10x decimal error) |
| fail_002 | **critical** | `skipped_verification` | `interest_coverage_error` | P1 Memphis | Applied LTC% to purchase price not total project cost; ICR never stated as 0.85x |
| fail_003 | **high** | `fabricated_result` | `hallucinated_market_fact` | P4 Dallas | Cited "5.6–6.0% Dallas industrial cap rates from recent broker surveys" — no market data in prompt |
| fail_004 | **high** | `fabricated_result` | `pro_forma_math_error` | P4 Dallas | Gross return stated as 38.5% (correct: 48.2%); annualized 7.7% (correct: 9.6%) |
| fail_005 | **medium** | `incomplete_task` | `verdict_misalignment` | P3 Nashville | Cap rate differential between NNN and gross lease not identified — the anchor institutional insight the prompt was testing |
| fail_006 | **medium** | `unsafe_claim` | `verdict_misalignment` | P6 Miami | Kill verdict on a DSCR-failing deal that is resizable; standard lender response is Reprice/restructure |

---

## Math Validation

| Prompt | Metric | Expected | Model | Pass |
|--------|--------|----------|-------|------|
| P1 | Cap rate | 6.00% | 6.00% | ✓ |
| P1 | Price per unit | $100,000 | $100,000 | ✓ |
| P1 | Renovation budget | $1,755,000 | **$17,775,000** | ✗ |
| P1 | Contingency | $175,500 | **$1,777,500** | ✗ |
| P1 | Total project cost | $35,526,500 | **$53,148,500** | ✗ |
| P1 | 70% LTC loan | $24,868,550 | **$21,840,000** (LTV not LTC) | ✗ |
| P1 | Annual interest | $2,200,867 | **$1,932,240** | ✗ |
| P1 | T12 ICR explicit | **0.85x** | Not stated (implied ~0.97x) | ✗ |
| P2 | DSCR | 1.07x | 1.07x | ✓ |
| P2 | Threshold flag | <1.20x | Named 1.20–1.25x | ✓ |
| P4 | Year 5 exit value | $11,531,345 | $11,531,345 | ✓ |
| P4 | Gross return | 48.2% / 5yr | **38.5%** / 5yr | ✗ |
| P5 | Gross profit | $28,430,400 | $28,430,400 | ✓ |
| P5 | Equity multiple | 2.31x | 2.31x | ✓ |
| P6 | LTV | 75.3% | 75.3% | ✓ |
| P6 | Debt yield | 8.875% | 8.88% | ✓ |
| P7 | ID deadline | April 29, 2026 | April 29, 2026 | ✓ |
| P7 | Close deadline | September 11, 2026 | September 11, 2026 | ✓ |
| P8 | Spread (midpoint) | 65bps | 40–90bps range | ✓ |
| P8 | Historical context | 150–250bps | 170–250bps (pre/post COVID) | ✓ |

---

## Dimension Scores (Base Only — No Trained Delta)

| Dimension | Base Score | Notes |
|-----------|-----------|-------|
| accuracy | 0.58 | Critical arithmetic failures on P1 (5/9 math wrong), P4 (gross return, fabricated market data) |
| completeness | 0.72 | P3 missing cap rate differential; P6 missing restructure path; P7/P8 complete |
| specificity | 0.74 | P2, P7, P8 highly specific; P1 verdict correct but math wrong |
| structure | 0.82 | Consistent IC memo format across all 8 prompts |
| domain_expertise | 0.76 | Strong qualitative instincts; unreliable on complex arithmetic; 1031 rules perfect |
| **final_weight** | **0.72** | Below Honey threshold (0.85). Research Ready only. |

---

## Output Distribution

| Class | Count | Prompts |
|-------|-------|---------|
| Honey | 2 | P7 (1031), P8 (cap rate spread) |
| Jelly | 5 | P2 (Denver DSCR), P3 (NNN/Gross), P4 (Dallas pro forma), P5 (Chicago office), P6 (Miami debt) |
| Propolis | 1 | P1 (Memphis 312 — critical math) |

---

## Readiness Assessment

**Label: Research Ready**

Rationale: Domain awareness is evident across all 8 prompts. The model correctly identifies deal-structure distress (P1 Kill verdict is correct even with wrong math), applies lender coverage benchmarks (P2 1.20x threshold), demonstrates strong 1031 recall (P7), and produces market-aware cap rate commentary (P8). However, two critical arithmetic failures — a 10x renovation decimal error and LTC/LTV confusion on P1 — make any numerical output unreliable without independent verification. A human analyst using this model's output must verify every line of math before relying on it. No output from this model should enter a ledger, IC memo, or client-facing artifact without full review.

---

## Verdict

**Needs More Data**

Evidence: Critical failures on P1 (renovation arithmetic, ICR not computed) and P4 (gross return error, fabricated broker survey data) block any higher rating. The model cannot be trusted to build a multi-variable cost stack or compute holding-period returns accurately. These are load-bearing skills for institutional CRE underwriting. The 2 Honey-quality outputs (P7, P8) confirm the model has real domain knowledge but the failure pattern is concentrated exactly where institutional risk is highest — complex arithmetic and capital structure math.

---

## Next Actions

- [ ] Run independent arithmetic verification for all P1 and P4 math line items (already done — confirms failures above).
- [ ] Design repair pairs for P1 failure cluster: multi-variable project cost buildup, LTC vs LTV distinction, ICR computation. Target: 5–8 pairs.
- [ ] Design repair pairs for P4 failure cluster: holding-period return computation, no-fabrication discipline for market data not in prompt. Target: 3–5 pairs.
- [ ] Design repair pairs for P3/P6 reasoning depth: cap rate differential (NNN vs gross), DSCR hierarchy (why DSCR outranks debt yield), verdict calibration (Kill vs Reprice). Target: 5–8 pairs.
- [ ] File `_repair_pair_plan.json` with all three blocks at `planned` status before any cook begins.
- [ ] Re-run the full 8-prompt bracket against fine-tuned checkpoint to measure delta before any promotion consideration.
- [ ] Use P7 (1031) and P8 (cap rate spread) outputs as positive exemplar anchors in repair pair system prompts.

---

## Confidence Level

**Medium** — 8/8 prompts completed, raw outputs filed, math independently validated. Confidence is bounded by: (a) no trained-model delta exists yet (base-only eval), (b) verdict scores on P5/P6 are judgment calls on a conservative IC rubric, (c) P4 fabrication was a single instance — more bracket runs needed to confirm frequency.

---

*cre_granite41-30b-base_20260508_001 | Tribunal Eval v1 | 2026-05-08*
