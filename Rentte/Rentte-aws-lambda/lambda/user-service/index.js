const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
require('dotenv').config();
const apiRoutes = require('./routes/api');
const passport = require("passport");
const app = express();
const swaggerDoc = require("./helper/swagger");
const { limiter } = require('./config/rateLimiter');
const logger = require('./config/winston');
// Middleware setup
app.set('trust proxy', 'loopback');
app.use(limiter);
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());
require("./config/passport")(passport);
swaggerDoc(app, 5000);
// Route setup
app.use('/', apiRoutes);

const server = require('http').createServer(app);
server.listen(process.env.PORT, () => logger.info("server is starting"));
module.exports = app;
module.exports.handler = serverless(app);
