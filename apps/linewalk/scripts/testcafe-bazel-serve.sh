#!/bin/sh

##
## This script:
## - runs the testcafe server
## - runs the testcafe test runner
##
## Useful for:
## - e2e from jenkins
##

SERVE_PORT=11111

# Temporary fix to use installed modules instead of installing them each run with npx
KILL_PORT="$TEST_SRCDIR/npm/node_modules/kill-port/index.js"
SERVE="$TEST_SRCDIR/npm/node_modules/serve/bin/serve.js"

echo "Server using port: $SERVE_PORT"

$KILL_PORT --port $SERVE_PORT

echo ' '
echo '-> Starting testcafe server (from build)'
echo ' '

$SERVE -s build_bazel -l $SERVE_PORT
