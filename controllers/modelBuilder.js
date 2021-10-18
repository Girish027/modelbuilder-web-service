/*
 * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
 * unpublished, proprietary work which is fully protected under
 * copyright law. This code may only be used pursuant to a valid
 * license from 24/7 Customer, Inc.
 */
"use strict";

const libUtil = require("../lib/util");
const webLinks = require("node-weblinks");
const uuid = require("uuid");
var fs = require('fs-extra');
const es = require("event-stream");
var url = require('url');
var path = require('path');
var rmdir = require('rimraf');
var Enum = require("enum");
var FileType = new Enum(['TRAINING_FILE', 'CONFIG_FILE']);

module.exports.getModelStatistics = function (req, res, next) {
    let logger = req.app.locals.logger;
    let params = req.swagger.params;
    logger.debug("Getting model with id: " + params.id.value);
    sendResponse(req, res, logger, req.app.locals.modelBuilderStorage, params.id.value, "/model_stats.xlsx");
};

module.exports.getExternalModelStatistics = function (req, res, next) {
    let logger = req.app.locals.logger;
    let params = req.swagger.params;
    logger.debug("Getting extrnal model stats with id: " + params.id.value);
    sendResponse(req, res, logger, req.app.locals.modelBuilderStorage, params.id.value, "/model_stats_external.xlsx");
};

module.exports.getModel = function (req, res, next) {
    let logger = req.app.locals.logger;
    let params = req.swagger.params;
    logger.debug("Getting model with id: " + params.id.value);
    sendResponse(req, res, logger, req.app.locals.modelBuilderStorage, params.id.value, "/final_model");
};

module.exports.getDigitalModel = function (req, res, next) {
    let logger = req.app.locals.logger;
    let params = req.swagger.params;
    logger.debug("Getting digital model with id: " + params.id.value);
    sendResponse(req, res, logger, req.app.locals.modelBuilderStorage, params.id.value, "/final_model/web2nl/final.model");
};

module.exports.getSpeechModel = function (req, res, next) {
    let logger = req.app.locals.logger;
    let params = req.swagger.params;
    logger.debug("Getting speech model with id: " + params.id.value);
    sendResponse(req, res, logger, req.app.locals.modelBuilderStorage, params.id.value, "/final_model/speech/compiled_model.cfg");
};

module.exports.getSLMModel = function (req, res, next) {
    let logger = req.app.locals.logger;
    let params = req.swagger.params;
    logger.debug("Getting speech model with id: " + params.id.value);
    sendResponse(req, res, logger, req.app.locals.modelBuilderStorage, params.id.value, "/slm_model");
};

module.exports.getInterCfgModel = function (req, res, next) {
    let logger = req.app.locals.logger;
    let params = req.swagger.params;
    logger.debug("Getting speech model with id: " + params.id.value);
    sendResponse(req, res, logger, req.app.locals.modelBuilderStorage, params.id.value, "/Inter/inter.cfg");
};

function getFinalModelPath(req,res,locations,modelid) {
    if (fs.existsSync(locations[0] + "/" + modelid)) {
        return locations[0] + "/" + modelid;
    } else if (fs.existsSync(locations[1] + "/" + modelid)) {
        return locations[1] + "/" + modelid;
    } else {
        // Do something
        return undefined;

    }
}

function sendModelNotFoundError(res) {
    let obj = {reason: 'model id not found'};
    res.status(400);
    res.format({
        // JSON MUST be first: it is the default format
        'application/json': function () {
            res.json(obj);
        },
        'application/xml': function () {
            libUtil.streamXMLResponse(res, 'model', obj);
        }
    });
    return;
}

module.exports.deleteModel = function (req, res, next) {
    let logger = req.app.locals.logger;
    let params = req.swagger.params;
    logger.debug("Deleting model with id: " + params.id.value);
    var modelid = params.id.value;
    var finalModelPath = null
    var locations = req.app.locals.modelBuilderStorage.split(',');
    res.setHeader("X-Frame-Options", "DENY");
    finalModelPath = getFinalModelPath(req,res,locations,modelid);
    if (typeof finalModelPath === 'undefined') {
        sendModelNotFoundError(res);
        return;
    }

    rmdir(finalModelPath, function (err) {
        if (!err) {
            res.status(200).end();
        }
        if (err) {
            logger.error("Failed while deleting model with uuid: " + params.id.value)
            res.status(500).end("Failed deleting model. Try again later!!")
        }
    });
}

