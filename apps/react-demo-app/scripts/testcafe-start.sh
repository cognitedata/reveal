#!/bin/sh

##
## This script:
## - starts the fake IDP
## - runs the testcafe server (from src)
##
## Useful for:
## - developing your tests locally
##

../../node_modules/.bin/kill-port --port 11111

echo ' '
echo '-> Starting FakeIdP service'

IDP_PID=$!
./scripts/startIdP.sh &

SERVE_PID=$!

function cleanup {
  echo ' '
  echo '-> Stopping services'
  echo ' '
  kill $IDP_PID
  kill $SERVE_PID
}

trap cleanup EXIT

echo ' '
echo '-> Starting testcafe server (from src)'
echo ' '

PORT=11111 yarn start
EXIT_CODE=$?

exit $EXIT_CODE
