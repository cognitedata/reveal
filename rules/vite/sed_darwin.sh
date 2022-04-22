#!/usr/bin/env bash

cp -r $1/* $2 && LC_CTYPE=C LANG=C find -L $2/index.html -type f | xargs sed -i '' 's,\/PUBLIC_URL_VALUE,PUBLIC_URL_VALUE,g'
LC_CTYPE=C LANG=C find -L $2/assets/*.css -type f | xargs sed -i '' 's,\/PUBLIC_URL_VALUE,PUBLIC_URL_VALUE,g'
