#!/bin/bash

set -e

cd "$(dirname "$0")"

yarn react-scripts test "$@" \
  --collectCoverageFrom='!*/**/*.stories.tsx' \
  --ci \
  --verbose \
  --runInBand \
  --detectOpenHandles \
  --env=jest-environment-jsdom-sixteen \
  "$@"
