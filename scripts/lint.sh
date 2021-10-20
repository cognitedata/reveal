#!/usr/bin/env sh

# Note: Insert values for these tokens, like so:
#  export FOO="${FOO:-[some-default-value-here]}"
# The leading - is important.

project="${1:-platypus}"

nx lint ${project}
