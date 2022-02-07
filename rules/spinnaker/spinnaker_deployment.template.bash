#!/usr/bin/env bash

set -e

echo '{"name":"@@SERVICE_NAME@@","pipelines":@@PIPELINES@@,"manifest":"@@MANIFEST@@","docker_repository":"@@DOCKER_REPOSITORY@@"}'
