import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Check, QrCode, Link2 } from 'lucide-react'

export default function TransferCode({ code }) {
  const [copied, setCopied] = useState(null)
  const [showQR, setShowQR] = useState(false)

  const receiveUrl = `${window.location.origin}/receive/${code}`

  const copy = async (text, key) => {
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-6 space-y-5">
      {/* 6-digit code */}
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-2">Share this code with the receiver</p>
        <div className="flex items-center justify-center gap-1">
          {code.split('').map((d, i) => (
            <span
              key={i}
              className="w-10 h-14 flex items-center justify-center rounded-xl bg-gray-800 border border-gray-700 text-3xl font-bold text-cyan-400 font-mono"
            >
              {d}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => copy(code, 'code')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm transition"
        >
          {copied === 'code' ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
          {copied === 'code' ? 'Copied!' : 'Copy code'}
        </button>
        <button
          onClick={() => copy(receiveUrl, 'link')}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-sm transition"
        >
          {copied === 'link' ? <Check size={15} className="text-green-400" /> : <Link2 size={15} />}
          {copied === 'link' ? 'Copied!' : 'Copy link'}
        </button>
        <button
          onClick={() => setShowQR(v => !v)}
          className={`px-4 py-2.5 rounded-xl text-sm transition ${showQR ? 'bg-cyan-600 text-white' : 'bg-gray-800 hover:bg-gray-700'}`}
        >
          <QrCode size={15} />
        </button>
      </div>

      {/* QR code */}
      {showQR && (
        <div className="flex flex-col items-center gap-2 pt-2">
          <div className="bg-white p-3 rounded-xl">
            <QRCodeSVG value={receiveUrl} size={160} />
          </div>
          <p className="text-xs text-gray-500">Scan to receive on another device</p>
        </div>
      )}
    </div>
  )
}
