#!/usr/bin/env sh

set -e

CONFIG=${1:-pr}
BRANCH_NAME=${BRANCH_NAME:-missing}

if [ "$CONFIG" = "staging" ]; then
  echo "Building staging release ..."
  export NODE_ENV=staging
  export REACT_APP_ENABLE_REDUX_LOGGER=false
  export REACT_APP_ENV=staging
  export REACT_APP_SENTRY_DSN=https://73501539810546ed8fd963457833f566@o124058.ingest.sentry.io/5208164
  export REACT_APP_RELEASE="$BRANCH_NAME-$(git rev-parse --short HEAD)"

  # This will enable saveMissing on the staging server so that we can get the
  # missing strings reported in a low-churn way. If they're reported on
  # development environments, then it's really annoying to test because it never
  # falls back to the defaults once the missing string is reported.
  #
  # This API key is okay to bake into the build because it doesn't have admin
  # access. This is not ideal, but we don't have a secure way to fetch it at
  # runtime yet.
  export REACT_APP_LOCIZE_API_KEY="f1f6b763-2c20-4e12-a1c5-c33f1a71cec2"
  export REACT_APP_I18N_DEBUG=true
elif [ "$CONFIG" = "production" ]; then
  echo "Building release: $BRANCH_NAME ..."
  export NODE_ENV=production
  export REACT_APP_ENABLE_REDUX_LOGGER=false
  export REACT_APP_ENV=production
  export REACT_APP_SENTRY_DSN=https://73501539810546ed8fd963457833f566@o124058.ingest.sentry.io/5208164  
  export REACT_APP_RELEASE="$BRANCH_NAME-$(git rev-parse --short HEAD)"
else
  >&2 echo "Unrecognized build configuration: [ $CONFIG ]"
  exit 1
fi

../../node_modules/.bin/react-scripts --max-old-space-size=12288 build
