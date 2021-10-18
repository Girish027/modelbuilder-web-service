/*
 * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
 * unpublished, proprietary work which is fully protected under
 * copyright law. This code may only be used pursuant to a valid
 * license from 24/7 Customer, Inc.
 */
'use strict';


describe('modelbuilder', function () {
    const assert = require('assert'),
        path = require('path'),
        request = require('supertest'),
        fs = require('fs-extra'),
        TestUtil = require('./test-util'),
        makeAndStartServer = TestUtil.makeAndStartServer;
    var testhttpServer = null;
    var testServer = null;
    before(function (done) {
        //fs.writeFileSync(TestUtil.getHeartbeatPath(), 'OK');
        TestUtil.restoreConfig();
        makeAndStartServer(function (server, httpServer) {
            testhttpServer = httpServer;
            testServer = server;
        })
        done();
    });

    after(function (done) {
        testServer.close('die');
        done();

    });

    it('should throw 400 bad request for missing training file for classification model', function (done) {
        request(testhttpServer)
            .post('/v1/modelbuilder')
            .query({'modelType': "classifier", 'encodingType': "UTF-8"})
            .expect(400)
            .end(function (err, res) {
                assert(!err, err);
                assert(res.body);
                assert.equal(res.body.reason, "Training file not uploaded for training classification model!!");
                done();
            });
    });

    it('should give out status as not posted to worker for invalid file type', function (done) {
        var agent = request(testhttpServer);
        agent.post('/v1/modelbuilder')
            .query({'modelType': "classifier", 'encodingType': "UTF-8"})
            .attach('trainingFile', path.join(__dirname, 'dummyFile.txt'))
            .expect(202)
            .end(function (err, res) {
                assert(!err, err);
                if (err) {
                    return done(err);
                }
                assert(res.body.link);
                var modeluuid = res.body.link.split("/").pop();
                setTimeout(function () {
                    agent.get("/v1/modelbuilder/" + modeluuid + "/status").end(function (err, res) {
                        assert.equal(res.body.status, "Failed posting model to modelbuilder worker: Error: File format should be intent|transcription|..");
                        fs.removeSync("./test/upload/" + modeluuid);
                        done()
                    });
                }, 300);
            });
    });

    it('should give out status as not posted to worker for invalid encoding format', function (done) {
        var agent = request(testhttpServer);
        agent.post('/v1/modelbuilder')
            .query({'modelType': "classifier", 'encodingType': "UTF-8"})
            .attach('trainingFile', path.join(__dirname, 'UTF-16.csv'))
            .expect(202)
            .end(function (err, res) {
                assert(!err, err);
                if (err) {
                    return done(err);
                }
                assert(res.body.link);
                var modeluuid = res.body.link.split("/").pop();
                setTimeout(function () {
                    agent.get("/v1/modelbuilder/" + modeluuid + "/status").end(function (err, res) {
                        assert.equal(res.body.status, "Failed posting model to modelbuilder worker: Error: File format should be intent|transcription|..");
                        fs.removeSync("./test/upload/" + modeluuid);
                        done()
                    });
                }, 300);
            });
    });

    it('should accept json config file', function (done) {
        var agent = request(testhttpServer);
        agent.post('/v1/modelbuilder')
            .field('isTest', true)
            .attach('trainingFile', path.join(__dirname, 'SanityInput.txt'))
            .attach('configuration', path.join(__dirname, 'config.json'))
            .expect(202)
            .end(function (err, res) {
                assert(!err, err);
                assert(res.body);
                var modelid = res.body.link.split("/").pop();
                setTimeout(function () {
                    fs.removeSync("./test/upload/" + modelid);
                    fs.removeSync("./test/upload/input-*");
                    done();
                }, 300);
            });
    });

    it('should accept modelbuilding without config file', function (done) {
        var agent = request(testhttpServer);
        agent.post('/v1/modelbuilder')
            .field('isTest', true)
            .attach('trainingFile', path.join(__dirname, 'SanityInput.txt'))
            .expect(202)
            .end(function (err, res) {
                assert(!err, err);
                assert(res.body);
                setTimeout(function () {
                    var modelid = res.body.link.split("/").pop();
                    fs.removeSync("./test/upload/" + modelid);
                    fs.removeSync("./test/upload/input-*");
                    done();
                }, 300);
            });
    });

    it('should accept request for creating normalization model without config file', function (done) {
        var agent = request(testhttpServer);
        agent.post('/v1/modelbuilder')
            .query({'modelType': "normalization", 'encodingType': "UTF-8"})
            .field('isTest', true)
            .expect(202)
            .end(function (err, res) {
                assert(!err, err);
                assert(res.body);

                setTimeout(function () {
                    var modelid = res.body.link.split("/").pop();
                    fs.removeSync("./test/upload/" + modelid);
                    fs.removeSync("./test/upload/input-*");
                    done();
                }, 300);
            });
    });

    it('should accept request for creating normalization model with config file', function (done) {
        var agent = request(testhttpServer);
        agent.post('/v1/modelbuilder')
            .query({'modelType': "normalization", 'encodingType': "UTF-8"})
            .field('isTest', true)
            .attach('configuration', path.join(__dirname, 'config.json'))
            .expect(202)
            .end(function (err, res) {
                assert(!err, err);
                assert(res.body);
                var modelid = res.body.link.split("/").pop();
                setTimeout(function () {
                    fs.removeSync("./test/upload/" + modelid);
                    fs.removeSync("./test/upload/input-*");
                    done();
                }, 300);
            });
    });

    it('should throw 400 bad request for invalid modelid while retrieving training outputs', function (done) {
        request(testhttpServer)
            .get('/v1/modelbuilder/dummyuuid/training-outputs')
            .expect(400)
            .end(function (err, res) {
                assert(!err, err);
                assert.equal(res.type, 'application/json');
                assert.equal(res.text, '{"reason":"model id not found"}');
                done();
            });
    });

    it('should throw 400 bad request for invalid modelid while retrieving status', function (done) {
        request(testhttpServer)
            .get('/v1/modelbuilder/dummyuuid/status')
            .expect(400)
            .end(function (err, res) {
                assert(!err, err);
                assert.equal(res.type, 'application/json');
                assert.equal(res.text, '{"reason":"model id not found"}');
                done();
            });
    });

    it('should throw 400 bad request for invalid modelid while retrieving stats', function (done) {
        request(testhttpServer)
            .get('/v1/modelbuilder/dummyuuid/statistics')
            .expect(400)
            .end(function (err, res) {
                assert(!err, err);
                assert.equal(res.type, 'application/json');
                assert.equal(res.text, '{"reason":"model id not found"}');
                done();
            });
    });


    it('should be able to download model with 200 OK', function (done) {
        request(testhttpServer)
            .get('/v1/modelbuilder/199dd3a2-1906-4a03-af8e-bae2bc4327c0')
            .expect(200)
            .end(function (err, res) {
                assert(!err, err);
                assert.equal(res.type, 'application/octet-stream');
                fs.readFile("test/upload/199dd3a2-1906-4a03-af8e-bae2bc4327c0/final_model/web2nl/final.model", function (err, data) {
                    assert.deepEqual(res.body, data);
                    done();
                })

            });
    });

    it('should be able to download training outputs in zip format', function (done) {
        request(testhttpServer)
            .get('/v1/modelbuilder/199dd3a2-1906-4a03-af8e-bae2bc4327c0/training-outputs')
            .expect(200)
            .end(function (err, res) {
                assert(!err, err);
                assert.equal(res.type, 'application/zip');
                assert(res.text);
                done();

            });
    });

    it('should be able to say training outputs in not ready', function (done) {
        request(testhttpServer)
            .get('/v1/modelbuilder/212a9eff-e4cb-43bb-a210-07c70e59dbe5/training-outputs')
            .expect(404)
            .end(function (err, res) {
                assert(!err, err);
                assert.equal(res.type, 'application/json');
                assert.equal(res.text, '{"reason":"model not ready yet!!"}');
                done();
            });
    });

    it('should show model created successful at the end', function (done) {
        request(testhttpServer)
            .get('/v1/modelbuilder/199dd3a2-1906-4a03-af8e-bae2bc4327c0/status')
            .expect(200)
            .end(function (err, res) {
                assert(!err, err);
                assert.equal(res.type, 'application/json');
                assert.equal(res.text, '{"status":"Model Created Successfully"}');
                done();
            });
    });

    it('should delete model and all its file', function (done) {
        var agent = request(testhttpServer);
        agent.post('/v1/modelbuilder')
            .query({'modelType': "normalization", 'encodingType': "UTF-8"})
            .field('isTest', true)
            .expect(202)
            .end(function (err, res) {
                assert(!err, err);
                assert(res.body);
                setTimeout(function () {
                    var modelid = res.body.link.split("/").pop();
                    fs.removeSync("./test/upload/input-*");
                    agent.del('/v1/modelbuilder/' + modelid)
                        .expect(200)
                        .end(function (err) {
                            assert(!err, err);
                        });
                    done();
                }, 300);
            });


    });

    it('should be able to download grxml files', function (done) {
        request(testhttpServer)
            .get('/v1/modelbuilder/199dd3a2-1906-4a03-af8e-bae2bc4327c0/grxml/word_classes_root.grxml')
            .expect(200)
            .end(function (err, res) {
                assert(!err, err);
                assert.equal(res.type, 'application/srgs+xml');
                done();

            });
    });
    
    it('should be able add speech support to existing model', function (done) {
        request(testhttpServer)
            .patch('/v1/modelbuilder/199dd3a2-1906-4a03-af8e-bae2bc4327c0?isTest=true')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .expect(202)
            .end(function (err, res) {
                assert(!err, err);
                done();
            });
    });

    it('should be able add speech support with unbundled as true', function (done) {
        request(testhttpServer)
            .patch('/v1/modelbuilder/199dd3a2-1906-4a03-af8e-bae2bc4327c0')
            .field('isTest', true)
            .query({'isUnbundled': "true", 'encodingType': "UTF-8"})
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .expect(202)
            .end(function (err, res) {
                assert(!err, err);
                done();
            });
    });

    it('should be able add speech support with digital hosted url provided', function (done) {
        request(testhttpServer)
            .patch('/v1/modelbuilder/199dd3a2-1906-4a03-af8e-bae2bc4327c0')
            .field('isTest', true)
            .query({'digitalHostedUrl': "http://digitalHostedUrl/digital", 'encodingType': "UTF-8"})
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .expect(202)
            .end(function (err, res) {
                assert(!err, err);
                done();
            });
    });

    it('should be able add speech support with custom word class file', function (done) {
        request(testhttpServer)
            .patch('/v1/modelbuilder/199dd3a2-1906-4a03-af8e-bae2bc4327c1')
            .field('isTest', true)
            .query({'digitalHostedUrl': "http://digitalHostedUrl/digital", 'encodingType': "UTF-8"})
            .query({'isUnbundled': "true", 'encodingType': "UTF-8"})
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .attach('customWordclassFile', path.join(__dirname, 'word_classes.txt'))
            .expect(202)
            .end(function (err, res) {
                assert(!err, err);
                setTimeout(function () {
                    assert(fs.existsSync("./test/upload/199dd3a2-1906-4a03-af8e-bae2bc4327c1/word_classes.txt"));
                    fs.removeSync("./test/upload/199dd3a2-1906-4a03-af8e-bae2bc4327c1/word_classes.txt");
                    fs.removeSync("./test/upload/199dd3a2-1906-4a03-af8e-bae2bc4327c1/status");
                    done();
                }, 300);
            });
    });

    it('should be able add speech support with unbundled as true', function (done) {
        var agent = request(testhttpServer);
        agent.post('/v1/modelbuilder')
            .field('isTest', true)
            .query({'isUnbundled': "true", 'encodingType': "UTF-8"})
            .attach('trainingFile', path.join(__dirname, 'SanityInput.txt'))
            .expect(202)
            .end(function (err, res) {
                assert(!err, err);
                assert(res.body);
                var modelid = res.body.link.split("/").pop();
                setTimeout(function () {
                    fs.removeSync("./test/upload/" + modelid);
                    fs.removeSync("./test/upload/input-*");
                    done();
                }, 300);
            });
    });

    it('should be able add speech support with custom word class file', function (done) {
        var agent = request(testhttpServer);
        agent.post('/v1/modelbuilder')
            .field('isTest', true)
            .field('unbundled', true)
            .attach('trainingFile', path.join(__dirname, 'SanityInput.txt'))
            .attach('customWordclassFile', path.join(__dirname, 'word_classes.txt'))
            .expect(202)
            .end(function (err, res) {
                assert(!err, err);
                assert(res.body);
                var modelid = res.body.link.split("/").pop();
                setTimeout(function () {
                    fs.removeSync("./test/upload/" + modelid);
                    fs.removeSync("./test/upload/input-*");
                    done();
                }, 300);
            });
    });


    it('should be able to download bundled speech model', function (done) {
        request(testhttpServer)
            .get('/v1/modelbuilder/bundled?isTest=true')
            .expect(200)
            .end(function (err, res) {
                assert(!err, err);
                fs.readFile("test/upload/bundled/final_model/speech/compiled_model.cfg", function (err, data) {
                    assert.deepEqual(res.body, data);
                    done();
                })
            });
    });

    it('should be able to download bundled speech model with speech endpoint', function (done) {
        request(testhttpServer)
            .get('/v1/modelbuilder/bundled/speech?isTest=true')
            .expect(200)
            .end(function (err, res) {
                assert(!err, err);
                fs.readFile("test/upload/bundled/final_model/speech/compiled_model.cfg", function (err, data) {
                    assert.deepEqual(res.body, data);
                    done();
                })
            });
    });

    it('should be able to download unbundled speech model', function (done) {
        request(testhttpServer)
            .get('/v1/modelbuilder/unbundled?isTest=true')
            .expect(200)
            .end(function (err, res) {
                assert(!err, err);
                assert.equal(res.type, 'application/zip');
                done();
            });
    });

    it('should be able to download only speech model for unbundled case', function (done) {
        request(testhttpServer)
            .get('/v1/modelbuilder/unbundled/speech?isTest=true')
            .expect(200)
            .end(function (err, res) {
                assert(!err, err);
                fs.readFile("test/upload/unbundled/final_model/speech/compiled_model.cfg", function (err, data) {
                    assert.deepEqual(res.body, data);
                    done();
                })
            });
    });



});
