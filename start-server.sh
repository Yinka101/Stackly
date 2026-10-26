#!/bin/bash
set -e

# Re-establish Bun on PATH (lost between Render build and start phases)
export PATH="$HOME/.bun/bin:$PATH"

# Verify Bun is present
if ! command -v bun &>/dev/null; then
  echo "[start] Bun not found — installing now..."
  curl -fsSL https://bun.sh/install | bash
  export PATH="$HOME/.bun/bin:$PATH"
fi

echo "[start] Bun: $(bun --version)"
echo "[start] Node: $(node --version 2>/dev/null || echo n/a)"
echo "[start] PORT: ${PORT}"
echo "[start] DATABASE_URL: ${DATABASE_URL:-./stackly.db}"

export DATABASE_URL="${DATABASE_URL:-/opt/render/project/src/stackly.db}"

exec bun server/index.ts
