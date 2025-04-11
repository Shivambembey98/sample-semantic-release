const express = require("express");
const router = express.Router();
const productRoutes = require('./api/product');
router.use("/partner",productRoutes);
module.exports = router;
