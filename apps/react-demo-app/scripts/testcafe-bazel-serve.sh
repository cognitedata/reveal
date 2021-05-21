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

echo "Server using port: $SERVE_PORT"

npx kill-port --port $SERVE_PORT

echo ' '
echo '-> Starting testcafe server (from build)'
echo ' '

npx serve -s build_bazel -l $SERVE_PORT
