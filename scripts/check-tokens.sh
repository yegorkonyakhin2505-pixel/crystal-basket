#!/usr/bin/env bash
# Rule 3 gate: components use cb-* tokens, never raw hex, and the site is light-only.
# Allowed: inline styles fed by catalog palettes (variables, not literals) and generated logo paths.
set -euo pipefail
cd "$(dirname "$0")/.."
bad=$(grep -rnE '#[0-9a-fA-F]{6}\b|\bdark:' apps/web/src --include='*.tsx' --include='*.ts' \
  | grep -v 'logo-badge-paths.ts' | grep -v 'layout.tsx.*themeColor' || true)
if [ -n "$bad" ]; then
  echo "Raw colours or dark-mode variants found in components:"; echo "$bad"; exit 1
fi
echo "✓ tokens only"
