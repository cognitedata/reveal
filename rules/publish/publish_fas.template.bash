#!/usr/bin/env bash

set -e

echo '{"production_app_id":"@@PRODUCTION_APP_ID@@","staging_app_id":"@@STAGING_APP_ID@@","repo_id":"@@REPO_ID@@","sentry_project_name":"@@SENTRY_PROJECT_NAME@@","preview_subdomain":"@@PREVIEW_SUBDOMAIN@@","versioning_strategy":"@@VERSIONING_STRATEGY@@"}'
