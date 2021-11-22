#!/bin/bash

set -e

project="${1:-platypus}"

nx run ${project}:test "$@" \
  --collectCoverageFrom='!*/**/*.stories.tsx' \
  --ci \
  --verbose \
  --runInBand \
  --codeCoverage \
  --detectOpenHandles \
  --reporters=default \
  --watchAll=false

