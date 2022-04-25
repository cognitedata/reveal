#!/usr/bin/env bash

set -e

# Get version field value from package.json
VERSION=`cat @@PACKAGE_JSON_PATH@@ | grep '"version":' | awk -F': ' '{print $2}' | sed 's/,*$//g'`

echo "{\"production_app_id\":\"@@PRODUCTION_APP_ID@@\",\"staging_app_id\":\"@@STAGING_APP_ID@@\",\"repo_id\":\"@@REPO_ID@@\",\"sentry_project_name\":\"@@SENTRY_PROJECT_NAME@@\",\"preview_subdomain\":\"@@PREVIEW_SUBDOMAIN@@\",\"versioning_strategy\":\"@@VERSIONING_STRATEGY@@\",\"base_version\":$VERSION,\"should_publish_source_map\":\"@@SHOULD_PUBLISH_SOURCE_MAP@@\"}"
