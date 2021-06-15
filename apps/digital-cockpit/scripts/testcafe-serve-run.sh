#!/bin/sh

yarn testcafe:serve &
SERVE_PID=$!

yarn testcafe:run
EXIT_CODE=$?

kill $SERVE_PID

exit $EXIT_CODE
