#!/bin/bash

##
## ================
## This script:
## ================
##
## Runs the testcafe tests
##
## ================
## Useful for:
## ================
##
## Running the testcafe tests locally (live mode)
##
## ================
## Example usage:
## ================
##
## Run all:
## yarn testcafe:run-live
##
## Run just comments page:
## yarn testcafe:run-live comments
##
## Disable swiftshader, aka do this if you have a mac:
## yarn testcafe:run-live comments macMode
##

PAGE_COMMAND=""
if [ ! -z $1 ]; then
  PAGE="$1"
  PAGE_COMMAND="--fixture-meta page=$PAGE"
fi 

SHADER="--use-gl=swiftshader"
if [ ! -z $2 ]; then
  SHADER=""
fi 

echo
echo "Starting TestCafé"
echo "-----------------"
echo " - PAGE:   ${PAGE:-All}"
echo "$PAGE_COMMAND"

FINAL_COMMAND="chrome '$SHADER --disable-software-rasterizer --window-size=1500,1118' \
    testcafe/desktop \
    --live \
    $PAGE_COMMAND ${@:2}"

echo "FINAL_COMMAND: $FINAL_COMMAND"

BASE_URL=https://localhost:3000 \
  ../../node_modules/.bin/testcafe \
  $FINAL_COMMAND
    