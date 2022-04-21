#!/usr/bin/env bash

echo ''
echo '###################################'
echo "# --> Starting build for $3"
echo '###################################'
echo ""

cp -r $1/* $2 && find -L $2 -type f | xargs sed -i 's,\(\/\)\?PUBLIC_URL_VALUE,,g'
find -L $2 -type f | xargs sed -i "s,process\.env\.REACT_APP_E2E_CLUSTER,'bluefield',g"
find -L $2/sidecar.js -type f | xargs sed -i 's,disableIntercom: false,disableIntercom: true,g'
