const rateLimit = require('express-rate-limit');
const { MESSAGE } = require('./constant');
const limiter = rateLimit({
   windowMs: 15 * 60 * 1000, // 15 minutes
   max: 100000, // Limit each IP to 100 requests per windowMs
   message: MESSAGE.RATE_LIMITER_MESSAGE,
});

module.exports = { limiter };
