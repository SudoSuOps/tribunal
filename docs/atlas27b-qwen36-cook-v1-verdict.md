# Tribunal Verdict — Atlas 27B Qwen 3.6 Cook v1

**Verdict ID**: verdict-atlas27b-qwen36-cook-v1-2026-05-08
**Run**: atlas27b-qwen36-dev-eval-2026-05-08
**Date**: 2026-05-08
**Model**: Atlas 27B Qwen 3.6 Cook v1
**Base**: Qwen 3.6 27B Base

---

## Decision: DO NOT PROMOTE

**Classification**: Jelly with Propolis Flags
**Readiness**: Internal Analyst Assist Ready (with mandatory senior review)

---

## Rationale

Cook v1 regressed on 6 of 10 load-bearing institutional skills.

The Memphis 312-unit anchor test exposed the single biggest failure: going-in interest coverage was approximately 0.85x. The property is structurally insolvent on debt service from Day 1. The cooked model missed this on the easier prompt variant. The base model caught it on both variants.

Additional critical failures:
1. **Broker pro-forma acceptance** — cooked accepted broker pro-forma without T12 reconciliation in 2 of 4 tests
2. **LOI invented terms** — cooked added substantive claims to LOI redline that conflicted with explicit prompt specifications
3. **Mortgage constant precision** — 5.6bps error that propagated into DSCR and softened a REPRICE verdict to PROMOTE with conditions

Cook wins on synthesis richness and narrative quality — but richness without precision is a liability in institutional underwriting.

---

## Key Findings

1. Base meets or exceeds cooked on 6-of-10 directly comparable institutional prompts.
2. Cooked wins on synthesis-richness; base wins on math depth, reconciliation reflex, exit math precision, Day-1 trap detection, and LOI substantive correctness.
3. Stage 5 lenient rubric gave cooked Atlas 7-of-7 PROMOTE. Phase 2 v3 strict rubric gave the same model 0-of-9 clean Accept. Rubric calibration matters.
4. Curator-9B correct on ~1-of-7 institutional audits. Must not be used as final auditor for 27B output.

---

## Deploy Path

**Approved**: Base Qwen 3.6 27B + v4 prompt engineering + deterministic Python math validator + post-hoc output checker

**Blocked**:
- ~~IC Draft Ready~~
- ~~Client-Facing Deployment~~
- ~~Standalone Analyst Deployment~~
- ~~LOI Review Authority~~
- ~~Capital Markets Final Verdict~~

---

## Block-2 Corpus Plan

Defer v2 cook until Block-2 corpus is designed with:

1. **Reconciliation pairs** (15K target) — explicit T12/forward bridge modeling
2. **STNL anti-hallucination pairs** (5K target) — tenant credit verification requirement
3. **Verdict-trigger discipline pairs** (3K target) — binary/ternary verdict with explicit trigger
4. **Mortgage-constant precision pairs** (3K target) — exact MC formula application
5. **LOI binding-section discipline pairs** (5K target) — no invented terms, binding section flagging
6. **Bridge/refi failure pairs** (5K target) — Day-1 coverage calculation mandatory

**Total Block-2 target**: 36,000 pairs

---

## Conditions for Interim Deployment

1. May be used for internal analyst assist with mandatory senior review on every output.
2. Must not be deployed without a deterministic math post-processor.
3. All IC verdicts from Cook v1 require human sign-off before delivery.

---

## Doctrine Note

*The cook did not fail. The Tribunal found the failure before the market did.*

---

**Sealed by**: Tribunal v0 · Phase 2 v3 Strict Rubric · Granio Eval Ledger
**Sealed**: 2026-05-08T14:00:00Z
**Source**: hack-wiki/tribunals/2026-05-08-atlas-qwen-27b-cook-v1.md
