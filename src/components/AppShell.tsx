import type { ReactNode } from 'react'
import {
  LayoutDashboard, ListChecks, Microscope, GitCompare, Bug,
  Wrench, ShieldCheck, Gavel, BookOpen, ChevronRight, Play, Library,
} from 'lucide-react'
import { DoctrineChip } from './DoctrineChip'

type Page =
  | 'dashboard'
  | 'eval-runs'
  | 'run-detail'
  | 'model-comparison'
  | 'failure-taxonomy'
  | 'pair-factory'
  | 'curator-qc'
  | 'tribunal-verdicts'
  | 'doctrine'
  | 'prompt-runner'
  | 'prompt-library'

interface NavItem {
  page: Page
  label: string
  icon: typeof LayoutDashboard
  badge?: string
}

const NAV_ITEMS: NavItem[] = [
  { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { page: 'eval-runs', label: 'Eval Runs', icon: ListChecks, badge: '1' },
  { page: 'run-detail', label: 'Run Detail', icon: Microscope },
  { page: 'model-comparison', label: 'Model Comparison', icon: GitCompare },
  { page: 'failure-taxonomy', label: 'Failure Taxonomy', icon: Bug, badge: '8' },
  { page: 'pair-factory', label: 'Pair Factory', icon: Wrench, badge: '6' },
  { page: 'curator-qc', label: 'Curator QC', icon: ShieldCheck },
  { page: 'tribunal-verdicts', label: 'Verdicts', icon: Gavel, badge: '1' },
  { page: 'doctrine', label: 'Doctrine', icon: BookOpen },
  { page: 'prompt-runner', label: 'Prompt Runner', icon: Play },
  { page: 'prompt-library', label: 'Prompt Library', icon: Library },
]

const DOCTRINE_CHIPS = [
  'Base Eval First',
  'No Delta, No Honey',
  'No Proof, No Honey',
  'Curator Audits',
  'Tribunal Seals',
]

interface Props {
  activePage: Page
  onNavigate: (page: Page) => void
  children: ReactNode
}

export function AppShell({ activePage, onNavigate, children }: Props) {
  return (
    <div className="flex h-screen overflow-hidden tribunal-bg">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col border-r border-[#1C1C26] bg-[#0A0A10] overflow-y-auto">
        {/* Logo */}
        <div className="p-4 border-b border-[#1C1C26]">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-6 h-6 rounded flex items-center justify-center bg-[#1A1208] border border-[#7A5A10]">
              <span className="text-sm">⚖</span>
            </div>
            <span className="font-display text-base text-[#E0E0EC] tracking-wide">Granio</span>
          </div>
          <div className="text-xs font-mono text-[#404060] pl-8">Tribunal · v0</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5">
          <div className="nav-section-label">Ledger</div>
          {NAV_ITEMS.slice(0, 4).map((item) => {
            const Icon = item.icon
            const active = activePage === item.page
            return (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`nav-item w-full ${active ? 'active' : ''}`}
              >
                <Icon size={14} className="shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && !active && (
                  <span className="text-xs font-mono bg-[#1C1C26] text-[#555575] px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
                {active && <ChevronRight size={12} className="shrink-0" />}
              </button>
            )
          })}

          <div className="nav-section-label mt-2">Analysis</div>
          {NAV_ITEMS.slice(4, 7).map((item) => {
            const Icon = item.icon
            const active = activePage === item.page
            return (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`nav-item w-full ${active ? 'active' : ''}`}
              >
                <Icon size={14} className="shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && !active && (
                  <span className="text-xs font-mono bg-[#1C1C26] text-[#555575] px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
                {active && <ChevronRight size={12} className="shrink-0" />}
              </button>
            )
          })}

          <div className="nav-section-label mt-2">Court</div>
          {NAV_ITEMS.slice(7, 9).map((item) => {
            const Icon = item.icon
            const active = activePage === item.page
            return (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`nav-item w-full ${active ? 'active' : ''}`}
              >
                <Icon size={14} className="shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && !active && (
                  <span className="text-xs font-mono bg-[#1C1C26] text-[#555575] px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
                {active && <ChevronRight size={12} className="shrink-0" />}
              </button>
            )
          })}

          <div className="nav-section-label mt-2">Prompts</div>
          {NAV_ITEMS.slice(9).map((item) => {
            const Icon = item.icon
            const active = activePage === item.page
            return (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className={`nav-item w-full ${active ? 'active' : ''}`}
              >
                <Icon size={14} className="shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && !active && (
                  <span className="text-xs font-mono bg-[#1C1C26] text-[#555575] px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
                {active && <ChevronRight size={12} className="shrink-0" />}
              </button>
            )
          })}
        </nav>

        {/* Doctrine footer */}
        <div className="p-3 border-t border-[#1C1C26] space-y-1.5">
          <div className="text-xs font-mono text-[#2A2A3E] uppercase tracking-widest mb-2">Doctrine</div>
          {DOCTRINE_CHIPS.slice(0, 3).map((chip) => (
            <div
              key={chip}
              className="text-xs font-mono text-[#404060] flex items-center gap-1.5"
            >
              <span className="w-1 h-1 rounded-full bg-[#555575]" />
              {chip}
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top header */}
        <header className="h-12 shrink-0 flex items-center justify-between px-5 border-b border-[#1C1C26] bg-[#09090D]">
          <div className="flex items-center gap-3">
            <span className="font-display text-sm text-[#C0C0D8]">Granio Tribunal</span>
            <span className="text-[#2A2A3E]">·</span>
            <span className="text-xs text-[#555575]">Base model domain eval ledger · Failure-to-pair refinery · Swarm Tribunal</span>
          </div>
          <div className="flex items-center gap-2">
            {DOCTRINE_CHIPS.map((chip) => (
              <DoctrineChip key={chip} label={chip} active />
            ))}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  )
}

export type { Page }
