#!/bin/bash

cd examples
REVEAL_DEPS=$(cat package-lock.json | jq '.["dependencies"] | .["@cognite/reveal"] | .dependencies | length')
if (( REVEAL_DEPS == 0)); then
    echo "ERROR: examples/package-lock.json has no dependencies under @cognite/reveal."
    echo "This happens if you run npm install in examples before running it in viewer."
    echo "Please re-run npm install and push your PR again."
    exit 1
fi
