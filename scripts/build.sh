#!/usr/bin/env bash

variant="${1:-development}"

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

  *)
    echo "Unknown build type: ${variant}"
    exit 1
esac

react-scripts build
