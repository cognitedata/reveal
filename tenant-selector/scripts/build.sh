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

export REACT_APP_MIXPANEL_TOKEN="0ef20fa9df0965e1ad952d1d9b804147"
export REACT_APP_LOCIZE_PROJECT_ID="dfcacf1f-a7aa-4cc2-94d7-de6ea4e66f1d"

react-scripts build
