/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
'use strict';

module.exports = {
  /**
     * TODO: The name of the service
     * @type {string}
     */
  SERVICE_NAME: 'orion-model-generator',

  /**
     * Disabled header
     * @type {string}
     * @private
     */
  X_POWERED_BY: 'x-powered-by',

  /**
     * Header that reflects the active version of the service
     * Used by the health check
     * @type {string}
     * @private
     */
  X_SERVICE_VERSION_HEADER: 'X-TFS-Service-Version',

  /**
     * Common MIME types
     * @type {string}
     */
  MIME_APP_URLENCODED: 'application/x-www-form-urlencoded',
  MIME_APP_JSON: 'application/json',
  MIME_APP_XML: 'application/xml',

  /**
     * Body parser erros
     * @type {string}
     */
  BODY_PARSER_ERR_REQUEST_ABORTED: 'request.aborted'
};
