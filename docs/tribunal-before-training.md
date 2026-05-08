# Tribunal Before Training

## The Doctrine

Tribunal begins before training.

Without a base eval, there is no delta.
Without delta, there is no honey.

No model enters training without a base-model baseline eval.
No synthetic pair is created without a failure it repairs.
No trained model is accepted without a base-vs-trained delta report.
No output becomes honey without Curator audit and Tribunal seal.

Claude can propose.
The terminal must prove.
Curator must audit.
Tribunal must seal.

No proof, no honey.

The base eval finds the wound.
The pair repairs the wound.
The fine-tune teaches the scar.
The Tribunal proves it healed.

---

## Why This Exists

The Atlas 27B Cook v1 was 73.57 hours on two RTX PRO 6000 Blackwell GPUs, 125,651 CRE training pairs, and a final train loss of 0.6931.

The Stage 5 lenient rubric gave it 7-of-7 PROMOTE.

The Phase 2 v3 strict rubric gave it 0-of-9 clean Accept.

Same model. Same outputs. Different rubrics. Opposite verdicts.

And the Memphis 312-unit anchor test — the one prompt that asks: can the model calculate Day-1 interest coverage and flag an insolvent property — the cooked model missed it on the easier variant. The base model caught it on both.

The Tribunal doctrine exists because soft rubrics promote broken models. And broken models reach IC analysts and clients before anyone notices.

The Tribunal is the last honest check before deployment.

---

## The Five Rules

1. **Base eval before training** — measure the base model on the target domain before a single training step
2. **Failures drive pairs** — every training pair must repair a documented base-model failure
3. **Delta proves improvement** — the fine-tuned model must score higher than base on the same prompts that failed
4. **Curator audits, not seals** — Curator-9B catches format and pre-check errors; it does not determine IC fitness
5. **Tribunal seals** — the verdict belongs to the human Tribunal or the base model acting as senior judge

---

## The Classification System

| Class | Weight | Meaning |
|-------|--------|---------|
| Honey | ≥ 0.85 | Dense, load-bearing, IC-grade. You earn this. |
| Jelly | 0.70–0.84 | Value-add, solid, research quality. |
| Propolis | < 0.70 | Compost. Feeds the genome. Nothing wasted. |

Weight is not assigned. Weight is measured by the Tribunal scales.

---

## The Repair Cycle

```
Base Eval
  ↓
Failure Documentation
  ↓
Repair Pair Generation (SwarmCurator)
  ↓
Fine-Tune Training
  ↓
Post-Cook Eval (same prompts as base eval)
  ↓
Delta Report
  ↓
Tribunal Verdict (PROMOTE / REPRICE / KILL)
```

No step may be skipped. No verdict may be issued without a delta report.

---

*Sealed in hack-wiki: tribunals/2026-05-08-atlas-qwen-27b-cook-v1.md*
*Doctrine adopted: May 8, 2026*
