#!/bin/sh

yarn kill-port --port 11111

SERVE_PID=$!

REACT_APP_E2E_MOCK=true \
  PORT=11111 \
  HTTPS=false \
  yarn start;
EXIT_CODE=$?

kill $SERVE_PID
exit $EXIT_CODE
