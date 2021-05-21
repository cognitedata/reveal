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

../../node_modules/.bin/kill-port --port $SERVE_PORT

echo ' '
echo '-> Starting testcafe server (from build) and running tests'
echo ' '

# other useful testcafe options:
# --concurrency 3 \

BASE_URL=http://localhost:$SERVE_PORT \
  ../../node_modules/.bin/testcafe \
    "chromium:headless '--window-size=1500,1040'" \
    testcafe/desktop \
    --stop-on-first-fail \
    --screenshots-on-fails \
    --screenshots testcafe/screenshots \
    --video testcafe/videos \
    --video-options failedOnly=true \
    --app "npx serve -s build -l $SERVE_PORT"
