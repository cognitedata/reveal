#!/bin/bash

##
## This script:
## - starts the fake IDP
## - runs the testcafe server (from the build)
##
## Useful for:
## - testing the local build
##

SERVE_PORT=11111

../../node_modules/.bin/kill-port --port $SERVE_PORT

echo ' '
echo '-> Starting FakeIdP service'

./scripts/startIdP.sh &
IDP_PID=$!
echo $IDP_PID

function cleanup {
  echo ' '
  echo '-> Stopping services'
  echo ' '
  kill $IDP_PID
}

trap cleanup EXIT

echo ' '
echo '-> Starting testcafe server (from build)'
echo ' '

serve -s build -l $SERVE_PORT
