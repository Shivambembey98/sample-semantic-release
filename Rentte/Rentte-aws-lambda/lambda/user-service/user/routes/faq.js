const express = require("express");
const router = express.Router();
const faqController = require("../controller/faqController");
const passport = require("passport");
router.get("/faq-list",
   faqController.getAllFaq);
router.get("/faq-category-list",
   faqController.getAllFaqCategory);
router.post("/create-customer-query",
   passport.authenticate("jwt",{ session: false }),
   faqController.createCustomerQuery);
router.get("/get-faq-details",
   faqController.getFaqDetails);
router.get("/get-faq-by-category",
   faqController.getFaqByCategory)
module.exports = router;

