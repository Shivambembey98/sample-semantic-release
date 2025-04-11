const express = require("express");
const router = express.Router();
const emailService = require('../controller/notification');
router.post("/send-bulk-email",
   emailService.sendBulkEmail);
router.get("/process-email-queue",emailService.sendEmailNotification)
router.post("/contact-us-user",emailService.contactUs)
router.post("/reply-to-customer",emailService.replyCustomerQueries)
router.get("/unsubscribe-email-notification", emailService.unsubscribeUser)
module.exports = router;
