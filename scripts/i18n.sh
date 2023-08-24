#!/bin/bash

# args
commandArg="${1:-pull}"
project="${2:-platypus}"

# vars
cliCommand="pull"
baseHref="${PUBLIC_URL:-}/"


case "$commandArg": in
  pull*) 
    cliCommand="pull-keys-from-remote"
    ;;

  sort*) 
    cliCommand="sort-local-keys"
    ;;

  push*) 
    cliCommand="save-missing-keys-to-remote"
    ;;

  remove-deleted*)
    cliCommand="remove-deleted-keys-from-remote"
    ;;

  *)
    echo "Unknown command: ${commandArg}"
    exit 1
esac

if [ -d "libs/${project}/src/i18n" ]; then
  path=libs/${project}/src/i18n
elif [ -d "libs/shared/${project}/src/i18n" ]; then
  path=libs/shared/${project}/src/i18n
else
  path=apps/${project}/src/i18n
fi

# if industy-canvas, use different path
if [ "$project" = "industry-canvas" ]; then
  path=libs/industry-canvas/src/lib/common/i18n
  project="industrial-canvas"
fi


# Docs can be found here
# https://github.com/cognitedata/cdf-ui-i18n-utils/blob/main/bin/README.md

# The script is in the monorepo, run locally
./libs/shared/cdf-ui-i18n-utils/src/cdf-i18n-utils-cli.cjs ${cliCommand} --namespace=${project} --path=${path}
