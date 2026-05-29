import { useRef, useState } from 'react'
import { Upload, File, X } from 'lucide-react'

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export default function DropZone({ files, onChange }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const addFiles = (newFiles) => {
    const list = Array.from(newFiles)
    onChange(prev => {
      const existing = new Set(prev.map(f => f.name + f.size))
      return [...prev, ...list.filter(f => !existing.has(f.name + f.size))]
    })
  }

  const removeFile = (idx) => onChange(prev => prev.filter((_, i) => i !== idx))

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
        className={`
          border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
          transition-all duration-200 select-none
          ${dragging
            ? 'border-cyan-400 bg-cyan-950/30 scale-[1.02]'
            : 'border-gray-700 hover:border-cyan-600 hover:bg-gray-900'
          }
        `}
      >
        <Upload className="mx-auto mb-3 text-cyan-400" size={36} />
        <p className="text-white font-semibold text-lg">Drop files here</p>
        <p className="text-gray-400 text-sm mt-1">or click to browse · any size · any format</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={e => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-3 bg-gray-900 rounded-xl px-4 py-3">
              <File size={18} className="text-cyan-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{f.name}</p>
                <p className="text-xs text-gray-500">{formatBytes(f.size)}</p>
              </div>
              <button onClick={() => removeFile(i)} className="text-gray-600 hover:text-red-400 transition">
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
