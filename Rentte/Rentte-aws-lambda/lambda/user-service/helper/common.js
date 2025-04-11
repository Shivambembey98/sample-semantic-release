const moment = require('moment-timezone');
module.exports = {
   formatDate: (inputDate) => {
      const parsedDate = moment.tz(inputDate, 'DD-MM-YYYY', 'UTC');
      return parsedDate.format('YYYY-MM-DD');
   },
};
