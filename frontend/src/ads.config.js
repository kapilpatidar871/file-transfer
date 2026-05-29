/**
 * ─────────────────────────────────────────────────────
 *  ADS CONFIG — Edit this file to manage all ad units
 * ─────────────────────────────────────────────────────
 *
 * 1. Sign up at https://adsense.google.com
 * 2. Get your publisher ID  (ca-pub-XXXXXXXXXXXXXXXX)
 * 3. Create ad units → get slot IDs
 * 4. Paste them below and set ADSENSE_ENABLED = true
 */

export const ADSENSE_CLIENT = 'ca-pub-XXXXXXXXXXXXXXXX'  // ← replace with your publisher ID

export const ADSENSE_ENABLED = false   // ← set true after AdSense approval

export const AD_SLOTS = {
  // Home page — below hero, above send panel
  HOME_TOP:        { slot: '1234567890', format: 'horizontal', label: 'Home Top Banner' },

  // Home page — below feature cards
  HOME_BOTTOM:     { slot: '0987654321', format: 'horizontal', label: 'Home Bottom Banner' },

  // Receive page — shown while waiting for sender
  RECEIVE_WAITING: { slot: '1122334455', format: 'rectangle', label: 'Receive Waiting' },

  // Receive page — after download completes
  RECEIVE_DONE:    { slot: '5544332211', format: 'horizontal', label: 'Receive Done Banner' },

  // Sidebar rectangle (if you add sidebar later)
  SIDEBAR:         { slot: '9988776655', format: 'rectangle', label: 'Sidebar Rectangle' },
}
