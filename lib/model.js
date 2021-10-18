/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
'use strict';

const uuid = require('uuid');

class Model {
  constructor() {
    this.id = uuid();
    this.status = 'Initialized';
  }
}

module.exports = {
    Model: Model
}
