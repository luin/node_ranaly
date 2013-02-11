module.exports = function (ranaly) {
  var db = ranaly.redisClient;

  var DataList = function (bucket) {
    this.bucket = bucket;
    this.key = ranaly.prefix + 'DATALIST' + ':' + this.bucket;
  };

  DataList.prototype.push = function (data, trim, callback) {
    if (typeof trim === 'function') {
      callback = trim;
      trim = void 0;
    }
    if (typeof trim === 'string') {
      trim = parseInt(trim, 10);
    }
    if (typeof trim !== 'number') {
      trim = 100;
    }

    db.multi()
        .lpush(this.key, JSON.stringify(data))
        .ltrim(this.key, 0, trim - 1)
        .exec(function (err, result) {
          if (typeof callback === 'function') {
            if (!err) result = result[0];
            callback(err, result);
          }
        });
  };

  DataList.prototype.range = function (start, stop, callback) {
    db.lrange(this.key, start, stop, function (err, result) {
      if (!err && Array.isArray(result)) {
        result = result.map(function (r) {
          return JSON.parse(r);
        });
      }
      callback(err, result);
    });
  };

  DataList.prototype.len = function (callback) {
    db.llen(this.key, callback);
  };

  return DataList;
};
