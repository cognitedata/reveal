#!/usr/bin/env bash

# We are not sure whether $TEST_UNDECLARED_OUTPUTS_DIR is always relatively
# hence we are checking and applying `pwd` if it is
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

exec "${@:2}" --video="$(abspath "$TEST_UNDECLARED_OUTPUTS_DIR/test.outputs/$APP_NAME/video")" -s path="$(abspath "$TEST_UNDECLARED_OUTPUTS_DIR/test.outputs/$APP_NAME/screenshots")",takeOnFails=true
