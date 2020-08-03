#!/bin/bash

# NOTE: `head -n negative-number` is not supported by BSD coreutils,
# install GNU Coreutils to get this to work on OSX.
#
# See https://formulae.brew.sh/formula/coreutils

# This command will remove the summary at the end of the test run and
# all the PASS messages. If there is any output left after this, the
# command will fail.

test_output=$(yarn $1 2>&1);
test_exit_code=$?
test_output_filtered=$(echo "$test_output" |head -n -7|egrep -v 'PASS|rescripts|yarn');
test_output_length=${#test_output_filtered};

if (( $test_output_length > 0 )); then
    >&2 echo "Test produced some unexpected output. Only 'PASS' messages and the summary at the end are expected.";
    >&2 echo
    >&2 echo "Unexpected part:" ;
    >&2 echo "--------------------------" ;
    >&2 echo "$test_output_filtered";
    >&2 echo "--------------------------" ;
    >&2 echo
    >&2 echo "Full output";
    >&2 echo "$test_output";
    exit 1
else
    echo "$test_output";
    exit $test_exit_code;
fi
