#!/bin/sh

##
## This script:
## - runs the testcafe tests
##
##
## Useful for:
## - running the testcafe tests in jenkins
##

SERVE_PORT=11111

echo "Runner using port: $SERVE_PORT"

BASE_URL=http://localhost:$SERVE_PORT \
  ../../node_modules/.bin/testcafe \
    "chromium:headless '--window-size=1500,1040'" \
    testcafe/desktop \
    --stop-on-first-fail \
    --screenshots-on-fails \
    --screenshots testcafe/screenshots \
    --video testcafe/videos \
    --video-options failedOnly=true \
