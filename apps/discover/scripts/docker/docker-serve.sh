echo ''
echo '## Starting testcafe server ##'
echo ''
# echo "PROJECT: ${REACT_APP_API_KEY_PROJECT}"
# echo "KEY: ${REACT_APP_API_KEY}"
echo ''

sed -i "s/CDF_CLUSTER/$CDF_CLUSTER/g" /home/node/build/sidecar.js
../../node_modules/.bin/serve -s build -l 3000 2>&1 | tee /home/node/testcafe/logs/serve.log
