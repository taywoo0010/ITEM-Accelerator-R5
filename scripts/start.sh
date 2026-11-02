#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
PORT="${1:-8080}"

if ! [[ "${PORT}" =~ ^[0-9]+$ ]] || (( PORT < 1 || PORT > 65535 )); then
  printf 'Invalid port: %s\n' "${PORT}" >&2
  exit 1
fi

cd "${PROJECT_ROOT}"
printf 'Serving ITEM Accelerator R5 at http://localhost:%s/\n' "${PORT}"
exec python3 -m http.server "${PORT}" --bind 127.0.0.1
