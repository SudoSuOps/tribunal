import type { ReactNode } from 'react'

interface Props {
  label: string
  value: string | number
  sub?: string
  accent?: 'honey' | 'jelly' | 'propolis' | 'base' | 'cooked' | 'pass' | 'neutral'
  icon?: ReactNode
  small?: boolean
}

const accentMap = {
  honey: 'text-[#E8B84B]',
  jelly: 'text-[#F59E0B]',
  propolis: 'text-[#E74C3C]',
  base: 'text-[#60A5FA]',
  cooked: 'text-[#A78BFA]',
  pass: 'text-[#4ADE80]',
  neutral: 'text-[#E0E0EC]',
}

const borderMap = {
  honey: 'border-[#7A5A10]',
  jelly: 'border-[#7A400A]',
  propolis: 'border-[#6E2018]',
  base: 'border-[#1E3E6E]',
  cooked: 'border-[#3E2878]',
  pass: 'border-[#14532D]',
  neutral: 'border-[#22222E]',
}

export function MetricCard({ label, value, sub, accent = 'neutral', icon, small = false }: Props) {
  return (
    <div className={`card-surface p-4 ${borderMap[accent]} animate-slide-up`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-mono text-[#555575] uppercase tracking-widest">{label}</span>
        {icon && <span className="text-[#404060]">{icon}</span>}
      </div>
      <div className={`metric-num ${small ? 'text-2xl' : 'text-3xl'} ${accentMap[accent]} leading-none`}>
        {value}
      </div>
      {sub && <div className="text-xs text-[#555575] mt-1.5">{sub}</div>}
    </div>
  )
}
