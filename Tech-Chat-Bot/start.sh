#!/usr/bin/env sh
set -e

cd Tech-Chat-Bot

# Install deps
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

# Build if exists (won't fail if missing)
npm run build >/dev/null 2>&1 || true

# Start
npm start
