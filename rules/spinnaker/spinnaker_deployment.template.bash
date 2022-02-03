#!/usr/bin/env bash

# This is a comment to trigger spinnaker_deploy

set -e

echo '{"name":"@@SERVICE_NAME@@","pipelines":@@PIPELINES@@,"manifest":"@@MANIFEST@@","docker_repository":"@@DOCKER_REPOSITORY@@"}'
