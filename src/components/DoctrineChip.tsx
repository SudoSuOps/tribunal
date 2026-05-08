interface Props {
  label: string
  active?: boolean
}

export function DoctrineChip({ label, active = false }: Props) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium
        border transition-all
        ${active
          ? 'badge-sealed text-[#C4A231]'
          : 'text-[#555575] border-[#1E1E2B] bg-[#0F0F15] hover:text-[#8888A0] hover:border-[#2A2A3E]'
        }
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[#C4A231]' : 'bg-[#333350]'}`} />
      {label}
    </span>
  )
}
