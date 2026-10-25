#!/bin/bash
# Render-compatible start script for Hono + Bun.
# Installs Bun if missing (PATH is lost between build and start on Render).

BUN_BIN="$HOME/.bun/bin/bun"

if [ ! -f "$BUN_BIN" ]; then
  echo "[start] Installing Bun..."
  curl -fsSL https://bun.sh/install | bash || true
fi

if [ ! -f "$BUN_BIN" ]; then
  echo "[start] Bun install failed, trying npm fallback..."
  npm install -g bun 2>/dev/null || true
  BUN_BIN=$(which bun 2>/dev/null || echo "$HOME/.bun/bin/bun")
fi

echo "[start] Bun path: $BUN_BIN"
"$BUN_BIN" --version

# Use absolute path for SQLite DB so it persists in the right location
export DATABASE_URL="${DATABASE_URL:-/opt/render/project/src/stackly.db}"

echo "[start] DB path: $DATABASE_URL"
exec "$BUN_BIN" server/index.ts
