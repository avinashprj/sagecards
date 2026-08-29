#!/usr/bin/env bash
# Security audit for CI/CD — fails if high/critical vulnerabilities are found.
#
# bun 1.3.x has no structured JSON severity output, so this parses the human
# summary and FAILS CLOSED: any output that isn't a clean "no vulnerabilities"
# and contains high/critical markers trips the gate.
set -euo pipefail

echo "▶ Running dependency security audit (bun audit --production)..."
output="$(bun audit --production 2>&1)"
status=$?

if echo "$output" | grep -qi "no vulnerabilities found"; then
  echo "✓ No vulnerabilities found"
  exit 0
fi

echo "$output"

if [ "$status" -ne 0 ]; then
  echo "✖ bun audit exited non-zero ($status) — failing closed."
  exit 1
fi

# bun exits 0 even when vulnerabilities exist; detect the summary markers.
if echo "$output" | grep -qiE "critical|vulnerabil"; then
  echo "✖ Security audit failed: vulnerabilities present."
  exit 1
fi

echo "✓ No high/critical vulnerabilities"
exit 0