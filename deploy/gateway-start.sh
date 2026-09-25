#!/bin/sh
set -eu
# No shell tracing: the token must not enter container logs.
LEARNSPRINT_PROXY_TOKEN=$(cat /run/secrets/proxy-token)
export LEARNSPRINT_PROXY_TOKEN
case "$LEARNSPRINT_PROXY_TOKEN" in
  *[!a-f0-9]*|'') exit 1 ;;
esac
[ "${#LEARNSPRINT_PROXY_TOKEN}" -eq 64 ]
exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
