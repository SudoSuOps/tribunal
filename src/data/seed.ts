import type {
  EvalRun,
  ModelComparison,
  FailureMode,
  RepairPairBlock,
  CuratorAudit,
  TribunalVerdict,
  DashboardStats,
} from '../types'

export const SEED_EVAL_RUN: EvalRun = {
  run_id: 'atlas27b-qwen36-dev-eval-2026-05-08',
  date: '2026-05-08',
  domain: 'CRE',
  subdomain: 'Multifamily Institutional Underwriting',
  base_model: 'Qwen 3.6 27B Base',
  trained_model: 'Atlas 27B Qwen 3.6 Cook v1',
  prompt_pack: 'MF-IC-Pack-v3 (Institutional CRE)',
  prompt_count: 32,
  rubric: 'Phase 2 v3 Strict',
  result_summary:
    'Base outperformed cooked on load-bearing institutional skills. Cook v1 is a regression on math depth, reconciliation reflex, exit math precision, Day-1 trap detection, and LOI substantive correctness.',
  readiness: 'Internal Analyst Assist Ready',
  verdict: 'Do Not Promote Cook v1 to IC Draft Ready',
  base_wins: 6,
  cooked_wins: 4,
  ties: 0,
  critical_failures: 4,
  honey_count: 0,
  jelly_count: 1,
  propolis_count: 4,
  status: 'sealed',
  key_findings: [
    'Base meets or exceeds cooked on 6-of-10 directly comparable institutional prompts.',
    'Cooked wins on synthesis-richness but base wins on math depth, reconciliation reflex, exit math precision, Day-1 trap detection, and LOI substantive correctness.',
    'Net: Cook v1 was a regression on load-bearing institutional skills.',
    'Memphis 312-unit anchor test: going-in interest coverage ~0.85x. Property is structurally insolvent on debt service from Day 1. Cooked Atlas missed this on the easier prompt variant; base caught it on both.',
    'Stage 5 lenient rubric gave cooked Atlas 7-of-7 PROMOTE. Phase 2 strict rubric gave the same model 0-of-9 clean Accept. Same model, different rubrics, opposite reads — Stage 5 calibration was too lenient.',
    'Curator-9B is structurally undersized to audit 27B output. ~1-of-7 audits cleanly correct. Failure modes include fabricating math errors, misclassifying prompt-provided facts as unsupported, and recommending changes that contradict explicit prompt specs.',
  ],
  deploy_path:
    'Base + v4 prompt engineering + deterministic Python math + post-hoc validator. Defer v2 cook until Block-2 corpus is designed.',
  next_corpus: [
    'Reconciliation pairs (explicit T12/forward bridge modeling)',
    'STNL anti-hallucination pairs',
    'Verdict-trigger discipline pairs',
    'Mortgage-constant precision pairs',
    'LOI binding-section discipline pairs',
    'Bridge/refi failure pairs',
  ],
  artifacts: [
    {
      filename: 'atlas27b_qwen36_dev_eval_report.md',
      type: 'md',
      description: 'Full dev eval report with prompt-by-prompt breakdown',
      path: 'reports/atlas27b_qwen36_dev_eval_report.md',
      size_kb: 48,
    },
    {
      filename: 'atlas27b_qwen36_eval_summary.md',
      type: 'md',
      description: 'Executive summary of eval findings',
      path: 'reports/atlas27b_qwen36_eval_summary.md',
      size_kb: 12,
    },
    {
      filename: 'atlas27b_eval_metrics.json',
      type: 'json',
      description: 'Structured metrics: scores, wins, failures, classifications',
      path: 'reports/atlas27b_eval_metrics.json',
      size_kb: 8,
    },
    {
      filename: 'atlas27b_eval_metrics.csv',
      type: 'csv',
      description: 'Tabular metrics for spreadsheet analysis',
      path: 'reports/atlas27b_eval_metrics.csv',
      size_kb: 4,
    },
  ],
  prompt_results: [
    {
      prompt_id: 'mf-001',
      prompt_label: 'Memphis 312-unit interest coverage (easy)',
      base_score: 0.92,
      cooked_score: 0.38,
      winner: 'base',
      base_summary: 'Correctly calculated T12 NOI / annual bridge interest = 0.85x, flagged as structurally insolvent, recommended Kill/Reprice.',
      cooked_summary: 'Missed the 0.85x coverage ratio. Produced optimistic going-in narrative without calculating debt service coverage.',
      classification: 'propolis',
      notes: 'Critical failure — property is insolvent on Day 1. This is the anchor test.',
    },
    {
      prompt_id: 'mf-002',
      prompt_label: 'Memphis 312-unit interest coverage (hard)',
      base_score: 0.88,
      cooked_score: 0.84,
      winner: 'base',
      base_summary: 'Caught the coverage issue on the harder variant with less explicit prompting.',
      cooked_summary: 'Narrowly passed rubric on hard variant, flagged coverage concern but understated severity.',
      classification: 'jelly',
      notes: 'Base more reliable under adversarial prompt conditions.',
    },
    {
      prompt_id: 'mf-003',
      prompt_label: 'Exit cap rate sensitivity',
      base_score: 0.81,
      cooked_score: 0.86,
      winner: 'cooked',
      base_summary: 'Correct exit math, summary adequate but thin on sensitivity range.',
      cooked_summary: 'Better sensitivity table, more narrative around buyer demand assumptions.',
      classification: 'jelly',
      notes: 'Cooked wins on synthesis richness. Not load-bearing.',
    },
    {
      prompt_id: 'mf-004',
      prompt_label: 'T12 reconciliation — broker vs actual',
      base_score: 0.87,
      cooked_score: 0.52,
      winner: 'base',
      base_summary: 'Correctly identified broker pro-forma inflation vs T12 actuals and applied appropriate haircut.',
      cooked_summary: 'Accepted broker pro-forma at face value, did not perform T12 reconciliation.',
      classification: 'propolis',
      notes: 'Reconciliation reflex is load-bearing. Critical regression.',
    },
    {
      prompt_id: 'mf-005',
      prompt_label: 'Mortgage constant precision',
      base_score: 0.84,
      cooked_score: 0.61,
      winner: 'base',
      base_summary: 'Correct mortgage constant, correct DSCR computation, proper verdict trigger.',
      cooked_summary: 'Mortgage constant within 5bps error. DSCR calculation off by 0.04x, softened verdict.',
      classification: 'propolis',
      notes: 'Precision errors in capital markets math are unacceptable at IC level.',
    },
    {
      prompt_id: 'mf-006',
      prompt_label: 'LOI redline — binding sections',
      base_score: 0.79,
      cooked_score: 0.55,
      winner: 'base',
      base_summary: 'Correctly identified binding vs non-binding sections, flagged deposit risk.',
      cooked_summary: 'Added substantive claims to LOI redline that conflicted with explicit prompt specifications.',
      classification: 'propolis',
      notes: 'LOI discipline failure. Model invented terms not in prompt.',
    },
    {
      prompt_id: 'mf-007',
      prompt_label: 'Market rent growth narrative',
      base_score: 0.72,
      cooked_score: 0.83,
      winner: 'cooked',
      base_summary: 'Conservative rent growth cited without supporting market context.',
      cooked_summary: 'Better structured market context, comps cited, more persuasive narrative.',
      classification: 'jelly',
      notes: 'Cooked wins on narrative richness. Not load-bearing math.',
    },
    {
      prompt_id: 'mf-008',
      prompt_label: 'Broker claim skepticism test',
      base_score: 0.85,
      cooked_score: 0.66,
      winner: 'base',
      base_summary: 'Interrogated broker cap rate assumption, applied appropriate risk discount.',
      cooked_summary: 'Partially skeptical but accepted broker occupancy figures without challenge.',
      classification: 'jelly',
      notes: 'Base preserves skepticism reflex better.',
    },
    {
      prompt_id: 'mf-009',
      prompt_label: 'IC recommendation discipline',
      base_score: 0.82,
      cooked_score: 0.68,
      winner: 'base',
      base_summary: 'Produced clean PROMOTE / REPRICE / KILL verdict with one-sentence rationale per trigger.',
      cooked_summary: 'Hedged recommendation with multiple conditional clauses, no clear verdict trigger.',
      classification: 'jelly',
      notes: 'IC discipline is load-bearing. Soft verdicts create liability.',
    },
    {
      prompt_id: 'mf-010',
      prompt_label: 'Synthesis richness — full IC memo',
      base_score: 0.71,
      cooked_score: 0.88,
      winner: 'cooked',
      base_summary: 'Complete but terse. Misses some contextual narrative for IC audience.',
      cooked_summary: 'Richer narrative, better executive summary framing, stronger deal story.',
      classification: 'jelly',
      notes: 'Cooked wins on presentation quality. This is where cook adds value.',
    },
  ],
}

