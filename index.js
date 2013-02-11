var redis = require('redis');

exports.createClient = function (port, host, prefix) {
  if (typeof port === 'object') {
    exports.redisClient = port;
    prefix = host;
  } else {
    exports.redisClient = redis.createClient(port, host);
  }
  exports.prefix = prefix || 'Ranaly:';

  return {
    Amount: require('./type/amount')(exports),
    Realtime: require('./type/realtime')(exports),
    DataList: require('./type/data_list')(exports)
  };
};

