#!/bin/bash
# Render-compatible start script for the Hono + Bun server.
# The build step installs Bun, but its PATH is lost between build and start.
# This script re-installs Bun if it's missing, then runs the server.

set -e

BUN_BIN="$HOME/.bun/bin/bun"

if [ ! -f "$BUN_BIN" ]; then
  echo "[start] Bun not found — installing..."
  curl -fsSL https://bun.sh/install | bash
fi

echo "[start] Using Bun: $($BUN_BIN --version)"
exec "$BUN_BIN" server/index.ts
