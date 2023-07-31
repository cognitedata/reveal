#!/usr/bin/env bash

# This is a comment to trigger spinnaker_deployment

set -e

echo '{"name":"@@SERVICE_NAME@@","pipelines":@@PIPELINES@@,"manifest":"@@MANIFEST@@","docker_repository":"@@DOCKER_REPOSITORY@@"}'
