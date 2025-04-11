const express = require('express')
const router = express.Router();
const passport = require('passport')
const faqController = require('../controller/faqController');
const upload = require('../../config/s3bucketConfig');
router.post('/create-faq-category', 
   passport.authenticate('jwt', { session: false }),
   upload.single("icon"),
   faqController.createFaqCategory)
router.post('/edit-faq-category',
   passport.authenticate('jwt', { session: false }),
   upload.single("icon"),
   faqController.editFaqCategory)
router.delete('/delete-faq-category',
   passport.authenticate('jwt', { session: false }),
   faqController.deleteFaqCategory)
router.post('/create-faq',
   passport.authenticate('jwt', { session: false }),
   faqController.createFaq)
router.post('/edit-faq',
   passport.authenticate('jwt', { session: false }),
   faqController.editFaq)
router.delete('/delete-faq',
   passport.authenticate('jwt', { session: false }),
   faqController.deleteFaq)
router.get("/get-all-customer-query",
   passport.authenticate("jwt", { session: false }),
   faqController.getAllCustomerQuery);

module.exports = router
