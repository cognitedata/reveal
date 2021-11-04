#!/bin/bash

variant="${1:-development}"
project="${2:-platypus}"
configuration=""
baseHref="${PUBLIC_URL:-}/"

case "$variant": in
  dev*) # development
    configuration=""
    export REACT_APP_ENV="development"
    ;;

  s*) # staging
    configuration="--configuration=staging"
    export REACT_APP_ENV="staging"
    ;;

  prod*) # production
  configuration="--configuration=production"
    export REACT_APP_ENV="production"
    ;;

  pr*) # Preview server builds
    configuration="--configuration=preview"
    export REACT_APP_ENV="preview"
    ;;

  test*)
    configuration="--configuration=staging"
    export REACT_APP_ENV="staging"
    ;;

  *)
    echo "Unknown build type: ${variant}"
    exit 1
esac

export NX_REACT_APP_I18N_PSEUDO="${REACT_APP_I18N_PSEUDO:-false}"
export NX_REACT_APP_APP_ID="${REACT_APP_APP_ID:-}"
export NX_REACT_APP_RELEASE_ID="${REACT_APP_RELEASE_ID:-}"
export NX_REACT_APP_VERSION_SHA="${REACT_APP_VERSION_SHA:-}"
export NX_REACT_APP_VERSION_NAME="${REACT_APP_VERSION_NAME:-}"
export NX_PUBLIC_URL="${PUBLIC_URL:-}"

nx build ${project} ${configuration} --deployUrl=${baseHref}

# hack for now until this is properly solved
#if [ "$project" == "platypus" ]; then
#nx postbuild ${project}
#fi

