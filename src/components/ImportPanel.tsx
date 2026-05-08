import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'

interface ImportedFile {
  name: string
  type: string
  content: string
  size: number
}

interface Props {
  onImport?: (file: ImportedFile) => void
}

export function ImportPanel({ onImport }: Props) {
  const [imported, setImported] = useState<ImportedFile[]>([])
  const [preview, setPreview] = useState<ImportedFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    setError(null)
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['json', 'csv', 'md', 'txt'].includes(ext ?? '')) {
      setError(`Unsupported file type: .${ext}. Accepted: .json, .csv, .md, .txt`)
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      const item: ImportedFile = { name: file.name, type: ext ?? 'txt', content, size: file.size }
      setImported((prev) => [...prev.filter((f) => f.name !== file.name), item])
      setPreview(item)
      onImport?.(item)
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    Array.from(e.dataTransfer.files).forEach(handleFile)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(handleFile)
  }

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border border-dashed border-[#32324A] rounded-md p-8 text-center cursor-pointer
          hover:border-[#C8961F] hover:bg-[#1A1208] transition-all group"
      >
        <Upload size={24} className="mx-auto mb-3 text-[#404060] group-hover:text-[#C8961F] transition-colors" />
        <div className="text-sm text-[#7878A0] mb-1">Drop eval artifacts here or click to browse</div>
        <div className="text-xs font-mono text-[#404060]">.json · .csv · .md · .txt</div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".json,.csv,.md,.txt"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-[#E74C3C] p-3 bg-[#1A0806] border border-[#6E2018] rounded">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {imported.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-mono text-[#404060] uppercase tracking-widest">Imported ({imported.length})</div>
          {imported.map((f) => (
            <button
              key={f.name}
              onClick={() => setPreview(f)}
              className={`w-full flex items-center gap-3 p-3 rounded border text-left transition-all
                ${preview?.name === f.name
                  ? 'border-[#C8961F] bg-[#1A1208]'
                  : 'border-[#22222E] bg-[#13131A] hover:border-[#32324A]'
                }`}
            >
              <CheckCircle size={14} className="text-[#4ADE80] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-[#C0C0D8] truncate">{f.name}</div>
                <div className="text-xs font-mono text-[#555575]">
                  .{f.type} · {(f.size / 1024).toFixed(1)} KB
                </div>
              </div>
              <FileText size={14} className="text-[#404060] shrink-0" />
            </button>
          ))}
        </div>
      )}

      {preview && (
        <div className="card-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-mono text-[#7878A0]">{preview.name}</div>
            <span className="badge-sealed px-2 py-0.5 rounded text-xs font-mono border">Preview</span>
          </div>
          <pre className="text-xs font-mono text-[#A0A0C0] overflow-auto max-h-48 whitespace-pre-wrap leading-relaxed">
            {preview.content.slice(0, 2000)}{preview.content.length > 2000 ? '\n\n... (truncated)' : ''}
          </pre>
        </div>
      )}
    </div>
  )
}
