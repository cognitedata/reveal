#!/bin/sh

##
## This script:
## - runs the testcafe server
## - runs the testcafe test runner
##
## Useful for:
## - e2e from jenkins
##

E2E_PORT=$((10000 + $RANDOM % 100000))
HTTP_PATH=http://localhost:$E2E_PORT

../../node_modules/.bin/kill-port --port $E2E_PORT

mkdir -p testcafe/logs/

echo ' '
echo '-> Starting testcafe server (from build) and running tests'
echo ' '

# other useful testcafe options:
# --concurrency 3 \

REACT_APP_USER_ID=$USER_ID \
BASE_URL=$HTTP_PATH \
  ../../node_modules/.bin/testcafe \
    "chromium:headless '--use-gl=swiftshader --disable-software-rasterizer --window-size=1500,1040'" \
    testcafe/* \
    --stop-on-first-fail \
    --screenshots-on-fails \
    --screenshots testcafe/screenshots \
    --video testcafe/videos \
    --video-options failedOnly=true \
    --app "npx serve -s build -l tcp://localhost:$E2E_PORT 2>&1 | tee testcafe/logs/serve.log"