export const SEED_COMPARISON: ModelComparison = {
  run_id: 'atlas27b-qwen36-dev-eval-2026-05-08',
  base_model: 'Qwen 3.6 27B Base',
  cooked_model: 'Atlas 27B Qwen 3.6 Cook v1',
  overall_winner: 'base',
  summary:
    'Base outperforms cooked on load-bearing institutional skills. Cook adds synthesis richness but regresses on math depth and verdict discipline.',
  dimensions: [
    {
      dimension: 'Math Depth',
      base_score: 0.87,
      cooked_score: 0.54,
      winner: 'base',
      base_notes: 'Correct mortgage constants, DSCR, interest coverage calculations.',
      cooked_notes: 'Multiple precision errors on capital markets math.',
      weight: 'load-bearing',
    },
    {
      dimension: 'Reconciliation Reflex',
      base_score: 0.87,
      cooked_score: 0.52,
      winner: 'base',
      base_notes: 'T12 reconciliation vs broker pro-forma applied correctly.',
      cooked_notes: 'Accepted broker figures without reconciliation in 2 of 4 tests.',
      weight: 'load-bearing',
    },
    {
      dimension: 'Exit Math Precision',
      base_score: 0.84,
      cooked_score: 0.61,
      winner: 'base',
      base_notes: 'Exit cap sensitivity and reversion value computed correctly.',
      cooked_notes: 'Computation errors in exit scenario modeling.',
      weight: 'load-bearing',
    },
    {
      dimension: 'Day-1 Debt Trap Detection',
      base_score: 0.92,
      cooked_score: 0.38,
      winner: 'base',
      base_notes: 'Caught 0.85x coverage immediately on both prompt variants.',
      cooked_notes: 'Missed on easier variant. Critical failure.',
      weight: 'load-bearing',
    },
    {
      dimension: 'LOI Substantive Correctness',
      base_score: 0.79,
      cooked_score: 0.55,
      winner: 'base',
      base_notes: 'Correctly identified binding sections, no invented terms.',
      cooked_notes: 'Added terms not in prompt specifications.',
      weight: 'load-bearing',
    },
    {
      dimension: 'Synthesis Richness',
      base_score: 0.71,
      cooked_score: 0.88,
      winner: 'cooked',
      base_notes: 'Complete but terse. Limited narrative depth.',
      cooked_notes: 'Better deal story, richer IC memo narrative.',
      weight: 'value-add',
    },
    {
      dimension: 'Price Analysis Narrative',
      base_score: 0.74,
      cooked_score: 0.84,
      winner: 'cooked',
      base_notes: 'Technically correct but minimal price commentary.',
      cooked_notes: 'Better contextualized pricing with market comps.',
      weight: 'value-add',
    },
    {
      dimension: 'LOI Reprice Embellishments',
      base_score: 0.70,
      cooked_score: 0.79,
      winner: 'cooked',
      base_notes: 'Standard reprice language.',
      cooked_notes: 'More persuasive and structured reprice framing.',
      weight: 'value-add',
    },
    {
      dimension: 'Broker-Claim Skepticism',
      base_score: 0.85,
      cooked_score: 0.66,
      winner: 'base',
      base_notes: 'Consistently interrogated broker assumptions.',
      cooked_notes: 'Partially skeptical — accepted some broker figures without challenge.',
      weight: 'load-bearing',
    },
    {
      dimension: 'IC Recommendation Discipline',
      base_score: 0.82,
      cooked_score: 0.68,
      winner: 'base',
      base_notes: 'Clean verdict triggers: PROMOTE / REPRICE / KILL.',
      cooked_notes: 'Hedged verdicts with conditional clauses, unclear triggers.',
      weight: 'load-bearing',
    },
  ],
}

