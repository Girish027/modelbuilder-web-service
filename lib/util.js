/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
'use strict';

const Assert = require('node-assert'),
  libJSXML = require('node-jstoxmlstream'),
  libPath = require('path'),
  fs = require('fs');

module.exports = {
  parseBool,
  parseInt: parseInteger,
  parsePosInt,
  jsonToObject,
  makeNonCacheable,
  getBareContentType,
  getBareContentTypeFromHeader,
  streamXMLResponse,
  readVersion
};

const RX_TRUE = /^(?:(true|yes|on|1))$/i;
const RX_FALSE = /^(?:(false|no|off|0))$/i;

/**
 * Attempts to parse the raw value as a Boolean value
 * @param  {string} raw    The raw value to be parsed
 * @param  {boolean} [defVal] A fallback value if raw is unspecified
 *   or it cannot be parsed as a boolean
 * @return {boolean|undefined} The parsed value or undefined if the value cannot be parsed
 *   and no default was specified
 */
function parseBool(raw, defVal) {
  if (defVal !== undefined) {
    Assert.isBoolean(defVal);
  }

  if (raw === undefined) {
    return defVal;
  }

  let ret = defVal;
  if (RX_TRUE.test(raw)) {
    ret = true;
  } else if (RX_FALSE.test(raw)) {
    ret = false;
  }

  return ret;
}

function parseInteger(raw, defVal) {
  if (defVal !== undefined) {
    Assert.isNumber(defVal);
  }

  if (raw === undefined) {
    return defVal;
  }

  let ret = parseInt(raw, 10);
  if (Number.isNaN(ret)) {
    ret = defVal;
  }

  return ret;
}

function parsePosInt(val, name, defVal) {
  if (val) {
    Assert.isNumberExclusive(val, name, 0);
  } else if (defVal) {
    Assert.isNumberExclusive(defVal, `${name}, default value`, 0);
    val = defVal;
  }

  return val;
}

/**
 * Attempts to rehydrate a JSON string into an object
 * @param  {string}   str      The JSON string
 * @param  {Function} callback The function to invoke with the parse error or the parsed object
 * @private
 */
function jsonToObject(str, callback) {
  let err,
    obj;

  if (str) {
    try {
      obj = JSON.parse(str);
    } catch (e) {
      err = e;
    }
  }

  callback(err, obj);
}

/**
 * Make the HTTP response non-cacheable
 * @param  {Object} resp An HTTP response
 * @return {Object} The HTTP response passed in via the resp parameter
 */
function makeNonCacheable(resp) {
  return resp.set('Expires', 0)
    .set('Cache-Control', 'no-store, no-cache, must-revalidate')
    .set('Pragma', 'no-cache');
}

const RX_CONTENTTYPE_DELIM = /\s*;\s*/;

/**
 * Returns the content-type stripped of any charset attribute
 * @param  {Object} req The HTTP request
 * @return {string} The value of the content-type HTTP request header
 */
function getBareContentType(req) {
  return getBareContentTypeFromHeader(req.get('content-type'));
}

function getBareContentTypeFromHeader(ctype) {
  if (ctype) {
    ctype = ctype.split(RX_CONTENTTYPE_DELIM)[0];
  }

  return ctype;
}

/**
 * Reads the service version from the manifest (package.json)
 * @return {string} The application version
 */
function readVersion() {
  const manifestPath = libPath.resolve(`${__dirname}/../package.json`);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  return manifest.version;
}

/**
 * Streams an object in XML format back to the client
 * @param  {Object} response The HTTP response
 * @param  {string} rootName The XML root document element name
 * @param  {Object} obj The object to convert to XML
 */
function streamXMLResponse(response, rootName, obj) {
  libJSXML.toXML(obj,
    {
      rootName
    }).pipe(response);
}
