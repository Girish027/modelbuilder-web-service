#!/usr/bin/env sh

# Enable deprecation flags whenever possible to get an early heads up
#   about pending b/w incompat changes to the node ecosystem (runtime, OSS modules).
# Only disable these in a pinch when dependent on critical OSS pkg that leverages a deprecated feature,
#   and either eliminate/replace that pkg or help to fix it by submitting a patch.

# --throw-deprecation
function setupNodeFlags() {
  local __NODE__FLAGS=(
    --use_strict
    --pending-deprecation
    --trace-deprecation
    --trace-warnings
  )
  NODE_FLAGS=${__NODE__FLAGS[*]}
}

touch heartbeat.txt
mkdir -p logs

if [ -z "$NODE_ENV" ]; then
    NODE_ENV=dev
    echo "Defaulting NODE_ENV to $NODE_ENV";
fi

if [ -z "$NODE_FLAGS" ]; then
    setupNodeFlags
    echo "Defaulting NODE_FLAGS to $NODE_FLAGS";
fi