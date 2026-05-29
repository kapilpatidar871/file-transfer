/**
 * ─────────────────────────────────────────────────────
 *  SEO CONFIG — Edit this file to update all keywords
 * ─────────────────────────────────────────────────────
 *
 * SITE = global settings (applied on every page)
 * PAGES = per-page overrides
 *
 * After editing, save the file — changes apply instantly
 * in dev mode, or after `npm run build` in production.
 */

export const SITE = {
  name:        'FileShare',
  tagline:     'Send Files Instantly — Free & Secure',
  url:         'https://yourdomain.com',       // ← change to your domain
  twitterHandle: '@fileshareapp',              // ← change to your Twitter/X handle
  logo:        '/icon.svg',
}

export const PAGES = {

  // ── Home page (/  ) ────────────────────────────────
  home: {
    title:       'FileShare — Send Files Online Free | No Signup Required',
    description: 'Send files of any size directly between devices. No account, no cloud upload. Pure P2P file transfer via browser. Free forever.',
    keywords:    [
      'send files online free',
      'transfer files between devices',
      'share files without account',
      'p2p file transfer',
      'send large files free',
      'file sharing no signup',
      'send files to phone',
      'share files online',
      'transfer files no registration',
      'send files between computers',
      'free file transfer',
      'online file sharing',
    ],
    og: {
      title:       'Send Files Online Free — No Signup, No Cloud',
      description: 'Transfer files of any size directly between devices using P2P. Nothing uploaded to servers.',
      image:       '/og-home.png',   // ← add a 1200×630 preview image
    },
  },

  // ── Receive page (/receive) ────────────────────────
  receive: {
    title:       'Receive Files Online — Enter 6-Digit Code | FileShare',
    description: 'Enter the 6-digit code or scan QR to receive files instantly. No account needed. Files transfer directly from the sender\'s device.',
    keywords:    [
      'receive files online',
      'download shared files',
      'receive file transfer',
      'file receive code',
      'accept file transfer online',
      'p2p file receive',
      'get files from another device',
      'receive large files free',
    ],
    og: {
      title:       'Receive Files Online — Enter Code to Download',
      description: 'Enter the 6-digit code shared by sender to receive files instantly.',
      image:       '/og-receive.png',
    },
  },

  // ── Pricing page (/pricing) ────────────────────────
  pricing: {
    title:       'FileShare Pricing — Free & Premium Plans | File Transfer',
    description: 'FileShare is free forever for P2P transfers up to 4GB. Upgrade to Premium for unlimited file size, no ads, and transfer history.',
    keywords:    [
      'file transfer pricing',
      'free file sharing app',
      'unlimited file transfer',
      'premium file sharing',
      'file transfer subscription',
      'send anywhere alternative',
      'wetransfer alternative free',
      'large file transfer service',
    ],
    og: {
      title:       'FileShare Pricing — Free Forever, Premium for Power Users',
      description: 'Start free. Upgrade for unlimited file size, no ads, and priority servers.',
      image:       '/og-pricing.png',
    },
  },
}
