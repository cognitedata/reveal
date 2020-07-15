
#!/bin/sh
set -e

cd "$(dirname "$0")"

yarn react-scripts test "$@" \
  --collectCoverageFrom='!*/**/*.stories.tsx' \
  --ci \
  --coverage \
  --verbose \
  --reporters=default \
  --reporters=jest-junit \
  --runInBand \
  --detectOpenHandles \
  --env=jest-environment-jsdom-sixteen \
  "$@"
