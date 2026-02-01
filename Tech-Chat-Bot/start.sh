#!/usr/bin/env sh
set -e

cd Tech-Chat-Bot

# install
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

# build + run
npm run build
npm start
