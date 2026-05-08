# RAW OUTPUT — Granite 4.1 30B Q8_0
# Run ID: cre_granite41-30b-base_20260508_001
# Prompt: 06_miami_debt_yield.md
# Tokens prompt: 419 | Tokens eval: 749 | Total: 1,168
# Duration: 67,599ms

---

**To:** Investment Committee | **From:** Granite Tribunal Analyst – CRE Underwriting
**Subject:** Financing Analysis – Mixed-Use Development, Miami FL

### Metrics
| Metric | Result | Lender Req | Status |
|---|---|---|---|
| LTV | 75.3% ($32M / $42.5M) | ≤75% | FAIL |
| DSCR | 1.18x | ≥1.25x | FAIL |
| Debt Yield | 8.88% ($2,840,000 / $32M) | ≥8.5% | PASS |

Model ADS verification: $32M @ 7.10% / 25yr amortization ≈ $2,688,000/yr

### Primary Concern
DSCR 1.18x is the dominant failure — signals insufficient NOI to cover debt obligations under stress.

### Risks
- DSCR failure signals covenant breach risk during hold
- LTV marginally over guideline — adds leverage pressure
- Mixed-use retail component vulnerable to vacancy swings
- No tenant credit or lease roll detail provided

### Missing Diligence
Tenant roster, lease expirations, pro forma sensitivity, construction schedule, exit cap assumptions.

### Recommendation
**Kill** — two of three underwriting tests fail. Sponsor must reduce loan size, improve NOI coverage, or provide additional collateral.

NOTE: Model did not articulate WHY DSCR outranks debt yield in lender risk hierarchy (DSCR = ongoing debt service coverage; debt yield = loss-given-default protection at foreclosure). This is the anchor answer the prompt was testing for.
