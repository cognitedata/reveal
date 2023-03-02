#!/bin/sh

set -e


npx cdf-i18n-utils-cli sort-local-keys

if [[ `git status --porcelain src/common/i18n/translations` ]]; then
    echo "Keys changed after running 'npx cdf-i18n-utils-cli sort-local-keys', sort keys and try again";
    exit 1;
fi
