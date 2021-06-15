#!/bin/bash

##
## This script:
## - runs the testcafe tests
##
##
## Useful for:
## - running the testcafe tests locally (live mode)
##

BASE_URL=https://localhost:3000 \
  ../../node_modules/.bin/testcafe \
    "chrome '--disable-software-rasterizer --window-size=1500,1118'" \
    'testcafe/desktop' \
    --live \
    "${@:2}"
