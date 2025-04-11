const express = require("express");
const router = express.Router();
const upload = require("../../config/s3bucketConfig");
const jobRoute = require("../controller/jobApplicationController");
router.use("/applyjob", 
   upload.single("resume"),
   jobRoute.applyJobs);
module.exports = router;
