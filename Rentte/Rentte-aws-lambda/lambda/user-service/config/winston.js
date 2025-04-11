const winston = require('winston');
const moment = require('moment-timezone');
const { SERVICE_NAME } = process.env;

// Custom JSON formatter for Winston
const jsonFormatter = winston.format((logEntry) => {
   const base = {
      timestamp: moment().tz('Asia/Kolkata')
         .format('YYYY-MM-DDTHH:mm:ss'),
      service: SERVICE_NAME, 
      env: process.env.NODE_ENV,
   };
   const formattedLogEntry = {
      ...base,
      ...logEntry,
   };
   return {
      ...formattedLogEntry,
      [Symbol.for('message')]: JSON.stringify(formattedLogEntry),
   };
});

// Global logging flag
const timezoneFormat = winston.format((info) => {
   return {
      ...info,
      timestamp: moment().tz('Asia/Kolkata')
         .format('YYYY-MM-DD HH:mm:ss'),
   };
});
const logger = winston.createLogger({
   level: 'info',
   format: winston.format.combine(
      jsonFormatter(),               
      timezoneFormat(),  
      winston.format.json(),   
   ),
   defaultMeta: { service: SERVICE_NAME },
   transports: new winston.transports.Console(),
   exitOnError: false,
});

module.exports = logger;
