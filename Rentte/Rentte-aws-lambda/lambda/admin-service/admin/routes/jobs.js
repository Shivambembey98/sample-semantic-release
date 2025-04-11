const express = require('express')
const router = express.Router();
const passport = require('passport')
const jobController = require('../controller/jobApplicationController');
router.get("/get-all-jobapplications",
   passport.authenticate("jwt", { session: false }),
   jobController.getAllJobApplications)

module.exports = router
