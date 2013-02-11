var moment = require('moment');
var ZMSCORE = ' \
local result = {} \
local length = #ARGV \
for i = 1, length do \
  local score = 0 \
  if #ARGV[i] == 8 then \
    for j = 0, 23 do \
      local k = tostring(j) \
      if #k == 1 then \
        k = "0" .. k \
      end \
      local r = redis.call("zscore", KEYS[1], ARGV[i] .. k) \
      if r then \
        score = score + r \
      end \
    end \
  else \
    score = redis.call("zscore", KEYS[1], ARGV[i]) \
    if not score then \
      score = 0 \
    else \
      score = tonumber(score) \
    end \
  end \
  result[i] = score \
end \
return result \
';

var ZSUMSCORE = ' \
local length = #ARGV \
local score = 0 \
if #ARGV >= 1 then \
  for i = 1, length do \
    if #ARGV[i] == 8 then \
      for j = 0, 23 do \
        local k = tostring(j) \
        if #k == 1 then \
          k = "0" .. k \
        end \
        local result = redis.call("zscore", KEYS[1], ARGV[i] .. k) \
        if result then \
          score = score + result \
        end \
      end \
    else \
      local result = redis.call("zscore", KEYS[1], ARGV[i]) \
      if result then \
        score = score + result \
      end \
    end \
  end \
else \
  local result = redis.call("get", KEYS[1] .. ":TOTAL") \
  if result then \
    score = tonumber(result) \
  end \
end \
return score \
';
module.exports = function (ranaly) {
  var db = ranaly.redisClient;

  var Amount = function (bucket) {
    this.bucket = bucket;
    this.key = ranaly.prefix + 'AMOUNT' + ':' + this.bucket;
  };

  Amount.prototype.incr = function (increment, when, callback) {
    if (typeof increment === 'function') {
      callback = increment;
      increment = void 0;
    } else if (typeof when === 'function') {
      callback = when;
      when = void 0;
    }
    if (typeof increment !== 'number') {
      increment = 1;
    }
    when = moment(when);
    db.multi()
      .incrby(this.key + ':TOTAL', increment)
      .zincrby(this.key, increment,when.format('YYYYMMDDHH'))
      .exec(function (err, result) {
        if (typeof callback === 'function') {
          callback(err, Array.isArray(result) ? result[0] : result);
        }
      });
  };

  Amount.prototype.get = function (timeList, callback) {
    var next = function (err, result) {
      callback(err, result);
    };
    db['eval'].apply(db, [ZMSCORE].concat(1).concat(this.key).concat(timeList).concat(next));
  };

  Amount.prototype.sum = function (timeList, callback) {
    var next = function (err, result) {
      callback(err, result);
    };
    var tl = [ZSUMSCORE].concat(1).concat(this.key);
    if (Array.isArray(timeList) && timeList.length > 0) {
      tl = tl.concat(timeList).concat(next);
    } else {
      tl = tl.concat(next);
    }
    db['eval'].apply(db, tl);
  };

  return Amount;
};

