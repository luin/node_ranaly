module.exports = function (ranaly) {
  var db = ranaly.redisClient;

  var Realtime = function (bucket) {
    this.bucket = bucket;
    this.key = ranaly.prefix + 'REALTIME' + ':' + this.bucket;
  };

  Realtime.prototype.incr = function (increment, callback) {
    if (typeof increment === 'function') {
      callback = increment;
      increment = void 0;
    }
    if (typeof increment !== 'number') {
      increment = 1;
    }

    db.incrby(this.key, increment, function (err, result) {
      if (!err) {
        db.publish(this.key, result);
      }
      if (typeof callback === 'function') {
        callback(err, result);
      }
    });
  };

  Realtime.prototype.get = function (callback) {
    db.get(this.key, function (err, result) {
      callback(err, parseInt(result, 10) || 0);
    });
  };

  Realtime.prototype.set = function (value, callback) {
    value = parseInt(value, 10) || 0;
    db.set(this.key, value, callback);
    console.log('Publish To: ' + this.key);
    db.publish(this.key, value);
  };

  return Realtime;
};