export const SEED_FAILURES: FailureMode[] = [
  {
    failure_id: 'mf_memphis_312_interest_coverage_miss',
    label: 'Day-1 Interest Coverage Miss — Memphis 312',
    severity: 'critical',
    source_run: 'atlas27b-qwen36-dev-eval-2026-05-08',
    source_prompt: 'Memphis 312-unit workforce housing (easy variant)',
    base_behavior:
      'Calculated T12 NOI / annual bridge interest = 0.85x. Flagged as structurally insolvent. Recommended Reprice or Kill.',
    trained_behavior:
      'Missed the 0.85x coverage ratio on the easier prompt variant. Produced optimistic going-in narrative without computing debt service coverage.',
    expected_behavior:
      'Calculate T12 NOI / annual bridge interest before any recommendation. If coverage < 1.0x, flag as critical failure and recommend Reprice, Needs More Data, or Kill — never Promote.',
    classification: 'propolis',
    repair_needed: true,
    target_pair_block: 'bridge_refi_failure_pairs',
    example_input: 'T12 NOI: $2.1M | Bridge rate: 8.5% | Loan amount: $29M | Recommend?',
    example_base_output: 'Annual interest: $2.465M. Coverage: 0.852x. Property cannot cover bridge debt service from operations. KILL or REPRICE.',
    example_trained_output: 'Strong workforce housing fundamentals. Bridge terms are market-competitive. PROMOTE with monitoring covenants.',
  },
  {
    failure_id: 'mf_broker_proforma_acceptance',
    label: 'Broker Pro-Forma Accepted Without T12 Reconciliation',
    severity: 'critical',
    source_run: 'atlas27b-qwen36-dev-eval-2026-05-08',
    source_prompt: 'T12 reconciliation — broker vs actual NOI',
    base_behavior:
      'Identified broker pro-forma inflation vs T12 actuals. Applied 12% NOI haircut. Changed verdict from Promote to Reprice.',
    trained_behavior:
      'Accepted broker pro-forma at face value. No T12 reconciliation performed. Retained Promote verdict.',
    expected_behavior:
      'Always reconcile broker pro-forma against T12 actuals. Quantify the gap. Apply conservative estimate. Adjust verdict accordingly.',
    classification: 'propolis',
    repair_needed: true,
    target_pair_block: 'reconciliation_pairs',
  },
  {
    failure_id: 'mf_loi_invented_terms',
    label: 'LOI Binding Section — Invented Terms',
    severity: 'critical',
    source_run: 'atlas27b-qwen36-dev-eval-2026-05-08',
    source_prompt: 'LOI redline — binding sections test',
    base_behavior:
      'Correctly identified binding vs non-binding sections. Flagged deposit risk. Did not add terms not present in prompt.',
    trained_behavior:
      'Added substantive claims to LOI redline that conflicted with explicit prompt specifications. Invented earnest money schedule not in original prompt.',
    expected_behavior:
      'Only redline what is explicitly present. Never invent or add terms. Flag binding sections. Recommend legal review for binding provisions.',
    classification: 'propolis',
    repair_needed: true,
    target_pair_block: 'loi_binding_section_pairs',
  },
  {
    failure_id: 'mf_mortgage_constant_precision',
    label: 'Mortgage Constant Precision Error',
    severity: 'high',
    source_run: 'atlas27b-qwen36-dev-eval-2026-05-08',
    source_prompt: 'Mortgage constant precision test (6.5%, 30yr, monthly)',
    base_behavior:
      'Correct mortgage constant 0.07579. Correct DSCR. Clean REPRICE verdict triggered at 1.18x.',
    trained_behavior:
      'Mortgage constant 0.07621 (+5.6bps error). DSCR off by 0.04x. Softened verdict from REPRICE to PROMOTE with conditions.',
    expected_behavior:
      'Use deterministic formula: MC = r(1+r)^n / ((1+r)^n - 1). Never hallucinate. Precision errors in debt service shift verdicts.',
    classification: 'propolis',
    repair_needed: true,
    target_pair_block: 'mortgage_constant_precision_pairs',
  },
  {
    failure_id: 'mf_lenient_rubric_false_promote',
    label: 'Lenient Rubric False Promote — Stage 5 Calibration',
    severity: 'high',
    source_run: 'atlas27b-qwen36-dev-eval-2026-05-08',
    source_prompt: 'Multiple IC recommendation prompts',
    base_behavior: 'N/A — rubric calibration issue, not model output.',
    trained_behavior:
      'Stage 5 lenient rubric gave cooked Atlas 7-of-7 PROMOTE. Phase 2 v3 strict rubric gave same model 0-of-9 clean Accept.',
    expected_behavior:
      'Rubric must match IC-grade standards. Strict rubric is the ground truth. Lenient rubrics produce false positives that mislead training decisions.',
    classification: 'propolis',
    repair_needed: false,
    target_pair_block: 'verdict_trigger_discipline_pairs',
  },
  {
    failure_id: 'mf_curator_undersized',
    label: 'Curator-9B Undersized for 27B Institutional Audit',
    severity: 'high',
    source_run: 'atlas27b-qwen36-dev-eval-2026-05-08',
    source_prompt: 'Curator audit of IC memo outputs',
    base_behavior:
      'N/A — Curator is auditing base/cooked output, not generating it.',
    trained_behavior:
      'SwarmCurator-9B correct on ~1-of-7 institutional audits. Fabricated math errors. Misclassified prompt facts as unsupported.',
    expected_behavior:
      'Curator-9B acceptable for: format checks, section presence, basic pre-checks. NOT acceptable for: final 27B IC judgment, capital markets verdicts, LOI legal authority.',
    classification: 'jelly',
    repair_needed: false,
    target_pair_block: 'verdict_trigger_discipline_pairs',
  },
  {
    failure_id: 'mf_stnl_hallucination_risk',
    label: 'STNL Tenant Credit Hallucination Risk',
    severity: 'medium',
    source_run: 'atlas27b-qwen36-dev-eval-2026-05-08',
    source_prompt: 'Single-tenant net lease underwriting',
    base_behavior:
      'Flagged tenant credit verification as required step before yield calculation.',
    trained_behavior:
      'Proceeded to yield calculation with stated tenant credit without flagging verification requirement.',
    expected_behavior:
      'Always verify tenant credit before NNN yield conclusion. Hallucinated credit ratings are a liability in client-facing work.',
    classification: 'jelly',
    repair_needed: true,
    target_pair_block: 'stnl_antihallucination_pairs',
  },
  {
    failure_id: 'mf_verdict_hedge',
    label: 'IC Verdict Hedging — No Clean Trigger',
    severity: 'medium',
    source_run: 'atlas27b-qwen36-dev-eval-2026-05-08',
    source_prompt: 'IC recommendation discipline test',
    base_behavior:
      'Produced clean PROMOTE / REPRICE / KILL verdict with one-sentence rationale per trigger point.',
    trained_behavior:
      'Hedged recommendation with multiple conditional clauses. Verdict unclear. No single trigger identified.',
    expected_behavior:
      'IC recommendations must be binary or ternary. No hedged conditional verdicts. State the trigger explicitly.',
    classification: 'jelly',
    repair_needed: true,
    target_pair_block: 'verdict_trigger_discipline_pairs',
  },
]

