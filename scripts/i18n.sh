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


# Docs can be found here
# https://github.com/cognitedata/cdf-ui-i18n-utils/blob/main/bin/README.md

cdf-i18n-utils-cli ${cliCommand} --namespace=${project} --path=apps/${project}/src/i18n
