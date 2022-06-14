#!/bin/bash

set -e

project="${1:-platypus,platypus-core,platypus-common-utils}"

nx run-many --target=test --projects=${project} "$@" \
  --collectCoverageFrom='!*/**/*.stories.tsx' \
  --ci \
  --verbose \
  --runInBand \
  --codeCoverage \
  --detectOpenHandles \
  --reporters=default \
  --reporters=jest-junit \
  --coverageReporters=html,lcov,json,text-summary,cobertura \
  --watchAll=false

