const Memcached = require('memcached');
const { promisifyAll } = require('bluebird');
promisifyAll(Memcached);
const memcached = new Memcached('localhost:11211');
module.exports = memcached;
