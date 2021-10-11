#!/bin/bash

##
## This script:
## - starts the fake IDP
## - runs the testcafe server (from src)
##
## Useful for:
## - developing your tests locally
##

USER_ID=$(git config user.email) # ok since this is local only

../../node_modules/.bin/kill-port --port 3000

echo ' '
echo '-> Starting FakeIdP service'

IDP_PID=$!
./scripts/startIdP.sh &

SERVE_PID=$!

echo ' '
echo '-> Starting testcafe server (from src)'
echo ' '

function cleanup {
  echo ' '
  echo '-> Stopping services'
  echo ' '
  kill $IDP_PID
  kill $SERVE_PID
}

trap cleanup EXIT

echo '-------------'
echo "Current user: $USER_ID" 
echo '-------------'
PORT=3000 REACT_APP_USER_ID=$USER_ID yarn start
EXIT_CODE=$?

exit $EXIT_CODE