module.exports.getTrainingOutputs = function (req, res, next) {
    let logger = req.app.locals.logger;
    let params = req.swagger.params;
    logger.debug("Getting model training outputs with id: " + params.id.value);
    sendResponse(req, res, logger, req.app.locals.modelBuilderStorage, params.id.value, "/trainingOutputs.zip");
};

module.exports.getGRXML = function (req, res, next) {
    let logger = req.app.locals.logger;
    let params = req.swagger.params;
    let fileName = params.filename.value;
    logger.info("Getting GRXMl file generated for model id: " + params.id.value);
    sendResponse(req, res, logger, req.app.locals.modelBuilderStorage, params.id.value, "/grxml/" + fileName);
};

module.exports.getModelStatus = function (req, res, next) {
    let logger = req.app.locals.logger;
    let params = req.swagger.params;
    logger.debug("Getting model status with id: " + params.id.value);
    var modelid = params.id.value;
    var finalModelPath = null;
    res.setHeader("X-Frame-Options", "DENY");
    var locations = req.app.locals.modelBuilderStorage.split(',');
    finalModelPath = getFinalModelPath(req,res,locations,modelid);
    if (typeof finalModelPath === 'undefined') {
        sendModelNotFoundError(res);
        return;
    }
    let statusFile = finalModelPath + '/status';
    fs.readFile(statusFile, "utf8", function (err, data) {
        // Do something
        var lines = data.trim().split('\n');
        var lastLine = lines.slice(-1)[0];
        let obj = {status: lastLine};
        res.status(200);
        res.format({
            // JSON MUST be first: it is the default format
            'application/json': function () {
                res.json(obj);
            },
            'application/xml': function () {
                libUtil.streamXMLResponse(res, 'model', obj);
            }
        });
    });
};

function sendResponse(req, res, logger, modelLocation, modelid, entityPath) {
    var finalModelPath = null;
    var locations = modelLocation.split(',');
    res.setHeader("X-Frame-Options", "DENY");
    finalModelPath = getFinalModelPath(req,res,locations,modelid);
    if (typeof finalModelPath === 'undefined') {
        sendModelNotFoundError(res);
        return;
    }
    if (entityPath === '/final_model') {
        if (fs.existsSync(finalModelPath + '/final_model/model.zip')) {
            logger.info("Downloading speech unbundled model for " + modelid);
            entityPath = finalModelPath + '/final_model/model.zip';
        } else if (fs.existsSync(finalModelPath + '/final_model/speech/compiled_model.cfg')) {
            logger.info("Downloading speech bundled model for " + modelid);
            entityPath = finalModelPath + '/final_model/speech/compiled_model.cfg';
        } else {
            logger.info("Downloading digital model for " + modelid);
            entityPath = finalModelPath + '/final_model/web2nl/final.model';
        }
    }
    else if (entityPath === '/slm_model')  {
        if (fs.existsSync(finalModelPath + '/slm_model/model.zip')) {
            logger.info("Downloading SLM unbundled model for " + modelid);
            entityPath = finalModelPath + '/slm_model/model.zip';
        } else {
            logger.info("Downloading SLM bundled model for " + modelid);
            entityPath = finalModelPath + '/Inter/inter.cfg';
        }
    } else {
        entityPath = finalModelPath + entityPath
    }
    if (!fs.existsSync(entityPath)) {
        res.status(404);
        let obj = {reason: 'model not ready yet!!'};
        res.format({
            // JSON MUST be first: it is the default format
            'application/json': function () {
                res.json(obj);
            },
            'application/xml': function () {
                libUtil.streamXMLResponse(res, 'model', null);
            }
        });
    } else {
        res.status(200);
        res.set("Cache-Control", "public, max-age=86400");
        logger.info("Downloading from: " + entityPath);
        res.download(entityPath);
    }
}

