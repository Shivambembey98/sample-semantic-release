const express = require("express");
const router = express.Router();
const userRoutes = require("../../user/routes/user");
const productRoute = require("../../user/routes/product");
const partnerRoutes = require("../../user/routes/partner");
const faqRoutes = require("../../user/routes/faq");
const jobRoutes = require("../../user/routes/job");
router.use("/auth", userRoutes);
router.use("/product",productRoute);
router.use("/partner",partnerRoutes);
router.use("/faqs", faqRoutes)
router.use("/jobs", jobRoutes)
module.exports = router;
