const express = require("express");
const router = express.Router();
const passport = require("passport");
const productController = require('../controller/productController');
const upload = require("../../config/s3bucketConfig");
router.post("/create-product",
   passport.authenticate("jwt", { session: false }),
   upload.array('productImages', 5),
   productController.creeateProduct);
router.put("/edit-product",
   passport.authenticate("jwt", { session: false }),
   upload.array('productImages', 5),
   productController.editProduct);
router.get("/list-product",
   productController.listProduct);
router.delete("/delete-product",
   passport.authenticate("jwt", { session: false }),
   productController.deleteProduct);
router.get("/product-detail",
   productController.productDetails);
router.get("/related-search",
   productController.relatedSearch);
router.post("/rent-product",
   passport.authenticate("jwt", { session: false }),
   productController.rentProduct);
router.get("/partner-product-list",
   passport.authenticate("jwt", { session: false }),
   productController.listProductPartner);
router.post("/cancel-rent-product",
   passport.authenticate("jwt", { session: false }),
   productController.cancelRentProduct);
router.post("/create-wishlist",
   passport.authenticate("jwt", { session: false }),
   productController.wishListProduct);
router.get("/get-wishlist-product",
   passport.authenticate("jwt", { session: false }),
   productController.getWishListProduct)
router.post("/product-view-count",
   productController.productViewCount);
router.post("/chat-click-count",
   productController.chatClickCount);
router.post("/product-search-count",
   productController.productSearchCount);
router.get("/featured-product",
   productController.getFeaturedProduct) 
router.get("/banner-list",
   productController.getBannerList)
module.exports = router;
