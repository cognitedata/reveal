#!/bin/bash

# read client secret for login
client_id="$(cat "./private-keys/data-explorer-client-id.json" | xargs)"
client_secret="$(cat "./private-keys/data-explorer-client-secret.json" | xargs)"

# check if dev server is running, if not start
if lsof -Pi :3010 -sTCP:LISTEN -t >/dev/null ; then
    echo "Dev server already running"
else
    echo "Starting dev server on port 3010"
    yarn start &
    pid_start=$!
fi
# start cypress
cd ../../
nx run fusion-shell:preview:production &
pid_fusion_shell=$!
nx e2e data-exploration-e2e --watch --browser chrome --env.DATA_EXPLORER_CLIENT_ID="$client_id" --env.DATA_EXPLORER_CLIENT_SECRET="$client_secret" --env.OVERRIDE_URL=https://localhost:3010/index.js &
pid_cypress=$!
wait
kill -9 $pid_start $pid_fusion_shell $pid_cypress

