#!/bin/bash

echo "Building for testcafe ..."

if [ -z "$COGNITE_API_KEY" ]; then
>&2 echo "Missing API key; set COGNITE_API_KEY and re-run"
exit 1
fi

REACT_APP_API_KEY=$COGNITE_API_KEY \
REACT_APP_E2E_MOCK=true \
    yarn build testcafe
