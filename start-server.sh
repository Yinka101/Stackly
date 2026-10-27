#!/bin/bash
# Fallback start script — render.yaml startCommand uses absolute $HOME/.bun/bin/bun directly.
# This script is kept for manual use only.
set -e
export PATH="$HOME/.bun/bin:$PATH"
if ! command -v bun &>/dev/null; then
  curl -fsSL https://bun.sh/install | bash
  export PATH="$HOME/.bun/bin:$PATH"
fi
echo "[start] bun $(bun --version) at $(which bun)"
echo "[start] PORT=${PORT} DB=${DATABASE_URL:-./stackly.db}"
export DATABASE_URL="${DATABASE_URL:-/opt/render/project/src/stackly.db}"
exec bun server/index.ts
