#!/usr/bin/env sh

# Note: Insert values for these tokens, like so:
#  export FOO="${FOO:-[some-default-value-here]}"
# The leading - is important.

variant="${1:-development}"
project="${2:-platypus}"
configuration=""

case "$variant": in
  dev*) # development
    configuration="--configuration=development"
    export REACT_APP_ENV="development"
    export NODE_ENV="development"
    ;;

  s*) # staging
    configuration="--configuration=staging"
    export REACT_APP_ENV="staging"
    export NODE_ENV="staging"
    ;;

  prod*) # production
  configuration="--configuration=production"
    export REACT_APP_ENV="production"
    export NODE_ENV="production"
    ;;

  pr*) # Preview server builds
    configuration="--configuration=preview"
    export REACT_APP_ENV="preview"
    export NODE_ENV="preview"
    ;;

  test*)
    configuration="--configuration=staging"
    export REACT_APP_ENV="staging"
    export NODE_ENV="staging"
    ;;

  mock*)
    configuration="--configuration=mock"
    export REACT_APP_ENV="mock"
    export NODE_ENV="mock"
    ;;

  fusion*)
    configuration="--configuration=fusion"
    export REACT_APP_ENV="fusion"
    export NODE_ENV="fusion"
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
export NX_SENTRY_PROJECT_NAME="${SENTRY_PROJECT_NAME:-}"
export NX_SENTRY_DSN="${SENTRY_DSN:-}"

args=()

if [[ -n "${PUBLIC_URL}" ]]; then
  args=("--publicHost" "${PUBLIC_URL}")
fi

nx serve "${project}" "${configuration}" --ssl=true --port=3000 "${args[@]}"
