const moment = require('moment-timezone');
const uuid = require("uuid");
const { NODE_ENV } = process.env;

module.exports = {
   sendResponse: (msg, res, statusCode, data = null, customeCode = 0) => {
      const finalData = {
         code: customeCode,
         message: msg,
         result: data === null ? {} : (data),
      };
      return res.status(statusCode).json(finalData);
   },
   commonLogger: () => {
      return {
         timestamp: moment().tz('Asia/Kolkata')
            .format('YYYY-MM-DDTHH:mm:ss'),
         correlationId: uuid.v4(),
         requestId: uuid.v4(),
         environment: NODE_ENV,
         level: 'info',
      };
   },
};
