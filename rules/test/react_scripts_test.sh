#!/usr/bin/env bash

# We are not sure whether $TEST_UNDECLARED_OUTPUTS_DIR is always relatively
# hense we are checking and applying `pwd` if it is
function abspath() {
  path=$1
  if [[ "${path:0:1}" == / ]]; then
    printf "%s" "$path"
  else
    printf "%s/%s" "$(pwd)" "$path"
  fi
}

set -e

APP_NAME=$1

# Directory to save the output for junit-jest
export JEST_JUNIT_OUTPUT_DIR="$(abspath "$TEST_UNDECLARED_OUTPUTS_DIR/test.outputs/$APP_NAME")"

# Directory to save coverage for jest
exec "${@:2}" --coverageDirectory="$(abspath "$TEST_UNDECLARED_OUTPUTS_DIR/test.outputs/$APP_NAME/coverage")"
