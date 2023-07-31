#!/usr/bin/env bash

set -e

# Get version field value from package.json
VERSION=`cat @@PACKAGE_JSON_PATH@@ | grep '"version":' | awk -F': ' '{print $2}' | sed 's/,*$//g'`

echo "{\"firebase_app_site\":\"@@FIREBASE_APP_SITE@@\",\"is_fusion_subapp\":\"@@IS_FUSION_SUBAPP@@\",\"build_folder\":\"@@BUILD_FOLDER@@\",\"firebase_json_path\":\"@@FIREBASE_JSON_PATH@@\",\"preview_subdomain\":\"@@PREVIEW_SUBDOMAIN@@\",\"fusion_app_id\":\"@@FUSION_APP_ID@@\",\"base_version\":$VERSION,}"
