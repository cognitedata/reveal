#!/bin/bash

# Note: Insert values for these tokens, like so:
#  export FOO="${FOO:-[some-default-value-here]}"
# The leading - is important.

# Put in a quick check to see if we're the demo app or not. If you forked this
# repo, then you can probably delete this whole function (and the if/else below)
# to clean up some code.
function is_demo_app() {
  git remote get-url origin | grep 'scarlet.git' >/dev/null 2>&1
  return $?
}

export SKIP_PREFLIGHT_CHECK="true"
export DISABLE_ESLINT_PLUGIN="true"
export REACT_APP_I18N_PSEUDO="${REACT_APP_I18N_PSEUDO:-false}"
export REACT_APP_I18N_DEBUG="${REACT_APP_I18N_DEBUG:-true}"
export REACT_APP_LANGUAGE="${REACT_APP_LANGUAGE:-en}"

if is_demo_app ; then
  export REACT_APP_LOCIZE_PROJECT_ID="${REACT_APP_LOCIZE_PROJECT_ID:-1ee63b21-27c7-44ad-891f-4bd9af378b72}"
  export REACT_APP_LOCIZE_API_KEY="${REACT_APP_LOCIZE_API_KEY:-7a10ae6b-49f3-4600-944d-009140ca6fc9}" # pragma: allowlist secret
else
  export REACT_APP_LOCIZE_PROJECT_ID="${REACT_APP_LOCIZE_PROJECT_ID:-}"
  export REACT_APP_LOCIZE_API_KEY="${REACT_APP_LOCIZE_API_KEY:-}"
fi
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

ibazel run :start

EXIT_CODE=$?

exit $EXIT_CODE
