/**
 * FileShare — Local Server (Node.js)
 * Run: node local-server.js
 * Works on same WiFi AND different cities (internet)
 */

const http      = require('http')
const express   = require('express')
const WebSocket = require('ws')
const path      = require('path')
const os        = require('os')

const PORT   = process.env.PORT || 3000
const DIST   = path.join(__dirname, 'frontend', 'dist')
const TTL_MS = 10 * 60 * 1000  // 10 minutes

// ── Local IP ───────────────────────────────────────────────────
function getLocalIP() {
  for (const ifaces of Object.values(os.networkInterfaces()))
    for (const iface of ifaces)
      if (iface.family === 'IPv4' && !iface.internal) return iface.address
  return 'localhost'
}

// ── Room manager ───────────────────────────────────────────────
const rooms = new Map()

function createRoom() {
  let code
  do { code = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0') }
  while (rooms.has(code))
  rooms.set(code, { sender: null, receiver: null, at: Date.now() })
  return code
}

setInterval(() => {
  const now = Date.now()
  for (const [c, r] of rooms) if (now - r.at > TTL_MS) rooms.delete(c)
}, 60_000)

// ── Express ────────────────────────────────────────────────────
const app = express()
app.use(express.json())
app.use(express.static(DIST))

app.post('/api/room/create', (_req, res) => res.json({ code: createRoom() }))

app.get('/api/room/:code/status', (req, res) => {
  const r = rooms.get(req.params.code)
  if (!r) return res.status(404).json({ exists: false })
  res.json({ exists: true, has_sender: !!r.sender, has_receiver: !!r.receiver })
})

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// SPA fallback
app.get('*', (_req, res) => res.sendFile(path.join(DIST, 'index.html')))

const server = http.createServer(app)

// ── WebSocket signaling ────────────────────────────────────────
const wss = new WebSocket.Server({ noServer: true })

server.on('upgrade', (req, socket, head) => {
  if (req.url.startsWith('/ws/'))
    wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req))
  else socket.destroy()
})

function send(ws, data) {
  if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data))
}

wss.on('connection', (ws, req) => {
  const [, , code, role] = req.url.split('/')

  if (!code || !['sender', 'receiver'].includes(role)) {
    send(ws, { type: 'error', message: 'Invalid URL' })
    return ws.close()
  }

  const room = rooms.get(code)
  if (!room) {
    send(ws, { type: 'error', message: 'Room not found' })
    return ws.close()
  }

  if (role === 'sender') {
    if (room.sender) { send(ws, { type: 'error', message: 'Sender taken' }); return ws.close() }
    room.sender = ws
  } else {
    if (room.receiver) { send(ws, { type: 'error', message: 'Receiver taken' }); return ws.close() }
    room.receiver = ws
    send(room.sender, { type: 'peer_joined' })
  }

  console.log(`  [+] ${role} joined room ${code}`)

  ws.on('message', raw => {
    let msg
    try { msg = JSON.parse(raw) } catch { return }
    const peer = role === 'sender' ? room.receiver : room.sender
    if (['offer', 'answer', 'ice', 'ready'].includes(msg.type)) send(peer, msg)
    else if (msg.type === 'cancel') { send(peer, { type: 'cancelled' }); rooms.delete(code) }
  })

  ws.on('close', () => {
    const peer = role === 'sender' ? room.receiver : room.sender
    try { send(peer, { type: 'peer_left' }) } catch {}
    if (role === 'sender') room.sender = null; else room.receiver = null
    if (!room.sender && !room.receiver) rooms.delete(code)
    console.log(`  [-] ${role} left room ${code}`)
  })

  ws.on('error', () => ws.close())
})

// ── Start ──────────────────────────────────────────────────────
server.listen(PORT, '0.0.0.0', () => {
  const ip  = getLocalIP()
  const lan = `http://${ip}:${PORT}`
  const loc = `http://localhost:${PORT}`

  console.log(`
╔═══════════════════════════════════════════╗
║        FileShare — Local Server           ║
╠═══════════════════════════════════════════╣
║                                           ║
║  Local:   ${loc.padEnd(33)}║
║  Network: ${lan.padEnd(33)}║
║                                           ║
║  Share Network URL with devices on WiFi   ║
╚═══════════════════════════════════════════╝
`)
})
