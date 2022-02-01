#!/bin/bash

set -e

../../node_modules/.bin/react-scripts test "$@" \
  --collectCoverageFrom='!*/**/*.stories.tsx' \
  --ci \
  --coverage \
  --watchAll=false \
  --verbose \
  --reporters=default \
  --reporters=jest-junit \
  --runInBand \
  --detectOpenHandles \
  --env=jest-environment-jsdom \
  "$@"
