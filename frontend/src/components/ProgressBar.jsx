import { CheckCircle2, Loader2 } from 'lucide-react'

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}

export default function ProgressBar({ transfers }) {
  return (
    <div className="space-y-3">
      {transfers.map((t, i) => (
        <div key={i} className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium truncate max-w-[70%]">{t.name}</p>
            <span className="text-xs text-gray-400">
              {t.done
                ? <span className="flex items-center gap-1 text-green-400"><CheckCircle2 size={13} /> Done</span>
                : `${Math.round(t.pct)}%`
              }
            </span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${t.done ? 'bg-green-400' : 'bg-cyan-400'}`}
              style={{ width: `${t.pct}%` }}
            />
          </div>
          {!t.done && (
            <div className="flex justify-between mt-1 text-xs text-gray-500">
              <span>{formatBytes(t.transferred)} / {formatBytes(t.total)}</span>
              {t.speed > 0 && <span>{formatBytes(t.speed)}/s</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
