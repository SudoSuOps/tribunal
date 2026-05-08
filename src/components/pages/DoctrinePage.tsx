import { BookOpen } from 'lucide-react'

const DOCTRINE_SECTIONS = [
  {
    title: 'The Tribunal Doctrine',
    content: `Tribunal begins before training.

Without a base eval, there is no delta. Without delta, there is no honey.

No model enters training without a base-model baseline eval.
No synthetic pair is created without a failure it repairs.
No trained model is accepted without a base-vs-trained delta report.
No output becomes honey without Curator audit and Tribunal seal.`,
  },
  {
    title: 'The Five Proofs',
    content: `Claude can propose.
The terminal must prove.
Curator must audit.
Tribunal must seal.

No proof, no honey.`,
  },
  {
    title: 'The Repair Cycle',
    content: `The base eval finds the wound.
The pair repairs the wound.
The fine-tune teaches the scar.
The Tribunal proves it healed.`,
  },
  {
    title: 'The Classification System',
    content: `Honey (≥ 0.85): Dense, load-bearing, IC-grade. You earn Honey.
Jelly (0.70–0.84): Value-add, solid output, research quality.
Propolis (< 0.70 or critical failure): Compost. Feeds the genome. Nothing wasted.

Weight is not assigned. Weight is measured.`,
  },
  {
    title: 'The Curator Rule',
    content: `Curator audits. Curator does not seal.

A smaller model cannot be the final judge of a larger model's institutional output.
Curator-9B catches format errors and pre-checks math.
It does not determine IC-grade fitness.

The verdict belongs to the human or the base model acting as senior judge.`,
  },
  {
    title: 'The Atlas Verdict (May 2026)',
    content: `The cook did not fail. The Tribunal found the failure before the market did.

Cook v1 regressed on 6 of 10 load-bearing skills. The Memphis 312 anchor test
exposed a Day-1 debt service coverage miss that the base model caught on both variants.
Math precision errors in mortgage constants shifted verdicts incorrectly.

The Tribunal held. The market did not see it. That is the point.`,
  },
]

const CHIPS = [
  'Base Eval First',
  'No Delta, No Honey',
  'No Proof, No Honey',
  'Curator Audits, Tribunal Seals',
  'The cook did not fail — the Tribunal found it',
]

export function DoctrinePage() {
  return (
    <div className="space-y-8 animate-fade-in max-w-3xl">
      <div className="flex items-start gap-3">
        <BookOpen size={20} className="text-[#C4A231] mt-1 shrink-0" />
        <div>
          <h2 className="font-display text-xl text-[#E0E0EC]">Doctrine</h2>
          <p className="text-sm text-[#555575] mt-1">
            The principles that govern base model evaluation and training data integrity
          </p>
        </div>
      </div>

      {/* Doctrine chips */}
      <div className="flex flex-wrap gap-2">
        {CHIPS.map((chip) => (
          <span
            key={chip}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono
              badge-sealed text-[#C4A231]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#C4A231]" />
            {chip}
          </span>
        ))}
      </div>

      {/* Main doctrine */}
      {DOCTRINE_SECTIONS.map((section) => (
        <div key={section.title} className="card-surface p-6">
          <div className="text-xs font-mono text-[#555575] uppercase tracking-widest mb-4">
            {section.title}
          </div>
          <div className="doctrine-text text-base leading-relaxed whitespace-pre-line">
            {section.content}
          </div>
        </div>
      ))}

      {/* Closing seal */}
      <div className="card-surface p-6 border-[#7A5A10] text-center">
        <div className="inline-flex items-center justify-center seal-ring mb-4">
          <span className="text-2xl">⚖</span>
        </div>
        <div className="doctrine-text text-lg mb-2">
          "No proof, no honey."
        </div>
        <div className="text-xs font-mono text-[#555575]">
          Granio Tribunal · Swarm & Bee Eval Ledger · v0
        </div>
      </div>
    </div>
  )
}
