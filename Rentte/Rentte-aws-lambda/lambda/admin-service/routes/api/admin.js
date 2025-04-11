const express = require("express");
const router = express.Router();
const adminRoutes = require("../../admin/routes/admin");
const productRoute = require('../../admin/routes/product');
const userRoutes = require("../../admin/routes/user");
const faqRoutes = require('../../admin/routes/faq')
const jobRoutes = require('../../admin/routes/jobs')
router.use("/auth", adminRoutes);
router.use("/product",productRoute);
router.use("/user",userRoutes);
router.use("/faqs", faqRoutes);
router.use("/jobs", jobRoutes);
module.exports = router;
