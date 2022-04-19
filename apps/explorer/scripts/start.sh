#!/bin/bash

# Note: Insert values for these tokens, like so:
#  export FOO="${FOO:-[some-default-value-here]}"
# The leading - is important.

export SKIP_PREFLIGHT_CHECK="true"
export DISABLE_ESLINT_PLUGIN="true"
export REACT_APP_I18N_PSEUDO="${REACT_APP_I18N_PSEUDO:-false}"
export REACT_APP_I18N_DEBUG="${REACT_APP_I18N_DEBUG:-true}"
export REACT_APP_LANGUAGE="${REACT_APP_LANGUAGE:-en}"
export REACT_APP_LOCIZE_PROJECT_ID="${REACT_APP_LOCIZE_PROJECT_ID:-}"
export REACT_APP_LOCIZE_API_KEY="${REACT_APP_LOCIZE_API_KEY:-}"
export REACT_APP_LOCIZE_VERSION="latest"
export REACT_APP_MIXPANEL_TOKEN="${REACT_APP_MIXPANEL_TOKEN:-}"
export REACT_APP_MIXPANEL_DEBUG="${REACT_APP_MIXPANEL_DEBUG:-false}"
export HTTPS=${HTTPS:-true}

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

ibazel run :start --max-old-space-size=4096

EXIT_CODE=$?

exit $EXIT_CODE
