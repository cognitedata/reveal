#!/bin/bash

cd examples
REVEAL_DEPS=$(cat package-lock.json | jq '.["dependencies"] | .["@cognite/reveal"] | .dependencies | length')
REVEAL_REQS=$(cat package-lock.json | jq '.["dependencies"] | .["@cognite/reveal"] | .requires | length')
REVEAL_TOTAL_DEPENDENCIES_COUNT=sum=$(( $REVEAL_DEPS + $REVEAL_REQS ))
if (( REVEAL_TOTAL_DEPENDENCIES_COUNT == 0)); then
    echo "ERROR: examples/package-lock.json has no dependencies under @cognite/reveal."
    echo "This happens if you run npm install in examples before running it in viewer."
    echo "Please re-run npm install and push your PR again."
    exit 1
fi
