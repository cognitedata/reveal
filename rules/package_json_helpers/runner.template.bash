#!/usr/bin/env bash

GENERATOR_SHORT_PATH=@@GENERATOR_SHORT_PATH@@
BUILDIFIER_SHORT_PATH=@@BUILDIFIER_SHORT_PATH@@

export RUNFILES_DIR="$(readlink @@OUTFILE_SHORT_PATH).runfiles"

generator_short_path="$RUNFILES_DIR/@@WORKSPACE_NAME@@/$GENERATOR_SHORT_PATH"
buildifier_short_path="$RUNFILES_DIR/@@WORKSPACE_NAME@@/$BUILDIFIER_SHORT_PATH"

cd "$BUILD_WORKSPACE_DIRECTORY"

contents=$("$generator_short_path" @@BUILD_FILE@@ @@OUT_PATH@@ @@PACKAGE_PATH@@ @@SRC_PATH@@ @@WORKSPACE@@)
if [[ $? -ne 0 ]] ; then
    echo "Generator exited with error"
    exit 1
fi

contents=$(echo "$contents" | "$buildifier_short_path" --type build)
if [[ $? -ne 0 ]] ; then
    echo "Buildifier exited with error"
    exit 1
fi

echo "$contents" > @@BUILD_FILE@@

echo "Generated helpers in @@BUILD_FILE@@"
