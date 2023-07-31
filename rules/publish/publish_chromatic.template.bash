#!/usr/bin/env bash

PROJECT_TOKEN=$(cat $CHROMATIC_PROJECT_KEYS/@@PROJECT_NAME@@.txt)

@@CHROMATIC_SCRIPT@@ --storybook-build-dir=@@STORYBOOK_FOLDER@@ --project-token=$PROJECT_TOKEN --only-changed --exit-once-uploaded --ci $@
