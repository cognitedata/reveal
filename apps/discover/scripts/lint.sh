 #!/bin/bash
 # We need to use the bash script otherwise the eslint doesn't detect all the child paths.
set -eu

../../node_modules/.bin/concurrently \
 --kill-others-on-fail \
  "yarn prettier" \
  "yarn run tsc" \
  "yarn run eslint \"src/**/*.{ts,tsx,js}\" \"src/*.{ts,tsx}\" \"public/index.html\""
