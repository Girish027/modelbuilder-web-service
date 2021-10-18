#!/usr/bin/env sh

source ./common.sh

# https://nodejs.org/en/docs/guides/simple-profiling/
NODE_ENV=$NODE_ENV node $NODE_FLAGS \
  --prof \
  index.js \
  --config config/service-template.json

# afterward:
# node --prof-process isolate-0xnnnnnnnnnnnn-v8.log > processed.txt