module.exports.addSpeechSupport = function (req, res, next) {

    let logger = req.app.locals.logger;
    let params = req.swagger.params;
    let modelId = params.id.value;
    res.setHeader("X-Frame-Options", "DENY");
    logger.info("Adding speech support for model id: " + modelId);
    var queryParams = require('url').parse(req.url, true).query;
    var isUnbundled = queryParams.isUnbundled ? queryParams.isUnbundled : "false";
    var digitalHostedUrl = queryParams.digitalHostedUrl ? queryParams.digitalHostedUrl : "";
    var isSpeechConfigUploaded = false;
    var uploadedSpeechConfigFilename = null;
    var modelBuilderstorage = null;
    let modelType = queryParams.modelType ? queryParams.modelType : "speech";
    var modelLocation, destinationTrainingFile;
    var tfClient = queryParams.tfClient ? queryParams.tfClient : null;
    var modelTechnology = queryParams.modelTechnology ? queryParams.modelTechnology : null;
    var modelName = queryParams.modelName ? queryParams.modelName : null;
    var vectorizerVersion = queryParams.vectorizerVersion ? queryParams.vectorizerVersion : null;
    var locations = req.app.locals.modelBuilderStorage.split(',');
    var isTrainingFileUploaded = false;
    var uploadedTrainingFilename = null;

    if (req.files) {
        req.files.forEach(function (value) {
            if (value.fieldname == 'customWordclassFile') {
                isSpeechConfigUploaded = true;
                uploadedSpeechConfigFilename = value.filename;
            }
            if (value.fieldname == 'trainingFile') {
                isTrainingFileUploaded = true;
                uploadedTrainingFilename = value.filename;
            }
        });
    }

    if (fs.existsSync(locations[0] + "/" + modelId)) {
        modelBuilderstorage = locations[0];
        modelLocation = modelBuilderstorage + "/" + modelId;
    } else if (fs.existsSync(locations[1] + "/" + modelId)) {
        modelBuilderstorage = locations[1];
        modelLocation = modelBuilderstorage + "/" + modelId;
    } else {
        // Do something
        let obj = {reason: 'cannot add speech support to non existing digital model'};
        res.status(400);
        res.format({
            // JSON MUST be first: it is the default format
            'application/json': function () {
                res.json(obj);
            },
            'application/xml': function () {
                libUtil.streamXMLResponse(res, 'model', obj);
            }
        });
        return
    }

    if (isTrainingFileUploaded === true) {
        destinationTrainingFile = modelLocation + "/data/input-" + Date.now();
    }
    var waitfor;
    var destinationWordClassFile = modelLocation + "/word_classes.txt";
    let statusFile = modelLocation + '/status';

    if (isSpeechConfigUploaded === true) {
        logger.info("moving uploaded custom word class file to be used for SLM modelbuilding")
        waitfor = moveFile(modelBuilderstorage + "/" + uploadedSpeechConfigFilename,
            destinationWordClassFile, statusFile, FileType.CONFIG_FILE, logger);
    } else {
        waitfor = Promise.resolve(undefined)
    }

    waitfor.then(function () {
        if (isTrainingFileUploaded === true) {
            logger.info("Moving Training dataset for ModelBuilding")
            return moveFile(modelBuilderstorage + "/" + uploadedTrainingFilename,
                destinationTrainingFile, statusFile, FileType.TRAINING_FILE, logger);
        } else {
            return Promise.resolve(undefined)
        }
    }).then(function () {
        if (!req.body.isTest) {
            var celery = require("./celery-sentinel"),
                client = celery.createClient({
                    CELERY_SENTINEL_BROKER_URLS: req.app.locals.redisEndpoints,
                    CELERY_MASTER_NAME: req.app.locals.redisClusterName,
                    CELERY_OPTS: {}
                });
            client.on('error', function (err) {
                logger.error("Failed while posting to modelbuilder worker" + err);
            });
            client.on('connect', function (err) {
                client.call('Task.generateModel', [modelId, modelType, isUnbundled, digitalHostedUrl, destinationTrainingFile, tfClient, modelTechnology, modelName, vectorizerVersion], function (result) {
                    client.end();
                });
            });
            fs.appendFileSync(statusFile, "Successfully posted it to ModelBuilder queue, Waiting for worker!!\n");
            logger.info("Successfully posted it to ModelBuilder queue, Waiting for worker!! ");
        }
        return Promise.resolve(undefined)
    }).catch(err => {
        fs.appendFileSync(statusFile, "Failed posting model to modelbuilder worker: " + err + "\n");
        logger.error(err);
    });


    // Sending the response back
    let resourceId = req.header("X-Forwarded-URL");
    let obj;
    if (resourceId) {
        obj = {link: url.resolve(resourceId.trim(), modelId)};
    } else {
        obj = {link: webLinks.getResourceLink(req, {resourceId: modelId})};
    }
    res.status(202);
    res.format({
        // JSON MUST be first: it is the default format
        'application/json': function () {
            res.json(obj);
        },
        'application/xml': function () {
            libUtil.streamXMLResponse(res, 'model', obj);
        }
    })
};

