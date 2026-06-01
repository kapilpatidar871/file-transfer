import { CheckCircle2, Zap } from 'lucide-react'

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}

function estimateTime(remaining, speed) {
  if (!speed || !remaining) return ''
  const secs = remaining / speed
  if (secs < 60) return `~${Math.ceil(secs)}s left`
  return `~${Math.ceil(secs / 60)}m left`
}

export default function ProgressBar({ transfers }) {
  return (
    <div className="space-y-3">
      {transfers.map((t, i) => (
        <div key={i} className="bg-gray-900 rounded-xl p-4">
          {/* File name + status */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium truncate max-w-[65%]">{t.name}</p>
            <span className="text-xs font-semibold">
              {t.done
                ? <span className="flex items-center gap-1 text-green-400">
                    <CheckCircle2 size={13} /> Done
                  </span>
                : <span className="text-cyan-400">{Math.round(t.pct)}%</span>
              }
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-200
                ${t.done ? 'bg-green-400' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}
              style={{ width: `${t.pct}%` }}
            />
          </div>

          {/* Speed + size + time */}
          {!t.done && (
            <div className="flex items-center justify-between mt-1.5 text-xs text-gray-500">
              <span>{formatBytes(t.transferred)} / {formatBytes(t.total)}</span>
              <div className="flex items-center gap-2">
                {t.speed > 0 && (
                  <>
                    <span className="flex items-center gap-0.5 text-cyan-400 font-medium">
                      <Zap size={10} />
                      {formatBytes(t.speed)}/s
                    </span>
                    <span className="text-gray-600">
                      {estimateTime(t.total - t.transferred, t.speed)}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Done summary */}
          {t.done && (
            <p className="text-xs text-green-500 mt-1">
              {formatBytes(t.total)} transferred successfully
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
