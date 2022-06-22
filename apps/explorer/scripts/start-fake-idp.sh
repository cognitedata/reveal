#!/bin/bash


# When using this script locally, you need to get the private key(s) (from last pass)
# and put it into a .json file in the private-keys directory
# the filename should be {project-name}.jwk-key.json

# Check if we have and existing container
COUNT=$(docker ps -a | grep "fakeIdp" | wc -l)
if (($COUNT > 0)); then
    echo "Removing existing container..."
    docker rm -f fakeIdp
fi

echo "Starting fake IDP ..."

# Run the final command
docker pull eu.gcr.io/cognitedata/fake-idp:latest
docker run -v $(pwd)/private-keys:/private-keys --name fakeIdp -p 8200:8200 -e PORT=8200 eu.gcr.io/cognitedata/fake-idp:latest
