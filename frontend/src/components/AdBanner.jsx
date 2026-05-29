import { useEffect, useRef } from 'react'
import { ADSENSE_CLIENT, ADSENSE_ENABLED } from '../ads.config'

/**
 * Usage:
 *   <AdBanner slot="1234567890" format="horizontal" />
 *   <AdBanner slot="1234567890" format="rectangle" />
 *
 * formats:
 *   horizontal  → 728×90  leaderboard (desktop) / 320×50 (mobile)
 *   rectangle   → 336×280 medium rectangle
 *   square      → 250×250
 */

const FORMAT_STYLES = {
  horizontal: { minWidth: '320px', minHeight: '50px',  maxHeight: '90px'  },
  rectangle:  { minWidth: '300px', minHeight: '250px', maxHeight: '280px' },
  square:     { minWidth: '250px', minHeight: '250px', maxHeight: '250px' },
}

// Dev placeholder shown when ADSENSE_ENABLED = false
function AdPlaceholder({ format, label }) {
  const style = FORMAT_STYLES[format] || FORMAT_STYLES.horizontal
  return (
    <div
      style={style}
      className="w-full flex flex-col items-center justify-center
        bg-gray-900 border border-dashed border-gray-700 rounded-xl
        text-gray-600 text-xs select-none"
    >
      <span className="font-mono">AD</span>
      <span className="mt-0.5 text-gray-700">{label}</span>
    </div>
  )
}

export default function AdBanner({ slot, format = 'horizontal', label = '' }) {
  const adRef = useRef(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (!ADSENSE_ENABLED || pushed.current) return
    try {
      // Google AdSense push
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch (e) {
      console.warn('AdSense error:', e)
    }
  }, [])

  if (!ADSENSE_ENABLED) {
    return (
      <div className="w-full flex justify-center py-2">
        <AdPlaceholder format={format} label={label} />
      </div>
    )
  }

  return (
    <div className="w-full flex justify-center py-2 overflow-hidden">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
