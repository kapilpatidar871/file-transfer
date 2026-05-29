import { useRef, useState, useCallback } from 'react'
import SimplePeer from 'simple-peer'

const CHUNK_SIZE   = 256 * 1024   // 256 KB per chunk — good balance of speed & stability
const MAX_BUFFER   = 4 * 1024 * 1024  // pause sending when DataChannel buffer > 4 MB
const LOW_BUFFER   = 1 * 1024 * 1024  // resume when buffer drains below 1 MB
// Auto-detect ws:// (dev) vs wss:// (production HTTPS)
const WS_BASE = import.meta.env.VITE_WS_URL ||
  `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`

// Wait for DataChannel buffer to drain — prevents crashes on large files
function waitForDrain(channel) {
  return new Promise((resolve) => {
    if (channel.bufferedAmount <= LOW_BUFFER) { resolve(); return }
    channel.bufferedAmountLowThreshold = LOW_BUFFER
    channel.onbufferedamountlow = () => {
      channel.onbufferedamountlow = null
      resolve()
    }
  })
}

// Metadata header sent before each file's chunks
const buildHeader = (file) =>
  JSON.stringify({ type: 'file_header', name: file.name, size: file.size, mime: file.type })

export function useSender() {
  const [status, setStatus] = useState('idle')   // idle|waiting|connected|sending|done|error
  const [code, setCode] = useState(null)
  const [transfers, setTransfers] = useState([])
  const peerRef = useRef(null)
  const wsRef = useRef(null)

  const start = useCallback(async (files) => {
    setStatus('creating')

    // 1. Create room on server
    const res = await fetch('/api/room/create', { method: 'POST' })
    const { code: roomCode } = await res.json()
    setCode(roomCode)

    // 2. Open signaling WebSocket as sender
    const ws = new WebSocket(`${WS_BASE}/ws/${roomCode}/sender`)
    wsRef.current = ws

    ws.onmessage = async (e) => {
      const msg = JSON.parse(e.data)

      if (msg.type === 'peer_joined') {
        setStatus('connecting')
        // 3. Create WebRTC peer (initiator)
        const peer = new SimplePeer({ initiator: true, trickle: true })
        peerRef.current = peer

        peer.on('signal', (data) => ws.send(JSON.stringify({ type: 'offer', data })))

        peer.on('connect', () => {
          setStatus('sending')
          sendFiles(peer, files)
        })

        peer.on('error', (err) => {
          console.error('Peer error', err)
          setStatus('error')
        })
      }

      if (msg.type === 'answer') {
        peerRef.current?.signal(msg.data)
      }

      if (msg.type === 'ice') {
        peerRef.current?.signal(msg.data)
      }

      if (msg.type === 'peer_left') {
        setStatus('error')
      }
    }

    ws.onopen = () => setStatus('waiting')
    ws.onerror = () => setStatus('error')
  }, [])

  const sendFiles = async (peer, files) => {
    const channel = peer._channel  // raw RTCDataChannel for buffer checks
    const progress = files.map(f => ({
      name: f.name, total: f.size, transferred: 0, pct: 0, speed: 0, done: false
    }))
    setTransfers([...progress])

    for (let fi = 0; fi < files.length; fi++) {
      const file = files[fi]
      peer.send(buildHeader(file))

      let offset   = 0
      let lastTime = Date.now()
      let lastBytes = 0

      while (offset < file.size) {
        // ── Back-pressure: pause if DataChannel buffer is too full ──
        if (channel && channel.bufferedAmount > MAX_BUFFER) {
          await waitForDrain(channel)
        }

        const chunk = file.slice(offset, offset + CHUNK_SIZE)
        const buf   = await chunk.arrayBuffer()
        peer.send(buf)
        offset += buf.byteLength

        // ── Speed calculation (update every 500ms) ──
        const now     = Date.now()
        const elapsed = (now - lastTime) / 1000
        const speed   = elapsed > 0.5 ? (offset - lastBytes) / elapsed : progress[fi].speed
        if (elapsed > 0.5) { lastTime = now; lastBytes = offset }

        progress[fi] = {
          ...progress[fi],
          transferred: offset,
          pct: Math.min(99, Math.round((offset / file.size) * 100)),
          speed,
        }
        setTransfers([...progress])
      }

      // End-of-file sentinel
      peer.send(JSON.stringify({ type: 'file_done', name: file.name }))
      progress[fi] = { ...progress[fi], pct: 100, speed: 0, done: true }
      setTransfers([...progress])
    }

    peer.send(JSON.stringify({ type: 'all_done' }))
    setStatus('done')
  }

  const cancel = useCallback(() => {
    wsRef.current?.send(JSON.stringify({ type: 'cancel' }))
    peerRef.current?.destroy()
    wsRef.current?.close()
    setStatus('idle')
    setCode(null)
    setTransfers([])
  }, [])

  return { status, code, transfers, start, cancel }
}


