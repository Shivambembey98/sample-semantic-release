const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
require('dotenv').config();
const apiRoutes = require('./routes/api');
const passport = require("passport");
const swaggerDoc = require('./helper/swagger');
const app = express();
// const { limiter } = require('./config/rateLimiter');
const logger = require('./config/winston');
// Middleware setup
// app.use(limiter)
app.use(express.json({ limit: '50mb' })); // To parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded request bodies
if (process.env.PRODUCTION === true) {
   const whitelist = ['http://localhost:*','http://localhost:3000'];
   const corsOptions = {
      origin(origin, callback) {
         if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
         } else {
            callback({ err: new Error('Not allowed for you') });
         }
      },
   };
   app.use(cors(corsOptions));
}
else {
   app.use(cors());
}
app.use(passport.initialize());
require("./config/passport")(passport);
swaggerDoc(app, process.env.PORT);
// Route setup
app.use('/', apiRoutes);


const server = require('http').createServer(app);
server.listen(process.env.PORT, () => logger.info("server is starting"));
module.exports.handler = serverless(app);

