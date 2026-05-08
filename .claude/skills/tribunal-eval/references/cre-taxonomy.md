# CRE Failure Taxonomy

Full reference for Layer A and Layer B failure labels used in `_failure_taxonomy.json`.

## Layer A — General Agent/Tool Failures

| Label | Description |
|-------|-------------|
| `wrong_tool` | Used wrong method/approach for the task |
| `fake_tool_call` | Simulated a tool call without executing it |
| `fabricated_result` | Invented output data, scores, or artifacts |
| `skipped_verification` | Failed to check a result that needed checking |
| `incomplete_task` | Stopped before the task was finished |
| `hidden_failure` | Hid an error or failure behind confident language |
| `format_violation` | Output did not match the required format |
| `unsafe_claim` | Made a claim that could cause financial/legal harm |
| `missing_artifact` | Required output file or field was not produced |
| `ungrounded_completion` | Concluded without supporting evidence |

## Layer B — CRE / Domain-Specific Failures

### Math Errors

| Label | Description | Severity |
|-------|-------------|----------|
| `math_error` | Generic arithmetic error | high |
| `cap_rate_error` | Incorrect cap rate calculation (NOI ÷ Price) | critical |
| `price_per_unit_error` | Incorrect price per unit calculation | high |
| `debt_service_error` | Incorrect annual or monthly debt service amount | critical |
| `dscr_error` | Incorrect DSCR (NOI ÷ ADS) | critical |
| `interest_coverage_error` | Incorrect interest coverage ratio (T12 NOI ÷ interest expense) | critical |
| `mortgage_constant_error` | Incorrect mortgage constant (ADS ÷ loan amount) | high |
| `project_cost_error` | Incorrect total project cost or cost basis | high |
| `yield_on_cost_error` | Incorrect yield-on-cost (stabilized NOI ÷ total cost) | high |
| `recovery_shortfall_error` | Incorrect recovery at exit / residual calculation | high |

### Underwriting Logic Failures

| Label | Description | Severity |
|-------|-------------|----------|
| `seller_pro_forma_overreliance` | Treated seller pro forma as fact without flagging | critical |
| `broker_claim_overreliance` | Accepted broker/OM claims without skepticism | critical |
| `physical_vs_economic_occupancy_confusion` | Used physical occupancy instead of economic occupancy | high |
| `bad_debt_ignored` | Failed to apply bad debt reserve to income | high |
| `delinquency_ignored` | Ignored delinquency or collection losses | high |
| `capex_basis_ignored` | Ignored capex requirement in basis/returns calculation | high |
| `tax_reassessment_ignored` | Failed to model post-sale property tax reassessment | high |
| `insurance_shock_ignored` | Ignored insurance premium increases in underwriting | medium |
| `bridge_refi_risk_missed` | Failed to flag refi risk on bridge loan at maturity | critical |

### Risk / Judgment Failures

| Label | Description | Severity |
|-------|-------------|----------|
| `unsafe_approval` | Approved a deal that fails debt service coverage | critical |
| `verdict_misalignment` | Verdict inconsistent with stated evidence | critical |
| `sponsor_execution_risk_missed` | Failed to flag untested sponsor or execution gap | high |
| `lease_risk_missed` | Failed to flag upcoming rollover or lease expiry risk | high |
| `co_tenancy_missed` | Ignored co-tenancy clause risk (retail/anchored deals) | high |
| `go_dark_risk_missed` | Ignored anchor go-dark risk in anchored retail | high |
| `bridge_refi_risk_missed` | (also listed above — applies to judgment layer too) | critical |
| `residual_real_estate_risk_missed` | Failed to address long-term property/market risk | medium |

### Market / Fact Failures

| Label | Description | Severity |
|-------|-------------|----------|
| `tenant_credit_hallucination` | Invented or misrepresented tenant credit quality | critical |
| `guaranty_assumption_error` | Incorrectly assumed or dismissed personal/corporate guaranty | high |
| `unsupported_market_fact` | Stated a market fact without data source | high |
| `hallucinated_comp` | Invented a comparable sale, lease comp, or rent comp | critical |
| `missing_diligence` | Failed to identify what diligence is missing | medium |

### Deal Structure / Documentation Failures

| Label | Description | Severity |
|-------|-------------|----------|
| `cam_leakage_missed` | Failed to flag CAM reconciliation or leakage risk | medium |
| `loi_buyer_protection_gap` | LOI lacks key buyer protections (inspection, title, financing) | high |
| `loi_binding_language_error` | LOI binding/non-binding language is incorrect or absent | high |
| `waterfall_logic_error` | Incorrect equity waterfall structure or promote calculation | high |
| `promote_fee_alignment_missed` | Failed to assess sponsor/GP promote alignment with LP interest | medium |

### Output Quality Failures

| Label | Description | Severity |
|-------|-------------|----------|
| `weak_recommendation` | Recommendation is hedged to the point of being non-actionable | medium |
| `token_truncation` | Output was cut off due to context/token limits | medium |

---

## Severity Decision Guide

When in doubt, escalate rather than downgrade severity.

**Critical** — always blocks Honey:
- Any error that could cause a bad investment decision
- Any hallucinated or invented factual claim
- Any math failure in a load-bearing underwriting metric (DSCR, ICR, cap rate)
- Any approval of a deal that mathematically fails coverage

**High** — blocks Honey unless explicitly noted in verdict:
- Math errors in secondary metrics
- Significant risk factors not flagged
- Overreliance on unverified seller/broker data

**Medium** — noted in verdict, does not block Honey by itself:
- Output quality issues
- Missing secondary diligence items
- Formatting issues that don't affect substance

**Low** — logged but does not affect classification:
- Minor tone/style issues
- Non-material formatting choices
