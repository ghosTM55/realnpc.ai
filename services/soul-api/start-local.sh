#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."

if [[ "$(node -p 'process.versions.node.split(".")[0]')" != "24" ]]; then
  echo 'Use Node 24, then run npm run demo:api again.' >&2
  exit 1
fi
local_keys_file=services/soul-api/.env.local
if [[ -e "$local_keys_file" || -L "$local_keys_file" ]]; then
  if [[ ! -f "$local_keys_file" || -L "$local_keys_file" ]]; then
    echo 'The local key path must be a regular file, not a symbolic link.' >&2
    exit 1
  fi
  chmod 600 "$local_keys_file"
else
  echo 'Enter temporary local keys once. They will be saved in services/soul-api/.env.local.'
  if [[ -z "${DEEPSEEK_API_KEY:-}" ]]; then
    read -r -s -p 'DeepSeek key (Mia; Enter to skip): ' DEEPSEEK_API_KEY
    printf '\n'
  fi
  if [[ -z "${OPENROUTER_API_KEY:-}" ]]; then
    read -r -s -p 'OpenRouter key (Chloe / Raymond; Enter to skip): ' OPENROUTER_API_KEY
    printf '\n'
  fi
  if [[ -z "$DEEPSEEK_API_KEY" && -z "$OPENROUTER_API_KEY" ]]; then
    echo 'No keys entered. Nothing saved or started.' >&2
    exit 1
  fi
  for local_key in "$DEEPSEEK_API_KEY" "$OPENROUTER_API_KEY"; do
    if [[ -n "$local_key" && ! "$local_key" =~ ^[a-zA-Z0-9._-]+$ ]]; then
      echo 'A key contains unexpected characters. Paste only the API key, without quotes or spaces.' >&2
      exit 1
    fi
  done
  # Never execute key-file contents as shell code or overwrite an existing file.
  (umask 077; set -o noclobber; printf 'DEEPSEEK_API_KEY=%s\nOPENROUTER_API_KEY=%s\n' "$DEEPSEEK_API_KEY" "$OPENROUTER_API_KEY" > "$local_keys_file")
fi
export HOST=127.0.0.1 PORT=8787
export ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
export CHAT_ENABLED=true
export DAILY_REQUEST_LIMIT=50
export DEEPSEEK_MODEL=deepseek-flash
export OPENROUTER_MODEL=x-ai/grok-4.7
printf 'Mia: %s\nChloe / Raymond: %s\n' "$DEEPSEEK_MODEL" "$OPENROUTER_MODEL"
echo 'Using local keys from services/soul-api/.env.local (existing exported keys take precedence).'
exec node --env-file="$local_keys_file" services/soul-api/server.ts
