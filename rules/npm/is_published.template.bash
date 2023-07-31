#!/usr/bin/env bash

set -e

function realpath { 
    echo $(cd $(dirname $1);
    pwd)/$(basename $1);
}

NODE="$(realpath @@NODE_PATH@@)"
NPM="$(realpath @@NPM_PATH@@)"
PACKAGE_PATH="@@PACKAGE_PATH@@"
PACKAGE_NAME="@@PACKAGE_NAME@@"

export PATH="$(dirname $NODE):$(dirname $NPM)"

PACKAGE_VERSION=$(node -p "require('./$PACKAGE_PATH/package.json').version")

echo "Local version of $PACKAGE_NAME is $PACKAGE_VERSION"

PUBLISHED_SHASUM=$(npm-cli.js view "$PACKAGE_NAME@$PACKAGE_VERSION" dist.shasum)

if [ -z "$PUBLISHED_SHASUM" ]; then
    echo "This version is not yet published!"
    exit 1
else 
    echo "$PACKAGE_NAME@$PACKAGE_VERSION is already published with shasum $PUBLISHED_SHASUM"
    exit 0
fi

