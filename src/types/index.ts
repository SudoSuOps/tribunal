export type Domain =
  | 'CRE'
  | 'Medical'
  | 'Legal'
  | 'Credit'
  | 'Coding'
  | 'Energy'
  | 'Mining'
  | 'Robotics'
  | 'Custom'

export type Classification = 'honey' | 'jelly' | 'propolis'

export type Severity = 'critical' | 'high' | 'medium' | 'low'

export type VerdictDecision =
  | 'promote'
  | 'promote_with_conditions'
  | 'jelly_research_artifact'
  | 'regressed_do_not_promote'
  | 'kill_archive'

export type ProductionReadiness =
  | 'Client-Facing Ready'
  | 'IC Draft Ready'
  | 'Internal Analyst Assist Ready'
  | 'Research Only'
  | 'Do Not Deploy'

export type ComparisonWinner = 'base' | 'cooked' | 'tie'

export interface ArtifactFile {
  filename: string
  type: 'json' | 'csv' | 'md' | 'txt'
  description: string
  path: string
  size_kb?: number
}

export interface PromptResult {
  prompt_id: string
  prompt_label: string
  base_score?: number
  cooked_score?: number
  winner: ComparisonWinner
  base_summary: string
  cooked_summary: string
  classification: Classification
  notes: string
}

export interface EvalRun {
  run_id: string
  date: string
  domain: Domain
  subdomain: string
  base_model: string
  trained_model: string | null
  prompt_pack: string
  prompt_count: number
  rubric: string
  result_summary: string
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

export interface ComparisonDimension {
  dimension: string
  base_score: number
  cooked_score: number
  winner: ComparisonWinner
  base_notes: string
  cooked_notes: string
  weight: 'load-bearing' | 'value-add' | 'informational'
}

export interface ModelComparison {
  run_id: string
  base_model: string
  cooked_model: string
  dimensions: ComparisonDimension[]
  overall_winner: ComparisonWinner
  summary: string
}

export interface FailureMode {
  failure_id: string
  label: string
  severity: Severity
  source_run: string
  source_prompt: string
  base_behavior: string
  trained_behavior: string
  expected_behavior: string
  classification: Classification
  repair_needed: boolean
  target_pair_block: string
  example_input?: string
  example_base_output?: string
  example_trained_output?: string
}

export interface RepairPairBlock {
  block_id: string
  label: string
  target_count: number
  current_count: number
  source_failures: string[]
  repair_goal: string
  expected_behavior: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  pair_template: PairTemplate
}

export interface PairTemplate {
  pair_id_prefix: string
  source_eval: string
  base_failure_type: string
  repair_goal: string
  domain: string
  expected_behavior: string
  classification_target: Classification
}

export interface CuratorAudit {
  curator_model: string
  audited_run: string
  correct_audit_rate: number
  total_audits: number
  correct_audits: number
  failure_modes: CuratorFailureMode[]
  acceptable_uses: string[]
  not_acceptable_uses: string[]
  status: 'undersized' | 'adequate' | 'overkill'
  recommendation: string
}

export interface CuratorFailureMode {
  type: string
  description: string
  frequency: 'common' | 'occasional' | 'rare'
}

export interface TribunalVerdict {
  verdict_id: string
  run_id: string
  date: string
  model: string
  decision: VerdictDecision
  classification: Classification
  readiness: ProductionReadiness
  deploy_path: string
  blocked_from: string[]
  rationale: string
  conditions?: string[]
  doctrine_note: string
  sealed_by: string
  seal_timestamp: string
}

export interface DashboardStats {
  total_runs: number
  total_prompts: number
  base_wins: number
  cooked_wins: number
  ties: number
  critical_failures: number
  honey: number
  jelly: number
  propolis: number
  readiness: ProductionReadiness
}
