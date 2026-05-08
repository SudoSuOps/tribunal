import { useState } from 'react'
import { AppShell, type Page } from './components/AppShell'
import { DashboardOverview } from './components/pages/DashboardOverview'
import { EvalRunsPage } from './components/pages/EvalRunsPage'
import { RunDetailPage } from './components/pages/RunDetailPage'
import { ModelComparisonPage } from './components/pages/ModelComparisonPage'
import { FailureTaxonomyPage } from './components/pages/FailureTaxonomyPage'
import { PairFactoryPage } from './components/pages/PairFactoryPage'
import { CuratorQCPage } from './components/pages/CuratorQCPage'
import { TribunalVerdictsPage } from './components/pages/TribunalVerdictsPage'
import { DoctrinePage } from './components/pages/DoctrinePage'
import {
  SEED_EVAL_RUN,
  SEED_COMPARISON,
  SEED_FAILURES,
  SEED_REPAIR_BLOCKS,
  SEED_CURATOR_AUDIT,
  SEED_VERDICT,
  SEED_STATS,
} from './data/seed'

const ALL_RUNS = [SEED_EVAL_RUN]
const ALL_VERDICTS = [SEED_VERDICT]

export default function App() {
  const [activePage, setActivePage] = useState<Page>('dashboard')
  const [selectedRunId, setSelectedRunId] = useState<string | null>(SEED_EVAL_RUN.run_id)

  const selectedRun = ALL_RUNS.find((r) => r.run_id === selectedRunId) ?? null

  const handleNavigate = (page: string) => setActivePage(page as Page)

  const handleSelectRun = (runId: string) => {
    setSelectedRunId(runId)
  }

  return (
    <AppShell activePage={activePage} onNavigate={setActivePage}>
      {activePage === 'dashboard' && (
        <DashboardOverview
          stats={SEED_STATS}
          runs={ALL_RUNS}
          onSelectRun={handleSelectRun}
          onNavigate={handleNavigate}
        />
      )}
      {activePage === 'eval-runs' && (
        <EvalRunsPage
          runs={ALL_RUNS}
          onSelectRun={handleSelectRun}
          onNavigate={handleNavigate}
        />
      )}
      {activePage === 'run-detail' && (
        <RunDetailPage
          run={selectedRun}
          onBack={() => setActivePage('eval-runs')}
        />
      )}
      {activePage === 'model-comparison' && (
        <ModelComparisonPage comparison={SEED_COMPARISON} />
      )}
      {activePage === 'failure-taxonomy' && (
        <FailureTaxonomyPage
          failures={SEED_FAILURES}
          onNavigatePairFactory={() => setActivePage('pair-factory')}
        />
      )}
      {activePage === 'pair-factory' && (
        <PairFactoryPage blocks={SEED_REPAIR_BLOCKS} />
      )}
      {activePage === 'curator-qc' && (
        <CuratorQCPage audit={SEED_CURATOR_AUDIT} />
      )}
      {activePage === 'tribunal-verdicts' && (
        <TribunalVerdictsPage verdicts={ALL_VERDICTS} />
      )}
      {activePage === 'doctrine' && (
        <DoctrinePage />
      )}
    </AppShell>
  )
}
