const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controller/authController");
router.post("/register",
   authController.register);
router.post("/login",
   authController.login);
router.post("/forget-password",
   authController.forgotPassword);
router.post("/reset-password",
   authController.resetPassword);
router.post("/send-otp",
   authController.sendOtp);
router.post("/verify-otp",
   authController.verifyOtp);
router.post("/change-password",
   passport.authenticate("jwt", { session: false }),
   authController.changePassword);
module.exports = router;
