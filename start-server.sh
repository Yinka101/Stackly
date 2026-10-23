#!/usr/bin/env bash
# Render start script — installs Bun if missing, then runs the server.
# Committed to repo so the Start Command can just be: bash start-server.sh

set -e

# Install Bun if not already on PATH
if ! command -v bun &> /dev/null; then
  echo "[start] Bun not found, installing..."
  curl -fsSL https://bun.sh/install | bash
  export PATH="$HOME/.bun/bin:$PATH"
else
  echo "[start] Bun found at $(command -v bun)"
fi

export PATH="$HOME/.bun/bin:$PATH"

echo "[start] Bun version: $(bun --version)"
echo "[start] Starting server..."
exec bun server/index.ts
