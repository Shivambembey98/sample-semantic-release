const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controller/authController");
const upload = require("../../config/s3bucketConfig");
router.post("/register",
   authController.register);
router.post("/login",
   authController.login);
router.get("/verify-email",
   authController.verifyEmail);
router.post("/update-profile",
   upload.single("profileimage"),
   passport.authenticate("jwt",{ session: false }),
   authController.updateProfile);
router.post("/update-kyc",
   upload.fields([{ name: 'aadhaarImage', maxCount: 1 }, { name: 'panCardImage', maxCount: 1 }]),
   passport.authenticate("jwt", { session: false }),
   authController.updateKyc);
router.post("/send-otp",
   authController.sendOtp);
router.post("/verify-otp",
   authController.verifyOtp);
router.post("/verify-email-otp",
   authController.verifyEmailOtp);
router.post("/forget-password",
   authController.forgotPassword);
router.post("/reset-password",
   authController.resetPassword);
router.get("/user-list",
   passport.authenticate("jwt",{ session: false }),
   authController.listUser);
router.get("/detail-user",
   passport.authenticate("jwt",{ session: false }),
   authController.detailUser);
router.post("/legal-policy-acceptance",
   passport.authenticate("jwt",{ session: false }),
   authController.legalPolicyAcceptance);
router.post("/change-password",
   passport.authenticate("jwt", { session: false }),
   authController.changePassword);
router.post("/test-unit",
   authController.testingUnitTest)
router.post("/contact-us", authController.contactUs)
module.exports = router;
