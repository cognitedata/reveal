#!/bin/bash

# Note: Insert values for these tokens, like so:
#  export FOO="${FOO:-[some-default-value-here]}"
# The leading - is important.

export SKIP_PREFLIGHT_CHECK="true"
export DISABLE_ESLINT_PLUGIN="true"
export REACT_APP_LANGUAGE="${REACT_APP_LANGUAGE:-en}"
export REACT_APP_MIXPANEL_TOKEN="${REACT_APP_MIXPANEL_TOKEN:-}"
export REACT_APP_MIXPANEL_DEBUG="${REACT_APP_MIXPANEL_DEBUG:-false}"
export HTTPS=${HTTPS:-true}

../../node_modules/.bin/kill-port --port 3000

echo ' '
echo '-> Starting FakeIdP service'
./scripts/start-fake-idp.sh &
IDP_PID=$!

function cleanup {
  echo ' '
  echo '-> Stopping FAKE IDP services'
  echo ' '
  kill $IDP_PID
}

trap cleanup EXIT

bazel run :start

EXIT_CODE=$?

exit $EXIT_CODE
