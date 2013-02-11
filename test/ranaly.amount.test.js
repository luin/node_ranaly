/*jshint undef:false */
var assert = require('assert');
var moment = require('moment');
var redis = require('redis').createClient();
var ranaly = require('../index');
var client = ranaly.createClient(redis);

var Amount = client.Amount;

var aDay = 24 * 3600000;
var yesterday = new Date(Date.now() - aDay);
describe('Amount', function () {
  var bucket = new Amount('test');
  redis.del(bucket.key);

  describe('basic flow', function () {
    it('should return 0 if the key do not exists', function (done) {
      bucket.get(['20130101', '2013010203'], function (err, results) {
        assert.equal(results.length, 2);
        assert.equal(results[0], 0);
        assert.equal(results[1], 0);
        done();
      });
    });

    it('should have default increment and unixTime', function (done) {
      bucket.incr();
      bucket.get([moment().format('YYYYMMDD'), moment().format('YYYYMMDDHH')], function (err, results) {
        assert.equal(results.length, 2);
        assert.equal(results[0], 1);
        assert.equal(results[1], 1);
        done();
      });
    });

    it('should accept custom increment', function (done) {
      bucket.incr(2);
      bucket.get([moment().format('YYYYMMDD'), moment().format('YYYYMMDDHH')], function (err, results) {
        assert.equal(results.length, 2);
        assert.equal(results[0], 3);
        assert.equal(results[1], 3);
        done();
      });
    });

    it('should accept custom date', function (done) {
      bucket.incr(null, yesterday);
      bucket.incr(10, yesterday);
      bucket.get([moment(yesterday).format('YYYYMMDD'), moment(yesterday).format('YYYYMMDDHH')], function (err, results) {
        assert.equal(results.length, 2);
        assert.equal(results[0], 11);
        assert.equal(results[1], 11);
        done();
      });
    });

    it('should sum up the amount correctly', function (done) {
      bucket.sum([moment().format('YYYYMMDD'), moment(yesterday).format('YYYYMMDDHH')], function (err, sum) {
        assert.equal(typeof sum, 'number');
        assert.equal(sum, 14);
        done();
      });
    });

  });
});

