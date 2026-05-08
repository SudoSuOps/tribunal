import { Download } from 'lucide-react'

interface Props {
  label: string
  filename: string
  data: unknown
  variant?: 'primary' | 'ghost'
}

export function ExportButton({ label, filename, data, variant = 'ghost' }: Props) {
  const handleExport = () => {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  if (variant === 'primary') {
    return (
      <button
        onClick={handleExport}
        className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium
          bg-[#1A1208] text-[#E8B84B] border border-[#7A5A10]
          hover:bg-[#251A0A] hover:border-[#C8961F] transition-all"
      >
        <Download size={14} />
        {label}
      </button>
    )
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium
        text-[#7878A0] border border-[#22222E] bg-transparent
        hover:text-[#C0C0D8] hover:border-[#32324A] transition-all"
    >
      <Download size={12} />
      {label}
    </button>
  )
}

export function ExportMarkdownButton({ label, filename, content }: { label: string; filename: string; content: string }) {
  const handleExport = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-medium
        text-[#7878A0] border border-[#22222E] bg-transparent
        hover:text-[#C0C0D8] hover:border-[#32324A] transition-all"
    >
      <Download size={12} />
      {label}
    </button>
  )
}
