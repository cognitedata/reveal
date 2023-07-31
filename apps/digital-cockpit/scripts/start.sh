#!/bin/bash

# Note: Insert values for these tokens, like so:
#  export FOO="${FOO:-[some-default-value-here]}"
# The leading - is important!!
export REACT_APP_MIXPANEL_DEBUG="${REACT_APP_MIXPANEL_DEBUG:-false}"
export HTTPS=${HTTPS:-true}

# Uncomment to use local `digital-cockpit-api` service (for local development, do not commit this change)
# export REACT_APP_DC_API_URL="${REACT_APP_DC_API_URL:-http://localhost:8001}"

../../node_modules/.bin/vite start
