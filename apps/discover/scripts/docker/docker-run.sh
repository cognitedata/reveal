echo ''
echo '## Starting testcafe runner ##'
echo ''

../../node_modules/.bin/testcafe chromium:headless '--use-gl=swiftshader --enable-logging=stderr --disable-software-rasterizer --window-size=1500,1040' /home/node/testcafe/tests --stop-on-first-fail $META 2>&1 | tee testcafe/logs/run.log
