#!/usr/bin/env sh

set -e

# source ./common.sh

LOCAL_BIN=node_modules/.bin
MOCHA=$LOCAL_BIN/mocha
NYC=$LOCAL_BIN/nyc

# the build sets HTTP(S)_PROXY which causes issues with 'nock'-based unit tests
# because the fileloader respects HTTP(S)_PROXY
# it also respects and gives precedence to NO_PROXY
# '*' means disable proxy for all requests
export NO_PROXY="*"

if [ -z "$COVERAGE" ]; then
    echo "Disabling coverage";
    unset NYC
fi

if [ -n "$GREP" ]; then
    GREPPARAM="--grep $GREP"
fi

export JUNIT_REPORT_PATH=logs/test-results.xml
export JUNIT_REPORT_STACK=1
export JUNIT_REPORT_NAME=$(node -p "require('./package.json').name")

NODE_ENV=$NODE_ENV node $NODE_FLAGS \
  $NYC $MOCHA $GREPPARAM \
  -R mocha-jenkins-reporter \
  --bail \
  --recursive \
  --file test/test-init.js \
  'test/**/*-spec.js'