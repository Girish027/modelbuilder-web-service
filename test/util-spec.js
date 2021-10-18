/*
  * 24/7 Customer, Inc. Confidential, Do Not Distribute. This is an
  * unpublished, proprietary work which is fully protected under
  * copyright law. This code may only be used pursuant to a valid
  * license from 24/7 Customer, Inc.
  */
'use strict';

const assert = require('assert'),
  libUtil = require('../lib/util');

describe('util', function() {
  describe('parseBool', function() {
    it('should behave as expected', function(done) {
      try {
        libUtil.parseBool(undefined, 'foo');
        assert.fail('Should have thrown exception');
      } catch (e) {
        // ignore; expected
      }

      // test defVal
      assert.equal(libUtil.parseBool(undefined, undefined), undefined);
      assert.equal(libUtil.parseBool(undefined, true), true);
      assert.equal(libUtil.parseBool(undefined, false), false);

      // test raw vals
      assert.equal(libUtil.parseBool('true'), true);
      assert.equal(libUtil.parseBool('on'), true);
      assert.equal(libUtil.parseBool('yes'), true);
      assert.equal(libUtil.parseBool('false'), false);
      assert.equal(libUtil.parseBool('off'), false);
      assert.equal(libUtil.parseBool('no'), false);
      assert.equal(libUtil.parseBool('foo'), undefined);
      assert.equal(libUtil.parseBool('foo', false), false);
      done();
    });
  });

  describe('parseInt', function() {
    it('should behave as expected', function(done) {
      try {
        libUtil.parseInteger(undefined, 'foo');
        assert.fail('Should have thrown exception');
      } catch (e) {
        // ignore; expected
      }

      // test defVal
      assert.equal(libUtil.parseInt(undefined, undefined), undefined);
      assert.equal(libUtil.parseInt(undefined, 10), 10);

      // test raw vals
      assert.equal(libUtil.parseInt('10'), 10);
      assert.equal(libUtil.parseInt(714), 714);
      assert.equal(libUtil.parseInt('foo'), undefined);
      assert.equal(libUtil.parseInt('foo', 11), 11);
      assert.equal(libUtil.parseInt('12.7567'), 12);
      assert.equal(libUtil.parseInt('12.7890', 13), 12);
      done();
    });
  });

  describe('parsePosInt', function() {
    it('should behave as expected', function(done) {
      assert.equal(libUtil.parsePosInt(undefined, 'foo', undefined), undefined);
      try {
        libUtil.parsePosInt(undefined, 'foo', 'foo');
        assert.fail('Should have thrown exception');
      } catch (e) {
        // ignore; expected
      }

      try {
        libUtil.parsePosInt(undefined, 'foo', '-5');
        assert.fail('Should have thrown exception');
      } catch (e) {
        // ignore; expected
      }

      // test defVal
      assert.equal(libUtil.parsePosInt(undefined, 'foo', 10), 10);
      assert.equal(libUtil.parsePosInt(undefined, 'foo', 7), 7);

      // test raw vals
      try {
        libUtil.parsePosInt('bar', 'foo');
        assert.fail('Should have thrown exception');
      } catch (e) {
        // ignore; expected
      }
      try {
        libUtil.parsePosInt(-3, 'foo');
        assert.fail('Should have thrown exception');
      } catch (e) {
        // ignore; expected
      }

      assert.equal(libUtil.parsePosInt(6, 'foo'), 6);
      assert.equal(libUtil.parsePosInt(12, 'foo'), 12);
      done();
    });
  });

  describe('jsonToObject', function() {
    const emptyJson = '{}';
    const goodJson = '{"parent": "foo", "children": [{"child": "bar1"}, {"child": "bar2"}]}';
    const expectedGood = {
      parent: 'foo',
      children: [
        { child: 'bar1' },
        { child: 'bar2' }
      ]
    };

    const badJson = '{"parent": "foo", "children": [{"child": "bar1"},]}';

    it('should behave as expected', function(done) {
      libUtil.jsonToObject(emptyJson, (err, obj) => {
        assert.equal(err, undefined);
        assert.deepStrictEqual(obj, {});
      });

      libUtil.jsonToObject(undefined, (err, obj) => {
        assert.equal(err, undefined);
        assert.equal(obj, undefined);
      });

      libUtil.jsonToObject(goodJson, (err, obj) => {
        assert.equal(err, undefined);
        assert.deepStrictEqual(obj, expectedGood);
      });

      libUtil.jsonToObject(badJson, (err, obj) => {
        assert(err);
        assert.equal(obj, undefined);
      });

      done();
    });
  });

  describe('getBareContentTypeFromHeader', function() {
    it('should behave as expected', function(done) {
      assert.equal(libUtil.getBareContentTypeFromHeader(), undefined);
      assert.equal(libUtil.getBareContentTypeFromHeader('application/x-foo'), 'application/x-foo');
      assert.equal(libUtil.getBareContentTypeFromHeader('application/x-foo; utf-8'), 'application/x-foo');
      done();
    });
  });
});
