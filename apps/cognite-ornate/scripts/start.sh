#!/bin/bash

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
