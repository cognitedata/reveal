#!/bin/bash

# when using this script locally, you need to get the private key (from last pass)
# and put it into this file in the root:
PRIVATE_KEY=$(cat "./private-keys/$REACT_APP_PROJECT.jwk-key.json")

# Check if we have and existing container
COUNT=$(docker ps -a | grep "fakeIdp" | wc -l)
if (($COUNT > 0)); then
    echo "Removing existing container..."
    docker rm -f fakeIdp
fi

# Run the final command
docker pull eu.gcr.io/cognitedata/fake-idp:latest
docker run --name fakeIdp -e IDP_CLUSTER=$REACT_APP_CLUSTER -p 8200:8200 -e PORT=8200 -e PRIVATE_KEY="$PRIVATE_KEY" eu.gcr.io/cognitedata/fake-idp:latest
