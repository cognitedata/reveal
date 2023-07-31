#!/bin/bash

set -e

../../node_modules/.bin/jest test "$@" \
  --collectCoverageFrom='!*/**/*.stories.tsx' \
  --ci \
  --coverage \
  --verbose \
  --reporters=default \
  --reporters=jest-junit \
  --runInBand \
  --detectOpenHandles \
  --env=jest-environment-jsdom \
  "$@"
