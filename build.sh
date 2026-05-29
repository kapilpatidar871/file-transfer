#!/usr/bin/env bash
set -e

echo "==> Installing & building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "==> Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "==> Build complete."
