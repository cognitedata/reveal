#!/bin/bash

export REACT_APP_I18N_PSEUDO="${REACT_APP_I18N_PSEUDO:-false}"
export REACT_APP_I18N_DEBUG="${REACT_APP_I18N_DEBUG:-true}"
export REACT_APP_LANGUAGE="${REACT_APP_LANGUAGE:-en}"
export REACT_APP_LOCIZE_PROJECT_ID="${REACT_APP_LOCIZE_PROJECT_ID:-b0fef6b6-5821-4946-9acc-cb9c41568a75}"
export REACT_APP_LOCIZE_API_KEY="${REACT_APP_LOCIZE_API_KEY:-f1f6b763-2c20-4e12-a1c5-c33f1a71cec2}"
export REACT_APP_LOCIZE_VERSION="latest"
export HTTPS=${HTTPS:-true}
# Detect when console.error is used.
if [[ -z $REACT_APP_ENABLE_ERRORS ]]; then
  # Special values:
  #   break - trip the debugger on error
  #   flash - flash the screen red on error
  #   false - disable the feature (default)
  export REACT_APP_ENABLE_ERRORS='flash'
fi

##
## This script:
## - starts the fake IDP
## - runs the testcafe server (from src)
##
## Useful for:
## - developing your tests locally
##

../../node_modules/.bin/kill-port --port 3000

echo ' '
echo '-> Starting FakeIdP service'

IDP_PID=$!
./scripts/startIdP.sh &

SERVE_PID=$!

echo ' '
echo '-> Starting Discover'
echo ' '

function cleanup {
  echo ' '
  echo '-> Stopping services'
  echo ' '
  kill $IDP_PID
  kill $SERVE_PID
}

trap cleanup EXIT

USER_ID=$(git config user.email) # ok since this is local only
echo '-------------'
echo "Current user: $USER_ID"
echo '-------------'
REACT_APP_E2E_USER=$USER_ID bazel run :start
EXIT_CODE=$?

exit $EXIT_CODE