export function useReceiver() {
  const [status, setStatus] = useState('idle')   // idle|connecting|receiving|done|error
  const [transfers, setTransfers] = useState([])
  const [receivedFiles, setReceivedFiles] = useState([])
  const peerRef = useRef(null)
  const wsRef = useRef(null)
  const bufferRef = useRef({ name: '', size: 0, mime: '', chunks: [], received: 0 })

  const join = useCallback((code) => {
    setStatus('connecting')

    const ws = new WebSocket(`${WS_BASE}/ws/${code}/receiver`)
    wsRef.current = ws

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data)

      if (msg.type === 'offer') {
        const peer = new SimplePeer({ initiator: false, trickle: true })
        peerRef.current = peer

        peer.signal(msg.data)

        peer.on('signal', (data) => ws.send(JSON.stringify({ type: 'answer', data })))

        peer.on('connect', () => setStatus('receiving'))

        peer.on('data', (data) => handleData(data))

        peer.on('error', () => setStatus('error'))
      }

      if (msg.type === 'ice') {
        peerRef.current?.signal(msg.data)
      }

      if (msg.type === 'peer_left') {
        setStatus('error')
      }
    }

    ws.onerror = () => setStatus('error')
  }, [])

  const handleData = (data) => {
    // Try to parse as JSON control message
    let msg = null
    try {
      const text = typeof data === 'string' ? data : new TextDecoder().decode(data)
      msg = JSON.parse(text)
    } catch (_) { /* binary chunk */ }

    if (msg?.type === 'file_header') {
      bufferRef.current = { name: msg.name, size: msg.size, mime: msg.mime, chunks: [], received: 0 }
      setTransfers(prev => {
        const exists = prev.find(t => t.name === msg.name)
        if (exists) return prev
        return [...prev, { name: msg.name, total: msg.size, transferred: 0, pct: 0, speed: 0, done: false }]
      })
      return
    }

    if (msg?.type === 'file_done') {
      const buf = bufferRef.current
      const blob = new Blob(buf.chunks, { type: buf.mime || 'application/octet-stream' })
      const url = URL.createObjectURL(blob)
      setReceivedFiles(prev => [...prev, { name: buf.name, size: buf.size, url }])
      setTransfers(prev => prev.map(t => t.name === buf.name ? { ...t, pct: 100, done: true } : t))
      bufferRef.current = { name: '', size: 0, mime: '', chunks: [], received: 0 }
      return
    }

    if (msg?.type === 'all_done') {
      setStatus('done')
      return
    }

    // Binary chunk — handle both ArrayBuffer and Buffer types
    const buf = bufferRef.current
    const chunkSize = data.byteLength ?? data.length ?? 0
    buf.chunks.push(data instanceof ArrayBuffer ? data : data.buffer ?? data)
    buf.received += chunkSize
    const pct = buf.size > 0 ? Math.min(99, Math.round((buf.received / buf.size) * 100)) : 0
    setTransfers(prev => prev.map(t =>
      t.name === buf.name ? { ...t, transferred: buf.received, pct } : t
    ))
  }

  return { status, transfers, receivedFiles, join }
}
