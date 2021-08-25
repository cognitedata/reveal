#!/bin/sh

# Private key for the CDF project to run e2e against.
# When using this script locally, you need to get the private key (from last pass)
# and put it into the /private-keys folder:

docker pull eu.gcr.io/cognitedata/fake-idp:latest
docker run -e IDP_TOKEN_ID=demo-app-e2e -p 8200:8200 -e PORT=8200 -e PRIVATE_KEYS_PATH=/private-keys -v $(pwd)/private-keys:/private-keys eu.gcr.io/cognitedata/fake-idp:latest