module.exports.generateModel = function (req, res, next) {
    let logger = req.app.locals.logger;

    var locations = req.app.locals.modelBuilderStorage.split(',');
    var modelBuilderstorage = locations[0]
    logger.info(modelBuilderstorage)
    var model_uid = uuid();
    res.setHeader("X-Frame-Options", "DENY");
    logger.info("Queuing job for model UUID: " + model_uid);
    var queryParams = require('url').parse(req.url, true).query;
    var modelType = queryParams.modelType ? queryParams.modelType : "classifier";
    var tfClient = queryParams.tfClient ? queryParams.tfClient : null;
    var modelTechnology = queryParams.modelTechnology ? queryParams.modelTechnology : null;
    var modelName = queryParams.modelName ? queryParams.modelName : null;
    var vectorizerVersion = queryParams.vectorizerVersion ? queryParams.vectorizerVersion : null;
    var isUnbundled = queryParams.isUnbundled ? queryParams.isUnbundled : "false";
    var digitalHostedUrl = queryParams.digitalHostedUrl ? queryParams.digitalHostedUrl : "";
    var isTrainingFileUploaded = false;
    var isConfigFileUploaded = false;
    var isSpeechConfigUploaded = false;
    var uploadedTrainingFilename = null;
    var uploadedConfigFilename = null;
    var uploadedSpeechConfigFilename = null;
    if (req.files) {
        req.files.forEach(function (value) {
            if (value.fieldname == 'trainingFile') {
                isTrainingFileUploaded = true;
                uploadedTrainingFilename = value.filename;
            }
            if (value.fieldname == 'configuration') {
                isConfigFileUploaded = true;
                uploadedConfigFilename = value.filename;
            }
            if (value.fieldname == 'customWordclassFile') {
                isSpeechConfigUploaded = true;
                uploadedSpeechConfigFilename = value.filename;
            }
        });
    }
    if ((modelType === 'classifier' || modelType === 'speech') && !isTrainingFileUploaded) {
        let obj = {reason: 'Training file not uploaded for training classification model!!'};
        res.status(400);
        res.format({
            // JSON MUST be first: it is the default format
            'application/json': function () {
                res.json(obj);
            },
            'application/xml': function () {
                libUtil.streamXMLResponse(res, 'model', obj);
            }
        });
        return;
    }

    // Create directory specified by modelUUID (Create if not exists)
    var dir = modelBuilderstorage + "/" + model_uid;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
        fs.chmodSync(dir, 0o777)
    }

    var statusFilePath = dir + "/status"
    var destinationTrainingFile = dir + "/data/input-" + Date.now();
    var destinationConfigFile = dir + "/config.json";
    var destinationWordClassFile = dir + "/word_classes.txt";
    var waitfor;
    if (isConfigFileUploaded === true) {
        waitfor = moveFile(modelBuilderstorage + "/" + uploadedConfigFilename,
            destinationConfigFile, statusFilePath, FileType.CONFIG_FILE, logger);
    } else {
        waitfor = Promise.resolve(undefined)
    }
    waitfor.then(function () {
        if (modelType === 'classifier' || modelType === 'speech') {
            return moveFile(modelBuilderstorage + "/" + uploadedTrainingFilename,
                destinationTrainingFile, statusFilePath, FileType.TRAINING_FILE, logger);
        } else {
             return Promise.resolve(undefined)
        }
    }).then(function () {
        if (isSpeechConfigUploaded === true) {
            logger.info("moving uploaded custom word class file to be used for SLM modelbuilding")
            waitfor = moveFile(modelBuilderstorage + "/" + uploadedSpeechConfigFilename,
                destinationWordClassFile, statusFilePath, FileType.CONFIG_FILE, logger);
        } else {
            return Promise.resolve(undefined)
        }
    }).then(function () {
        if (!req.body.isTest) {
            fs.chmodSync(statusFilePath, 0o777)
            var celery = require("./celery-sentinel"),
                client = celery.createClient({
                    CELERY_SENTINEL_BROKER_URLS: req.app.locals.redisEndpoints,
                    CELERY_MASTER_NAME: req.app.locals.redisClusterName,
                    CELERY_OPTS: {}
                })
            client.on('error', function (err) {
                logger.error("Failed while posting to modelbuilder worker" + err);
            });
            client.on('connect', function (err) {
                client.call('Task.generateModel', [model_uid, modelType, isUnbundled, digitalHostedUrl, destinationTrainingFile, tfClient, modelTechnology, modelName, vectorizerVersion], function (result) {
                    client.end();
                });
            })
            fs.appendFileSync(statusFilePath, "Successfully posted it to ModelBuilder queue, Waiting for worker!!\n");
            logger.info("Successfully posted it to ModelBuilder queue, Waiting for worker!! ");
        }
        return Promise.resolve(undefined)
    }).catch(err => {
        fs.appendFileSync(statusFilePath, "Failed posting model to modelbuilder worker: " + err + "\n");
        logger.error(err);
    });

    // Sending the response back
    let resourceId = req.header("X-Forwarded-URL");
    let obj;
    if (resourceId) {
        obj = {link: url.resolve(resourceId.trim(), model_uid)};
    } else {
        obj = {link: webLinks.getResourceLink(req, {resourceId: model_uid})};
    }
    res.status(202);
    res.format({
        // JSON MUST be first: it is the default format
        'application/json': function () {
            res.json(obj);
        },
        'application/xml': function () {
            libUtil.streamXMLResponse(res, 'model', obj);
        }
    });
};

