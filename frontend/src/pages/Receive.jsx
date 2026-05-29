import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Download, ArrowLeft, Inbox } from 'lucide-react'
import ProgressBar from '../components/ProgressBar'
import SEO from '../components/SEO'
import AdBanner from '../components/AdBanner'
import { PAGES } from '../seo.config'
import { AD_SLOTS } from '../ads.config'
import { useReceiver } from '../hooks/useWebRTC'

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`
}

const STATUS_LABEL = {
  connecting: 'Connecting to sender…',
  receiving:  'Receiving files…',
  done:       'All files received!',
  error:      'Connection failed or sender disconnected',
}

export default function Receive() {
  const { code: urlCode } = useParams()
  const navigate = useNavigate()
  const [input, setInput] = useState(urlCode || '')
  const { status, transfers, receivedFiles, join } = useReceiver()

  // Auto-join if code is in URL
  useEffect(() => {
    if (urlCode && urlCode.length === 6) join(urlCode)
  }, [urlCode])

  const handleJoin = () => {
    if (input.length !== 6) return
    if (!urlCode) navigate(`/receive/${input}`, { replace: true })
    join(input)
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-8">
      <SEO page={PAGES.receive} />

      <button onClick={() => navigate('/')} className="flex items-center gap-1 text-gray-500 hover:text-white text-sm transition">
        <ArrowLeft size={14} /> Back to Send
      </button>

      <div className="text-center space-y-2">
        <Inbox className="mx-auto text-cyan-400" size={40} />
        <h1 className="text-3xl font-bold">Receive a file</h1>
        <p className="text-gray-400 text-sm">Enter the 6-digit code from the sender</p>
      </div>

      {/* Ad — shown while user is on the receive page waiting */}
      {(status === 'idle' || status === 'connecting') && (
        <AdBanner slot={AD_SLOTS.RECEIVE_WAITING.slot} format="rectangle" label={AD_SLOTS.RECEIVE_WAITING.label} />
      )}

      {/* Code input */}
      {status === 'idle' && (
        <div className="space-y-4">
          <div className="flex gap-2 justify-center">
            {Array.from({ length: 6 }).map((_, i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                value={input[i] || ''}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '')
                  const arr = input.split('')
                  arr[i] = val
                  const next = arr.join('').slice(0, 6)
                  setInput(next)
                  if (val && i < 5) {
                    const nextInput = e.target.parentElement.children[i + 1]
                    nextInput?.focus()
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Backspace' && !input[i] && i > 0) {
                    const prevInput = e.target.parentElement.children[i - 1]
                    prevInput?.focus()
                    const arr = input.split('')
                    arr[i - 1] = ''
                    setInput(arr.join(''))
                  }
                  if (e.key === 'Enter') handleJoin()
                }}
                className="w-12 h-14 text-center text-2xl font-bold font-mono rounded-xl
                  bg-gray-800 border border-gray-700 focus:border-cyan-400 focus:outline-none
                  text-cyan-400 transition"
              />
            ))}
          </div>

          <button
            onClick={handleJoin}
            disabled={input.length !== 6}
            className="w-full py-3 rounded-xl font-semibold bg-cyan-500 hover:bg-cyan-400
              disabled:bg-gray-800 disabled:text-gray-600 text-black transition"
          >
            Receive Files
          </button>
        </div>
      )}

      {/* Status */}
      {status !== 'idle' && (
        <div className={`
          px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2
          ${status === 'done' ? 'bg-green-950 text-green-400 border border-green-800'
            : status === 'error' ? 'bg-red-950 text-red-400 border border-red-800'
            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'}
        `}>
          {status !== 'done' && status !== 'error' && (
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          )}
          {STATUS_LABEL[status] || status}
        </div>
      )}

      {/* Progress */}
      {transfers.length > 0 && <ProgressBar transfers={transfers} />}

      {/* Ad — shown after transfer completes (high engagement moment) */}
      {status === 'done' && (
        <AdBanner slot={AD_SLOTS.RECEIVE_DONE.slot} format="horizontal" label={AD_SLOTS.RECEIVE_DONE.label} />
      )}

      {/* Download received files */}
      {receivedFiles.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-white">Ready to download</h2>
          {receivedFiles.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-900 rounded-xl px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{f.name}</p>
                <p className="text-xs text-gray-500">{formatBytes(f.size)}</p>
              </div>
              <a
                href={f.url}
                download={f.name}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition"
              >
                <Download size={14} /> Save
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
