const express = require("express");
const router = express.Router();
const adminRoutes = require('./api/admin');
router.use("/admin",adminRoutes);
module.exports = router;
