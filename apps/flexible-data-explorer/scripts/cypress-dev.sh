#!/bin/bash

# read client secret for login
client_id="$(cat "./private-keys/client-id.json" | xargs)"
client_secret="$(cat "./private-keys/client-secret.json" | xargs)"

# start cypress
cd ../../
nx serve fusion-shell &
pid_fusion_shell=$!
nx e2e flexible-data-explorer --watch --browser chrome --env.CLIENT_ID="$client_id" --env.CLIENT_SECRET="$client_secret" &
pid_cypress=$!
wait
kill -9 $pid_fusion_shell $pid_cypress

