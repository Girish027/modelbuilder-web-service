/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
'use strict';

const assert = require('assert'),
  nock = require('nock'),
  TestUtil = require('./test-util');

/*
The following mocha hooks are executed for each suite (aka per -spec.js)
See the --file option at the bottom of ../scripts/build.sh
*/

before(() => {
  nock.enableNetConnect('127.0.0.1');
});

beforeEach(function() {
  TestUtil.restoreConfig();
});

afterEach(function() {
  const pendingMocks = nock.pendingMocks();
  assert(!pendingMocks.length, pendingMocks);
});
