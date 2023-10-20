#!/bin/bash

# read client id and client secret for login
client_id="$(cat "./private-keys/client-id.json" | xargs)"
client_secret="$(cat "./private-keys/client-secret.json" | xargs)"

cd ../../

# check if fusion-shell dev server is running, if not start
if lsof -Pi :4200 -sTCP:LISTEN -t >/dev/null ; then
  echo "fusion-shell dev server already running"
else
  echo "Starting fusion-shell dev server"
  nx serve fusion-shell &
  pid_fusion_shell=$!
fi

# start cypress
echo "Starting Cypress on development environment"
CLIENT_ID="$client_id" CLIENT_SECRET="$client_secret" nx run flexible-data-explorer:e2e:development &
pid_cypress=$!

wait

kill -9 $pid_fusion_shell $pid_cypress

