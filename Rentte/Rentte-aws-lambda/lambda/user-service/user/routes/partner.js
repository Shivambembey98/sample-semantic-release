const express = require("express");
const router = express.Router();
const passport = require("passport");
const partnerController = require("../controller/partnerController");
router.get("/partner-list",
   passport.authenticate("jwt",{ session: false }),
   partnerController.listAllPartner);
router.get("/partner-dashboard",
   passport.authenticate("jwt",{ session: false }),
   partnerController.dashboardPartner)
module.exports = router;
