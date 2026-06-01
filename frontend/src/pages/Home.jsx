import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, ArrowRight, Shield, Zap, Globe } from 'lucide-react'
import DropZone from '../components/DropZone'
import TransferCode from '../components/TransferCode'
import ProgressBar from '../components/ProgressBar'
import SEO from '../components/SEO'
import AdBanner from '../components/AdBanner'
import { PAGES } from '../seo.config'
import { AD_SLOTS } from '../ads.config'
import { useSender } from '../hooks/useWebRTC'

const STATUS_LABEL = {
  creating:   'Creating room…',
  waiting:    'Waiting for receiver…',
  connecting: 'Connecting…',
  sending:    'Sending…',
  done:       'Transfer complete!',
  error:      'Connection failed — try again',
}

export default function Home() {
  const [files, setFiles] = useState([])
  const { status, code, transfers, start, cancel } = useSender()
  const navigate = useNavigate()

  const handleSend = () => {
    if (files.length === 0) return
    start(files)
  }

  const isActive = status !== 'idle' && status !== 'done' && status !== 'error'

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
      <SEO page={PAGES.home} />

      {/* Hero */}
      <section className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Send files instantly
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Direct device-to-device transfer. No uploads. No cloud. No account needed.
        </p>
        <button
          onClick={() => navigate('/receive')}
          className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm transition"
        >
          Want to receive instead? <ArrowRight size={14} />
        </button>
      </section>

      {/* Ad — between hero and send tool */}
      <AdBanner slot={AD_SLOTS.HOME_TOP.slot} format="horizontal" label={AD_SLOTS.HOME_TOP.label} />

      {/* Send panel */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <DropZone files={files} onChange={setFiles} />

          {status === 'idle' && (
            <button
              onClick={handleSend}
              disabled={files.length === 0}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold
                bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-800 disabled:text-gray-600
                text-black transition"
            >
              <Send size={18} />
              Send {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''}` : 'files'}
            </button>
          )}

          {isActive && (
            <button
              onClick={cancel}
              className="w-full py-3 rounded-xl font-semibold bg-gray-800 hover:bg-red-900/40 hover:text-red-400 transition text-sm"
            >
              Cancel transfer
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Status badge */}
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

          {code && <TransferCode code={code} />}
          {transfers.length > 0 && <ProgressBar transfers={transfers} />}

          {status === 'done' && (
            <button
              onClick={() => { cancel(); setFiles([]) }}
              className="w-full py-3 rounded-xl font-semibold bg-green-600 hover:bg-green-500 text-white transition"
            >
              Send more files
            </button>
          )}

          {/* Placeholder when idle */}
          {status === 'idle' && (
            <div className="border border-gray-800 rounded-2xl p-8 text-center space-y-2">
              <Send className="mx-auto text-gray-700" size={40} />
              <p className="text-gray-600 text-sm">Select files and click Send to get a 6-digit code</p>
            </div>
          )}
        </div>
      </section>

      {/* Ad — below send tool, above feature cards */}
      <AdBanner slot={AD_SLOTS.HOME_BOTTOM.slot} format="horizontal" label={AD_SLOTS.HOME_BOTTOM.label} />

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: Shield, color: 'text-cyan-400', title: 'End-to-End P2P', desc: 'Files go directly between devices. Nothing touches our servers.' },
          { icon: Zap, color: 'text-yellow-400', title: 'Blazing Fast', desc: 'Full bandwidth P2P transfer. Limited only by your connection speed.' },
          { icon: Globe, color: 'text-purple-400', title: 'Works Everywhere', desc: 'Browser-based. Works on desktop, tablet and mobile without any app.' },
        ].map(({ icon: Icon, color, title, desc }) => (
          <div key={title} className="bg-gray-900 rounded-2xl p-6 space-y-3 border border-gray-800">
            <Icon className={color} size={28} />
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="text-gray-400 text-sm">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
