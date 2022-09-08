#!/bin/bash

FILE="ASDAA-04-00003-0002.svg"
# FILE="ASDAA-04-00003-0029.svg"
# FILE="ASDAA-04-00004-0002.svg"
# FILE="ASDAA-04-00006-0001.svg"
# FILE="ASDAA-04-00013-0001.svg"

BASE_URL="https://greenfield.cognitedata.com"
PROJECT="atlas-greenfield"
CLIENT_ID="ec3684fd-5517-45c1-8a13-1a925b000ab8"
TENANT_ID="0b320d24-2c6f-45c6-be28-8d63e0804f51"
SPACE="matchmakers-test-12-engineering-diagrams"
PAGE=1

yarn run cli list-dms \
--base-url=${BASE_URL} \
--project=${PROJECT} \
--client-id=${CLIENT_ID} \
--tenant-id=${TENANT_ID} \
--svg-file-name=${FILE} \
--space-external-id=${SPACE} \
--file-page=${PAGE}
