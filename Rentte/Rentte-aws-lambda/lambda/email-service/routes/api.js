const express = require("express");
const router = express.Router();
const emailRoutes = require('./api/email');
router.use("/notification",emailRoutes);
module.exports = router;
