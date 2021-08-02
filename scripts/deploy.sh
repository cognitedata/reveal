#!/bin/bash

if [ $# -eq 0 ] || [ $# -eq 1 ]; then
    echo ' '
    echo "[USAGE]: ./deploy.sh <app-name> <version> [--no-dry-run]"
    echo ' '
    exit 1
fi

branch=$(git branch --show-current)

echo ' '
echo "app: $1"
echo "version: $2"
if [[ $# -eq 3 && $3 == "--no-dry-run" ]]; then
    echo "Will not be a dry run"
fi
echo "Your current branch is \"$branch\":"
echo ' '

read -r -s -p $'If that is okay, press enter to continue...'
echo ' '

npx @cognite/fas-utils cut-release --release-branch-prefix release-$1- --package-path apps/$1 --cut-version $2 $3

EXIT_CODE=$?

if [[ $# -eq 3 && $3 == "--no-dry-run" ]]; then
    echo ' '
    echo "Don't forget to create a PR in application-services repository to update the versionSpec if needed"
fi

echo ' '

exit $EXIT_CODE

