#!/bin/sh

##
## This script:
## - runs the testcafe server
## - runs the testcafe test runner
##
## Useful for:
## - e2e from jenkins using manual docker start
##

SERVE_PORT=11111

echo "Server using port: $SERVE_PORT"

../../node_modules/.bin/kill-port --port $SERVE_PORT

echo ' '
echo '-> Starting FakeIdP service'

./scripts/startIdP.sh &
IDP_PID=$!
echo $IDP_PID

echo ' '
echo '-> Starting testcafe server (from build) and running tests'
echo ' '

BASE_URL=http://localhost:$SERVE_PORT \
  ../../node_modules/.bin/testcafe \
    "chromium:headless '--window-size=1500,1040'" \
    testcafe/desktop \
    --stop-on-first-fail \
    --app "npx serve -s build -l $SERVE_PORT"
