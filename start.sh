#!/usr/bin/env sh
set -e

cd Tech-Chat-Bot

if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

npm run build >/dev/null 2>&1 || true
npm start