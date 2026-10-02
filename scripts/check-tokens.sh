#!/usr/bin/env bash
# Rule 3 gate: components use cb-* tokens, never raw hex, and the site is light-only.
# Allowed: inline styles fed by catalog palettes (variables, not literals), generated logo paths,
# the theme-color meta tag, and the token sheets themselves (tokens.css, apps/theme/src/styles/theme.css).
set -euo pipefail
cd "$(dirname "$0")/.."
bad=$(grep -rnE '#[0-9a-fA-F]{6}\b|\bdark:' apps/web/src --include='*.tsx' --include='*.ts' \
  | grep -v 'logo-badge-paths.ts' | grep -v 'layout.tsx.*themeColor' || true)
if [ -d apps/theme ]; then
  theme_bad=$(grep -rnE '#[0-9a-fA-F]{6}\b|\bdark:' apps/theme/src apps/theme/theme/layout apps/theme/theme/sections apps/theme/theme/snippets apps/theme/theme/templates apps/theme/theme/config \
    --include='*.tsx' --include='*.ts' --include='*.liquid' --include='*.json' \
    | grep -v 'logo-badge-paths.ts' | grep -v 'cb-logo-badge.liquid' | grep -v 'theme.liquid.*theme-color' | grep -v 'cb-schema' || true)
  bad="${bad}${theme_bad:+$'\n'$theme_bad}"
fi
if [ -n "${bad//[[:space:]]/}" ]; then
  echo "Raw colours or dark-mode variants found in components:"; echo "$bad"; exit 1
fi
echo "✓ tokens only"