export const SEED_REPAIR_BLOCKS: RepairPairBlock[] = [
  {
    block_id: 'reconciliation_pairs',
    label: 'Reconciliation Pairs',
    target_count: 15000,
    current_count: 0,
    priority: 'critical',
    source_failures: ['mf_broker_proforma_acceptance', 'mf_memphis_312_interest_coverage_miss'],
    repair_goal:
      'Train model to always reconcile broker pro-forma against T12 actuals before any verdict. Quantify gap. Apply haircut. Show work.',
    expected_behavior:
      'Model receives broker pro-forma + T12 data. It must: (1) compute variance, (2) apply conservative estimate, (3) state reconciled NOI, (4) update verdict.',
    pair_template: {
      pair_id_prefix: 'atlas_mf_reconcile',
      source_eval: 'base_eval_atlas27b_mf',
      base_failure_type: 'broker_proforma_acceptance',
      repair_goal: 'force T12 reconciliation before NOI conclusion',
      domain: 'multifamily_underwriting',
      expected_behavior:
        'Calculate T12 NOI, compare to broker pro-forma, apply haircut, state reconciled figure, adjust verdict accordingly',
      classification_target: 'honey',
    },
  },
  {
    block_id: 'stnl_antihallucination_pairs',
    label: 'STNL Anti-Hallucination Pairs',
    target_count: 5000,
    current_count: 0,
    priority: 'high',
    source_failures: ['mf_stnl_hallucination_risk'],
    repair_goal:
      'Train model to always flag unverified tenant credit before NNN yield conclusions.',
    expected_behavior:
      'Model receives STNL prompt. It must request or flag tenant credit verification before producing yield conclusion. Never hallucinate credit rating.',
    pair_template: {
      pair_id_prefix: 'atlas_stnl_credit',
      source_eval: 'base_eval_atlas27b_stnl',
      base_failure_type: 'stnl_tenant_credit_hallucination_risk',
      repair_goal: 'require explicit tenant credit verification before yield conclusion',
      domain: 'nnn_underwriting',
      expected_behavior:
        'Flag that tenant credit must be verified from a creditworthy source before NNN yield conclusion is valid',
      classification_target: 'honey',
    },
  },
  {
    block_id: 'verdict_trigger_discipline_pairs',
    label: 'Verdict-Trigger Discipline Pairs',
    target_count: 3000,
    current_count: 0,
    priority: 'high',
    source_failures: ['mf_verdict_hedge', 'mf_lenient_rubric_false_promote'],
    repair_goal:
      'Train model to produce binary/ternary IC verdicts with single, explicit trigger rationale.',
    expected_behavior:
      'Model produces: PROMOTE / REPRICE / KILL. One sentence per trigger. No hedging. No conditional clauses.',
    pair_template: {
      pair_id_prefix: 'atlas_mf_verdict',
      source_eval: 'base_eval_atlas27b_ic_discipline',
      base_failure_type: 'verdict_hedge',
      repair_goal: 'force single clean verdict with explicit trigger sentence',
      domain: 'multifamily_underwriting',
      expected_behavior:
        'Output exactly one verdict from {PROMOTE, REPRICE, KILL} with a single trigger sentence referencing the specific metric that drove the decision',
      classification_target: 'honey',
    },
  },
  {
    block_id: 'mortgage_constant_precision_pairs',
    label: 'Mortgage-Constant Precision Pairs',
    target_count: 3000,
    current_count: 0,
    priority: 'high',
    source_failures: ['mf_mortgage_constant_precision'],
    repair_goal:
      'Train model to apply exact mortgage constant formula. Never hallucinate or approximate.',
    expected_behavior:
      'Model uses MC = r(1+r)^n / ((1+r)^n - 1). Shows formula, plugs in values, produces exact constant. Downstream DSCR is correct.',
    pair_template: {
      pair_id_prefix: 'atlas_mf_mc_precision',
      source_eval: 'base_eval_atlas27b_math',
      base_failure_type: 'mortgage_constant_precision',
      repair_goal: 'force exact mortgage constant formula application with shown work',
      domain: 'multifamily_underwriting',
      expected_behavior:
        'Apply MC formula exactly, show work, correct DSCR, correct verdict trigger',
      classification_target: 'honey',
    },
  },
  {
    block_id: 'loi_binding_section_pairs',
    label: 'LOI Binding-Section Discipline Pairs',
    target_count: 5000,
    current_count: 0,
    priority: 'high',
    source_failures: ['mf_loi_invented_terms'],
    repair_goal:
      'Train model to redline only what is present. Never invent LOI terms. Identify binding vs non-binding sections correctly.',
    expected_behavior:
      'Model redlines only prompt-provided terms. Flags binding sections. Notes deposit risk where present. Does not add invented provisions.',
    pair_template: {
      pair_id_prefix: 'atlas_loi_discipline',
      source_eval: 'base_eval_atlas27b_loi',
      base_failure_type: 'loi_invented_terms',
      repair_goal: 'prevent invention of LOI terms not present in prompt',
      domain: 'cre_legal_negotiation',
      expected_behavior:
        'Redline only what is present. Never invent terms. Identify binding sections. Recommend legal review for binding provisions.',
      classification_target: 'honey',
    },
  },
  {
    block_id: 'bridge_refi_failure_pairs',
    label: 'Bridge / Refi Failure Pairs',
    target_count: 5000,
    current_count: 0,
    priority: 'critical',
    source_failures: ['mf_memphis_312_interest_coverage_miss'],
    repair_goal:
      'Train model to calculate interest coverage on Day 1 before any recommendation. If < 1.0x, verdict must be KILL or REPRICE.',
    expected_behavior:
      'Model computes: Annual interest cost = loan × rate. Coverage = T12 NOI / annual interest. If < 1.0x, property cannot service bridge debt. Mandatory Kill/Reprice.',
    pair_template: {
      pair_id_prefix: 'atlas_mf_bridge_refi',
      source_eval: 'base_eval_memphis_312',
      base_failure_type: 'missed_refinance_risk',
      repair_goal: 'force interest-coverage calculation and conservative IC verdict',
      domain: 'multifamily_underwriting',
      expected_behavior:
        'Identify that T12 NOI does not cover bridge interest and recommend Reprice, Needs More Data, or Kill',
      classification_target: 'honey',
    },
  },
]

