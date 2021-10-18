/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
'use strict';

const log4js = require('log4js'),
  libPath = require('path'),
  libConfig = require('node-config'),
  Model = require('../lib/model').Model,
  Server = require('../lib/server').Server;

const HEARTBEAT_PATH = libPath.join(__dirname, '/heartbeat.txt');

const SERVICE_LOG_PATH = libPath.resolve(`${__dirname}/../config/service-template-logging.json`);
log4js.configure(SERVICE_LOG_PATH, {});

let RAW_CONFIG = require('../config/service-template.json');

const RAW_CONFIG_SOURCE = JSON.stringify(RAW_CONFIG);

module.exports.getRawConfig = function() {
  return RAW_CONFIG;
};

module.exports.restoreConfig = function() {
  RAW_CONFIG = JSON.parse(RAW_CONFIG_SOURCE);
  RAW_CONFIG.listen.port = 0;
  RAW_CONFIG.health['heartbeat-path'] = HEARTBEAT_PATH;
};

module.exports.restoreConfig();

module.exports.getHeartbeatPath = function() {
  return HEARTBEAT_PATH;
};

module.exports.makeAndStartServer = function(cb) {
  const config = libConfig.fromObject(RAW_CONFIG);
  const serverOpts = {
    config,
    logmgr: log4js,
    fortuneTeller: new Model(),
    modelBuilder: new Model()
  };

  const server = new Server(serverOpts);
  server.once('listening', (listenInfo) => {
    cb(server, listenInfo.httpServer);
  });
  server.run();
};
