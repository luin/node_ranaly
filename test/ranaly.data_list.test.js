/*jshint undef:false */
var assert = require('assert');
var redis = require('redis').createClient();
var ranaly = require('../index');
var client = ranaly.createClient(redis);

var DataList = client.DataList;

describe('DataList', function () {
  var bucket = new DataList('test');
  redis.del(bucket.key);

  describe('basic flow', function () {
    it('should have a length of 0', function (done) {
      bucket.len(function (err, result) {
        assert.equal(typeof result, 'number');
        assert.equal(result, 0);
        done();
      });
    });

    it('should be able to push a string', function (done) {
      bucket.push('hi', function (err, result) {
        assert.equal(typeof result, 'number');
        assert.equal(result, 1);
        done();
      });
    });

    it('should be able to push a object', function (done) {
      bucket.push({text: 'hi'}, function (err, result) {
        assert.equal(typeof result, 'number');
        assert.equal(result, 2);
        done();
      });
    });

    it('should return the correct length', function (done) {
      bucket.len(function (err, result) {
        assert.equal(typeof result, 'number');
        assert.equal(result, 2);
        done();
      });
    });

    it('should return the data correctly', function (done) {
      bucket.range(0, -1, function (err, results) {
        assert.equal(typeof results[0], 'object');
        assert.equal(results[0].text, 'hi');
        assert.equal(results[1], 'hi');
        done();
      });
    });

    it('should trim correctly', function (done) {
      bucket.push(1, 3);
      bucket.push(2, 3);
      bucket.push(3, 3);
      bucket.len(function (err, result) {
        assert.equal(typeof result, 'number');
        assert.equal(result, 3);
        done();
      });
    });

  });
});

