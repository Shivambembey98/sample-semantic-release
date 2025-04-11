const express = require("express");
const router = express.Router();
const blogRoutes = require("../blog/routes/blogRoute");
router.use("/blogs",blogRoutes);
module.exports = router;
