#!/bin/bash

# Note: Insert values for these tokens, like so:
#  export FOO="${FOO:-[some-default-value-here]}"
# The leading - is important!!

export REACT_APP_MIXPANEL_TOKEN="${REACT_APP_MIXPANEL_TOKEN:-}"
export REACT_APP_MIXPANEL_DEBUG="${REACT_APP_MIXPANEL_DEBUG:-false}"
export HTTPS=${HTTPS:-true}

react-scripts start