export const SEED_CURATOR_AUDIT: CuratorAudit = {
  curator_model: 'SwarmCurator 9B (Qwen 3.5-9B fine-tune)',
  audited_run: 'atlas27b-qwen36-dev-eval-2026-05-08',
  correct_audit_rate: 1 / 7,
  total_audits: 7,
  correct_audits: 1,
  status: 'undersized',
  recommendation:
    'SwarmCurator-9B must not be used as a final auditor for 27B institutional output. Use as pre-filter only. Route final audit to base model or human.',
  acceptable_uses: [
    'Format compliance checks (section headers present, length constraints)',
    'Section presence validation (is executive summary included?)',
    'Basic arithmetic pre-check (are numbers internally consistent?)',
    'Required field detection (loan amount, NOI, DSCR present?)',
    'Hallucination flag on simple prompt facts (is stated rate within range?)',
  ],
  not_acceptable_uses: [
    'Final 27B institutional judgment on IC-grade output',
    'Complex capital markets verdict review (DSCR, coverage, exit math)',
    'Waterfall final approval for equity or debt structures',
    'LOI legal/business clause final authority',
    'IC readiness decision — go / no-go for analyst or client delivery',
    'Evaluating nuanced reconciliation quality',
  ],
  failure_modes: [
    {
      type: 'Fabricated math errors',
      description:
        'Curator-9B flagged correct calculations as incorrect, inventing numerical errors that did not exist in the 27B output.',
      frequency: 'common',
    },
    {
      type: 'Prompt-fact misclassification',
      description:
        'Classified prompt-provided facts as "unsupported claims," failing to recognize data that was explicitly given in the context.',
      frequency: 'common',
    },
    {
      type: 'Spec contradiction',
      description:
        'Recommended changes that directly contradicted the explicit specifications of the original prompt.',
      frequency: 'occasional',
    },
    {
      type: 'Verdict calibration mismatch',
      description:
        'Applied looser or stricter standards than Phase 2 v3 rubric, producing inconsistent verdict classifications.',
      frequency: 'occasional',
    },
  ],
}

