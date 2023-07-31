#!/bin/bash

red(){
    RED="\033[0;31m"
    printf "${RED}${1}\n"
}

tmpFile="/tmp/frontend_test"
errorFrontend="/tmp/.error_tests_frontend"
rm -rf $tmpFile
rm -rf $errorFrontend

#
#
# Step 0 - Make sure there are not any .only 's in your tests, accidentially skipping things
#
#

# with testcafe:
# if [ $(grep -rHn '\.only' src testcafe | wc -l) -gt "0" ];

# without testcafe for now, as i need to refactor a helper that has .only
if [ $(grep -rHn '\.only' src | wc -l) -gt "0" ];
then
	red "============================="
	red ">> Found '.only' in tests  <<"
	red "============================="
	exit 1
fi

# run your tests
{ yarn test:all --watchAll=false --ci --coverage --colors --testFailureExitCode 1 $@ 2>&1; echo $? > $errorFrontend; } | tee $tmpFile

# bail out if the tests failed first
[ "$(cat $errorFrontend)" = "1" ] && exit 1

#
#
# Step 1 - Check for things that we allow upto a limit
#
#

# Check for console.log or warnings on tests
errorCount=$(grep -rHn -e 'console\.error' $tmpFile | wc -l)
warnCount=$(grep -rHn -e 'console\.warn' $tmpFile | wc -l)
logCount=$(grep -rHn -e 'console\.log' $tmpFile | wc -l)

errorLimit=0
warnLimit=0
loglimit=0

red
red "============================="
red ">> Limits:                   "
red ">>    Log:   $logCount / $loglimit"
red ">>    Warn:  $warnCount / $warnLimit"
red ">>    Error: $errorCount / $errorLimit"
red "============================="
red

if [ "$logCount" -gt "$loglimit" ];
then
	red "==========================="
	red ">>  Found logs in tests  <<"
	red "==========================="

	rm -rf $tmpFile
	exit 1
fi

if [ "$errorCount" -gt "$errorLimit" ];
then
	red "============================="
	red ">>  Found errors in tests  <<"
	red "============================="

	rm -rf $tmpFile
	exit 1
fi


if [ "$warnCount" -gt "$warnLimit" ];
then
	red "==============================="
	red ">>  Found warnings in tests  <<"
	red "==============================="

	rm -rf $tmpFile
	exit 1
fi

#
#
# Step 2 - Check for other bad strings that we should fail on instantly
#
#
grep -rHn \
	-e '(node:' \
	-e 'Cannot log after tests are done' \
	$tmpFile \
	&& echo \
	&& red "=======================================" \
	&& red ">> Found a fatal error in tests      <<" \
	&& red "=======================================" \
	&& echo \
	&& rm -rf $tmpFile \
	&& exit 1

rm -rf $tmpFile
exit 0
