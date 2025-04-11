const express = require("express");
const router = express.Router();
const passport = require("passport");
const ratingController = require('../controller/ratingController');
const productController = require('../controller/productController');
router.post("/create-rating",
   passport.authenticate("jwt",{ session: false }),
   ratingController.createRating);
router.get("/rating-list",
   ratingController.ratingList);
router.put("/edit-rating",
   passport.authenticate("jwt",{ session: false }),
   ratingController.editRating);
router.delete("/delete-rating",
   passport.authenticate("jwt",{ session: false }),
   ratingController.deleteRating);
router.get("/category-list",
   productController.getCategoryList);
router.get("/subcategory-list",
   productController.subCategoryList);
router.post("/create-history-partner",
   passport.authenticate("jwt",{ session: false }),
   productController.createHistoryPartner)
router.delete("/delete-history-partner",
   passport.authenticate("jwt",{ session: false }),
   productController.deleteHistoryPartner)
router.get("/partner-history-list",
   passport.authenticate("jwt",{ session: false }),
   productController.partnerHistoryList)
router.post("create-history-user",
   passport.authenticate("jwt",{ session: false }),
   productController.createHistoryUser)
router.delete("/delete-history-user",
   passport.authenticate("jwt",{ session: false }),
   productController.deleteHistoryUser)
router.get("/user-history-list",
   passport.authenticate("jwt",{ session: false }),
   productController.userHistoryList)
module.exports = router;
