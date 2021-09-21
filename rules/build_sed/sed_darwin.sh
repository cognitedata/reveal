#!/usr/bin/env bash

cp -r $1/* $2 && LC_CTYPE=C LANG=C find -L $2 -type f | xargs sed -i '' 's,PUBLIC_URL_VALUE,,g'
