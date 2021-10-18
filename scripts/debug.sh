#!/usr/bin/env sh

source ./common.sh

# after executing the following, within chrome: chrome://inspect/#devices
NODE_ENV=$NODE_ENV node $NODE_FLAGS \
  --nolazy --inspect-brk=9229 \
  index.js \
  --config config/service-template.json "$@"
