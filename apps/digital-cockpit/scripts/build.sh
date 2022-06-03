#!/bin/bash

variant="${1:-development}"

export REACT_APP_RELEASE_DATE="$(date +%s)"

case "$variant": in
  dev*) # development
    export REACT_APP_ENV="development"
    ;;

  s*) # staging
    export REACT_APP_ENV="staging"
    ;;

  prod*) # production
    export REACT_APP_ENV="production"
    ;;

  pr*) # Preview server builds
    export REACT_APP_ENV="preview"
    ;;

  test*)
    export REACT_APP_ENV="staging"
    ;;

  *)
    echo "Unknown build type: ${variant}"
    exit 1
esac

../../node_modules/.bin/vite build
