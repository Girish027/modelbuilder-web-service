/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
'use strict';

const gulp = require('gulp'),
  logger = require('fancy-log'),
  swagTools = require('swagger-tools-wrapper'),
  fs = require('fs');

function lintSpec(cb) {
  const specPath = `${__dirname}/api/swagger.json`;
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));

  swagTools.specs.v2.validate(spec, (err, result) => {
    if (err) {
      cb(err);
    } else if (result && result.errors && result.errors.length) {
      const errors = result.errors;
      logger.error(`${errors.length} errors!`);
      logger.error(JSON.stringify(errors, undefined, 2));
      cb(`invalid ${specPath}`);
    } else {
      logger.info(`${specPath} is valid`);
      cb();
    }
  });
}

gulp.task('lint-spec', lintSpec);
gulp.task('lint', lintSpec);
gulp.task('default', lintSpec);
