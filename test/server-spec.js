/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
'use strict';

 describe('server', function() {
    const assert = require('assert'),
        request = require('supertest'),
        fs = require('fs'),
        fsExtra = require('fs-extra'),
        nock = require('nock'),
        TestUtil = require('./test-util'),
        makeAndStartServer = TestUtil.makeAndStartServer;

    before(function() {
        fs.writeFileSync(TestUtil.getHeartbeatPath(), 'OK');
    });

    beforeEach(function() {
        TestUtil.restoreConfig();
    });

    afterEach(function() {
        const pendingMocks = nock.pendingMocks();
        assert(!pendingMocks.length, pendingMocks);
    });
    after(function() {
       fsExtra.removeSync("./test/heartbeat.txt");
        fsExtra.removeSync("log.txt");
    });

    it('should start and stop the server', function(done) {
        makeAndStartServer(function(server, httpServer) {
            assert(server, 'server');
            assert(httpServer, 'httpServer');
            server.close('die');
            done();
        });
    });

    it('should close gracefully if config does not log requests', function(done) {
        const rawConfig = TestUtil.getRawConfig();
        assert(rawConfig['request-log']['output-dir']);
        delete rawConfig['request-log']['output-dir'];
        makeAndStartServer(function(server) {
            assert(server, 'server');
            server.close('die');
            done();
        });
    });

    it('should GET /v1/health', function(done) {
        makeAndStartServer(function(server, httpServer) {
            request(httpServer)
                .get('/v1/health')
                .expect(200)
                .end(function(err, res) {
                    assert(!err, err);
                    assert.equal(res.type, 'text/plain');
                    assert.equal(res.text, 'OK');
                    server.close('die');
                    done();
                });
        });
    });

    it('should return a 404 for an invalid route', function(done) {
        makeAndStartServer(function(server, httpServer) {
            request(httpServer)
                .get('/v1/foobar')
                .expect(404)
                .end(function(err, res) {
                    assert(!err, err);
                    server.close('die');
                    done();
                });
        });
    });
});