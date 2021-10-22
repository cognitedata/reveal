#!/usr/bin/env sh

# Note: Insert values for these tokens, like so:
#  export FOO="${FOO:-[some-default-value-here]}"
# The leading - is important.

variant="${1:-development}"
project="${2:-platypus}"
configuration=""

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

args=()

if [[ -n "${PUBLIC_URL}" ]]; then
  args=("--publicHost" "${PUBLIC_URL}")
fi

nx serve "${project}" "${configuration}" --ssl=true --port=3000 "${args[@]}"
