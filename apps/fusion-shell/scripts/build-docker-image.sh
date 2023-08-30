#!/usr/bin/env bash

set -e

cd "$(dirname "$0")"/..

docker build --platform=linux/amd64 -f ./Dockerfile -t eu.gcr.io/cognitedata-development/fusion-app/dev:latest --build-arg="APP_FOLDER=." ../../dist/apps/fusion-shell
