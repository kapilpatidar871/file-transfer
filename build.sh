#!/usr/bin/env bash
set -e

echo "==> Installing & building React frontend..."
cd frontend
npm install
npm run build
cd ..

echo "==> Installing PHP backend dependencies..."
cd backend
composer install --no-dev --optimize-autoloader
cd ..

echo "==> Build complete."
