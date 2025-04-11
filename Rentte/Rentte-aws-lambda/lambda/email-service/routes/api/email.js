const express = require("express");
const router = express.Router();
const userRoute = require("../../email/routes/user");
router.use("/email",userRoute);

module.exports = router;