export const SEED_VERDICT: TribunalVerdict = {
  verdict_id: 'verdict-atlas27b-qwen36-cook-v1-2026-05-08',
  run_id: 'atlas27b-qwen36-dev-eval-2026-05-08',
  date: '2026-05-08',
  model: 'Atlas 27B Qwen 3.6 Cook v1',
  decision: 'regressed_do_not_promote',
  classification: 'jelly',
  readiness: 'Internal Analyst Assist Ready',
  deploy_path:
    'Base Qwen 3.6 27B + v4 prompt engineering + deterministic Python math validator + post-hoc output checker. Do not use Cook v1 for IC or client-facing work.',
  blocked_from: [
    'IC Draft Ready',
    'Client-Facing Deployment',
    'Standalone Analyst Deployment',
    'LOI Review Authority',
    'Capital Markets Final Verdict',
  ],
  rationale:
    'Cook v1 regressed on 6 of 10 load-bearing institutional skills. The Memphis 312 anchor test exposed a critical Day-1 debt service coverage miss that the base model caught on both variants. Math precision errors in mortgage constants and DSCR shifted verdicts incorrectly. The cook adds synthesis richness but removes the precision reflex that institutional underwriting requires.',
  conditions: [
    'May be used for internal analyst assist with mandatory senior review on every output.',
    'Must not be deployed without a deterministic math post-processor.',
    'All IC verdicts from Cook v1 require human sign-off before delivery.',
  ],
  doctrine_note:
    'The cook did not fail. The Tribunal found the failure before the market did.',
  sealed_by: 'Tribunal v0 · Phase 2 v3 Strict Rubric · Granio Eval Ledger',
  seal_timestamp: '2026-05-08T14:00:00Z',
}

export const SEED_STATS: DashboardStats = {
  total_runs: 1,
  total_prompts: 32,
  base_wins: 6,
  cooked_wins: 4,
  ties: 0,
  critical_failures: 4,
  honey: 0,
  jelly: 1,
  propolis: 4,
  readiness: 'Internal Analyst Assist Ready',
}
