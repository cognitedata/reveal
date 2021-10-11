#!/usr/bin/env sh
# The testcafe image doesn't have bash, so we're stuck with sh
# for the first 2 commands: serve + run

E2E_PORT=${PORT:-3000}

COMMAND=${1:-help}
HTTP_PATH=http://localhost:$E2E_PORT
HTTPS_PATH=https://localhost:$E2E_PORT

case $COMMAND in
  #
  # These 2 commands are only to be run locally, so they are ok to be bash:
  #
  start-live)
    echo "Starting development server in end-to-end mode ..."
    PORT=$E2E_PORT \
      ../../node_modules/.bin/react-scripts --max_old_space_size=4096 start \
      "${@:2}"
    ;;  

  run-live)
    echo "Running end-to-end tests in live mode ..."
    echo "Waiting for $HTTPS_PATH/ to come up ..."
    ../../node_modules/.bin/wait-on \
      -t 60000 \
      https-get://localhost:$E2E_PORT/
    echo "... server up; starting test runner."

    # main chrome testing command:
    # "chrome '--use-gl=swiftshader --disable-software-rasterizer --window-size=1500,1040'" \
    # not working:
    # "firefox --use-gl=swiftshader --disable-software-rasterizer --window-size=1500,1040" \

    # use custom tsconfig: (this is the default setting)
    # --compiler-options typescript.configPath='tsconfig.testcafe.json' \
    # run scripts before starting:
    # --client-scripts testcafe/utils/window.js
    BASE_URL=$HTTPS_PATH \
      ../../node_modules/.bin/testcafe \
        "chrome '--use-gl=swiftshader --disable-software-rasterizer --window-size=1500,1118'" \
        testcafe/tests/* \
        --live
        # --live \
        # --color \
        # --screenshots-on-fails \
        # --screenshots testcafe/screenshots \
        # --video testcafe/videos \
        # --video-options failedOnly=true \
        # "${@:2}"
    ;;

    run-live-mac)
    echo "Running end-to-end tests in live mode ..."
    echo "Waiting for $HTTPS_PATH/ to come up ..."
    ../../node_modules/.bin/wait-on \
      -t 60000 \
      https-get://localhost:$E2E_PORT/
    echo "... server up; starting test runner."

    # main chrome testing command:
    # "chrome '--use-gl=swiftshader --disable-software-rasterizer --window-size=1500,1040'" \
    # not working:
    # "firefox --use-gl=swiftshader --disable-software-rasterizer --window-size=1500,1040" \

    BASE_URL=$HTTPS_PATH \
      ../../node_modules/.bin/testcafe \
        "chrome '--disable-software-rasterizer --window-size=1500,1118'" \
        testcafe/* \
        --live \
        --screenshots-on-fails \
        --screenshots testcafe/screenshots \
        --video testcafe/videos \
        --video-options failedOnly=true \
        "${@:2}"
    ;;

  *) # help
    >&2 echo ""
    >&2 echo "Usage: yarn frontend-scripts testcafe [serve|run|start-live|run-live|run-live-mac|help]"
    >&2 echo ""
    >&2 echo "  help          -  Display this help message."
    >&2 echo "  serve         -  Start the headless testcafe server."
    >&2 echo "  start-live    -  Start the local server without building."
    >&2 echo "  run-live      -  Run the tests in a visible browser."
    >&2 echo ""
    exit 1
    ;;
esac
