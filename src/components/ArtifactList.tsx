import { FileText, FileJson, FileSpreadsheet, File } from 'lucide-react'
import type { ArtifactFile } from '../types'

const icons = {
  json: FileJson,
  csv: FileSpreadsheet,
  md: FileText,
  txt: File,
}

const typeColors = {
  json: 'text-[#60A5FA]',
  csv: 'text-[#4ADE80]',
  md: 'text-[#E8B84B]',
  txt: 'text-[#7878A0]',
}

interface Props {
  artifacts: ArtifactFile[]
}

export function ArtifactList({ artifacts }: Props) {
  return (
    <div className="space-y-2">
      {artifacts.map((a) => {
        const Icon = icons[a.type] ?? File
        return (
          <div
            key={a.filename}
            className="flex items-start gap-3 p-3 card-surface hover:border-[#32324A] transition-colors"
          >
            <Icon size={16} className={`${typeColors[a.type]} mt-0.5 shrink-0`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-mono text-[#C0C0D8] truncate">{a.filename}</div>
              <div className="text-xs text-[#555575] mt-0.5">{a.description}</div>
              <div className="text-xs font-mono text-[#404060] mt-1">{a.path}</div>
            </div>
            {a.size_kb && (
              <span className="text-xs font-mono text-[#404060] shrink-0">{a.size_kb} KB</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
