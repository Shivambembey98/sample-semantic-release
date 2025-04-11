const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controller/userController");
router.post("/block-and-unblock-user",
   passport.authenticate("jwt", { session: false }),
   userController.blockAndUnblockUser);
module.exports = router;
