#!/bin/sh

PROPS=()
PROPS+=($1)
PROPS+=($2)

PAGE=""
TENANT=""
FIXTURE=" --fixture-meta"

TESTCAFELOCATION="./scripts/testcafe/testcafe.sh"
TESTCAFECOMMAND="run-live"
# REACT_APP_E2E_CLUSTER="azure-dev"

clear

if [ ${PWD##*/} != "discover" ]; then
  echo "Run this script from discover's root folder"
  echo
  exit
fi

PAGEC=""
if [ ! -z $1 ]; then
  PAGEC="--fixture-meta page=$1"
  PAGE="$1"
fi 

# Run the mac-command if we're on MacOS
if [[ "$OSTYPE" == "darwin"* ]]; then
  TESTCAFECOMMAND="run-live-mac"
fi

# Log some stuff
echo "Starting TestCafé"
echo "-----------------"
echo " - TENANT: ${TENANT:-discover-e2e-bluefield}"
echo " - PAGE:   ${PAGE:-All}"
echo

# Run the final command
CMD="E2E_PORT=3000 bash $TESTCAFELOCATION $TESTCAFECOMMAND$TENANTC $PAGEC"
echo "Final command: $CMD"
echo

eval "$CMD"
