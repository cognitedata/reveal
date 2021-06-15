#!/bin/sh

REACT_APP_E2E_MOCK=true \
    yarn build testcafe
