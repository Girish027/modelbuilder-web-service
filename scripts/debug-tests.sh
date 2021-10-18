#!/usr/bin/env sh

source ./common.sh

if [ -n "$GREP" ]; then
    GREPPARAM="--grep $GREP"
fi

NODE_ENV=$NODE_ENV node $NODE_FLAGS node_modules/.bin/mocha \
  --timeout 0 --inspect-brk=9229 $GREPPARAM 2>&1 | \
  sed 's@ws://@chrome-devtools://devtools/bundled/inspector.html?experiments=true\&v8only=true\&ws=@'
