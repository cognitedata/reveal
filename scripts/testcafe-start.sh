#!/bin/sh

SERVE_PID=$!

PORT=11111 \
  HTTPS=false \
  yarn start;
EXIT_CODE=$?

kill $SERVE_PID
exit $EXIT_CODE
