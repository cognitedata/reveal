#!/usr/bin/env bash

set -e

# Helper script for baking manifests locally.
# It is not possible to mount the Jenkins workspace directory (emptyDir volume) into the Docker container without hacks.
# Docker runs in the host machine, and the emptyDir is not mounted in the same directory on the host.
# See https://stackoverflow.com/questions/46525081/does-kubernetes-mount-an-emtpydir-volume-on-the-host

docker pull eu.gcr.io/cognitedata/baker:latest
if [ $# -eq 0 ] || [ "${1#-}" != "$1" ]; then
    set -- bake "$@"
fi

docker_args=""
docker_args="${docker_args} run --rm -e HOME=/tmp -u $(id -u):$(id -g)"
if [ -d "$(pwd)/spinnaker-templates" ]; then
    docker_args="${docker_args} --mount type=bind,source=$(pwd)/spinnaker-templates,target=/templates/spinnaker-templates"
fi
if [ -n "$BAKER_PARALLEL" ]; then
    docker_args="${docker_args} -e BAKER_PARALLEL=${BAKER_PARALLEL}"
fi
docker_args="${docker_args} -v $(pwd):/baker -w /baker eu.gcr.io/cognitedata/baker:latest"
# shellcheck disable=SC2086
docker ${docker_args} baker "$@"
