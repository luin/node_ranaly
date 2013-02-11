/*jshint undef:false */
var assert = require('assert');
var redis = require('redis').createClient();
var sub = require('redis').createClient();
var ranaly = require('../index');
var client = ranaly.createClient(redis);

var Realtime = client.Realtime;

describe('Realtime', function () {
  var bucket = new Realtime('test');
  redis.del(bucket.key);

  describe('basic flow', function () {
    it('should return 0 if the key do not exists', function (done) {
      bucket.get(function (err, result) {
        assert.equal(typeof result, 'number');
        assert.equal(result, 0);
        done();
      });
    });

    it('should have default increment', function (done) {
      bucket.incr();
      bucket.get(function (err, result) {
        assert.equal(typeof result, 'number');
        assert.equal(result, 1);
        done();
      });
    });

    it('should accept custom increment', function (done) {
      bucket.incr(2);
      bucket.get(function (err, result) {
        assert.equal(typeof result, 'number');
        assert.equal(result, 3);
        done();
      });
    });

    it('should set correctly', function (done) {
      bucket.set('20');
      bucket.get(function (err, result) {
        assert.equal(typeof result, 'number');
        assert.equal(result, 20);
        done();
      });
    });

    it('should publish messages when the value has been changed', function (done) {
      sub.subscribe(bucket.key);
      sub.on('message', function (channel, message) {
        assert.equal(channel, bucket.key);
        assert.equal(message, '1');
        done();
      });
      bucket.set(1);
    });
  });
});