function moveFile(src, dest, statusFilePath, type, logger) {
    return new Promise(function (resolve, reject) {
        fs.move(src, dest, {overwrite: true}, function (err) {
            if (err) {
                logger.error("Failed while moving file to " + dest);
                fs.appendFileSync(statusFilePath, "Failed while moving file to " + dest);
                reject(err);
            } else {
                fs.chmodSync(dest, 0o777);
                if (type === FileType.TRAINING_FILE) {
                    var filename = path.parse(dest).base;
                    var filePath = path.dirname(dest);
                    fs.readdir(filePath, (error, files) => {
                        if (error) {
                            logger.error("Failed while removing older input files");
                            reject(error);
                        }
                        files.forEach(file => {
                            const fileDir = path.join(filePath, file);
                            if (file !== filename) {
                                fs.unlinkSync(fileDir);
                            }
                        });
                    });
                }
                fs.appendFileSync(statusFilePath, "Uploaded successfully: " + dest + "\n");
                logger.info("Upload successful: " + dest);
                if (type === FileType.TRAINING_FILE) {
                    resolve(validateTrainingFile(dest, logger));
                } else {
                    resolve(undefined);
                }
            }
        })
    })
}

function validateTrainingFile(path, logger) {
    // Return new promise
    return new Promise(function (resolve, reject) {
        logger.info('Validating training data...');
        let count = 0;
        fs.createReadStream(path, { encoding: 'utf-8'})
        .pipe(es.split('\n'))
        .on('error', (error) => {
            logger.error('Failed while attempting to validate file: ' + error);
            reject(error);
        })
        .pipe(es.mapSync(function(data) {
            count = count + 1;
            data = data.replace(/^\uFEFF/, '');
            return data.split('\t');
        }))
        .on('error', (error) => {
            logger.error('Failed while attempting to validate file: ' + error);
            reject(error);
        })
        .pipe(es.mapSync(function(data) {
            if (count === 1) {
                if ((data[0] !== '"intent"') || (data[1] !== '"transcription"')) {
                    throw new Error('File format should be intent|transcription|..');
                }
            }
        }))
        .on('error', (error) => {
            logger.error('Failed while attempting to validate file: ' + error);
            reject(error);
        })
        .on('end', function () {
            logger.info('validated Successfully');
            resolve(undefined);
        })
    })
}