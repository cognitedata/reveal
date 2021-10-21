#!/bin/bash

# This script will be run bazel when building process starts to
# generate key-value information that represents the status of the
# workspace. The output should be like
#
# KEY1 VALUE1
# KEY2 VALUE2
#
# If the script exits with non-zero code, it's considered as a failure
# and the output will be discarded.

echo '"""Unique user id"""'
# echo "REACT_APP_E2E_USER = \"$(git config user.email)\""
echo "REACT_APP_E2E_USER = \"$(hostname)\""
