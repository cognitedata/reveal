#!/bin/sh

# when using this script locally, you need to get the private key (from last pass)
# and put it into this file in the root:
PRIVATE_KEY=$(cat react-demo-e2e-azure-dev.jwk-key.json)
docker run -e IDP_USER_ID=1 -e IDP_CLUSTER=azure-dev -e IDP_TOKEN_ID=demo-app-e2e -p 8200:8200 -e PORT=8200 -e PRIVATE_KEY="$PRIVATE_KEY" eu.gcr.io/cognitedata/fake-idp:latest
