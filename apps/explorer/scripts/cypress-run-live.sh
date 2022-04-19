#!/bin/bash

##
## ================
## This script:
## ================
##
## Runs the cypress tests
##
## ================
## Useful for:
## ================
##
## Running the cypress tests locally (live mode)
##
## ================
## Example usage:
## ================
##
## Run all:
## yarn cypress:run-live
##
## Run just comments page:
## yarn cypress:run-live cypress/Comments.spec.ts
##

PAGE_COMMAND=""
if [ ! -z $1 ]; then
  PAGE="$1"
  PAGE_COMMAND="--spec $PAGE"
else
  PAGE_COMMAND="--spec cypress/**/*.spec.ts"
fi 

echo
echo "Starting Cypress"
echo "-----------------"
echo " - PAGE:   ${PAGE:-All}"
echo "$PAGE_COMMAND"

FINAL_COMMAND="run \
    --headed \
    --env BASE_URL=https://localhost:3000 \
    $PAGE_COMMAND"

echo "FINAL_COMMAND: $FINAL_COMMAND"

../../node_modules/.bin/cypress \
  $FINAL_COMMAND
    