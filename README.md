# FileShare — P2P File Transfer App

Send files of any size, directly between devices. No uploads. No cloud. No account needed.

## Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Python + FastAPI + WebSockets (signaling)
- **P2P:** WebRTC via simple-peer
- **Features:** 6-digit code · QR code · Shareable link · Progress bar

## Local Development

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
# Proxies /api and /ws to backend automatically
```

## Production Deployment (MilesWeb VPS SM-L1)

```bash
# 1. Upload project
scp -r /Users/shoptrade/file-transfer user@YOUR_VPS_IP:/var/www/file-transfer

# 2. SSH in
ssh user@YOUR_VPS_IP

# 3. Build frontend
cd /var/www/file-transfer/frontend
npm install
npm run build   # outputs to dist/

# 4. Setup backend
cd /var/www/file-transfer/backend
python3 -m venv venv
venv/bin/pip install -r requirements.txt

# 5. Install & configure Nginx
sudo apt install nginx certbot python3-certbot-nginx
sudo cp /var/www/file-transfer/nginx.conf /etc/nginx/sites-available/file-transfer
# Edit: replace yourdomain.com with your actual domain
sudo ln -s /etc/nginx/sites-available/file-transfer /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 6. SSL certificate
sudo certbot --nginx -d yourdomain.com

# 7. Register systemd service
sudo cp /var/www/file-transfer/file-transfer.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable file-transfer
sudo systemctl start file-transfer

# 8. Check status
sudo systemctl status file-transfer
```

## How It Works

```
1. Sender selects files → clicks Send
2. Backend creates a room → returns 6-digit code
3. Sender WebSocket connects as 'sender'
4. Receiver enters code → WebSocket connects as 'receiver'
5. Backend notifies sender: peer_joined
6. WebRTC handshake (offer → answer → ICE via server)
7. P2P DataChannel established — files transfer directly
8. Server never sees file data
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_WS_URL` | auto-detected | WebSocket server URL for production |
