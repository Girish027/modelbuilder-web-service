#!/usr/bin/env sh

source ./common.sh

NODE_ENV=$NODE_ENV node $NODE_FLAGS \
  index.js \
  --config config/service-template.json $@
