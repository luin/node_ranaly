/*jshint undef:false */
var assert = require('assert');
var redis = require('redis-mock').createClient();
var ranaly = require('../index');
var client = ranaly.createClient(redis);

var Amount = client.Amount;

var aDay = 24 * 3600000;
describe('Amount', function () {
  var amount = new ranaly.Amount('demo');
  var hour;
  before(function (done) {
    amount._get(function (err, data) {
      hour = data;
      done();
    });
  });

  describe('incr', function () {
    it('should have default increment and unixTime', function (done) {
      amount.incr();
      hour += 1;
      amount._get(function (err, data) {
        assert.equal(hour, data);
        done();
      });
    });

    it('should accept custom increment', function (done) {
      amount.incr(2);
      hour += 2;
      amount._get(function (err, data) {
        assert.equal(hour, data);
        done();
      });
    });

    it('should accept custom date', function (done) {
      var yesterday = new Date(Date.now() - aDay);
      var yesterdayData;
      amount._get(yesterday, function (err, data) {
        yesterdayData = data;
        amount.incr(null, yesterday);
        amount.incr(10, yesterday);
        amount._get(yesterday, function (err, data) {
          assert.equal(yesterdayData + 11, data);
          done();
        });
      });
    });

  });

});

describe('Realtime', function () {
  var realtime = new ranaly.Realtime('demo');
  describe('set', function () {
    it('should set the value successfully', function (done) {
      realtime.set(10, function () {
        realtime.get(function (err, result) {
          assert.equal(10, result);
          done(err);
        });
      });
    });

  });

  describe('incr', function () {
    it('should increase the value successfully', function (done) {
      realtime.incr(function () {
        realtime.get(function (err, result) {
          assert.equal(11, result);
          done(err);
        });
      });
    });

    it('should accept a custom increment', function (done) {
      realtime.incr(10, function () {
        realtime.get(function (err, result) {
          assert.equal(21, result);
          done(err);
        });
      });
    });

  });
});
