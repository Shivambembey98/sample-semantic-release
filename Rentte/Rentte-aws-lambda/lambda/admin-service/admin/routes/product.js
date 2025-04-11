const express = require("express");
const router = express.Router();
const productController = require("../controller/productController");
const passport = require("passport");
const upload = require("../../config/s3bucketConfig");
router.post("/create-category",
   passport.authenticate("jwt", { session: false }),
   productController.addCategory);
router.post("/update-category",
   passport.authenticate("jwt", { session: false }),
   productController.updateCategory);
router.get("/category-list",
   passport.authenticate("jwt", { session: false }),
   productController.categoryList);
router.delete("/delete-category",
   passport.authenticate("jwt", { session: false }),
   productController.deleteCategory);
router.post("/create-subcategory",
   passport.authenticate("jwt", { session: false }),
   upload.single("subcategoryimage"),
   productController.addSubCategory);
router.post("/update-subcategory",
   passport.authenticate("jwt", { session: false }),
   upload.single("subcategoryimage"),
   productController.updateSubCategory);
router.get("/subcategory-list",
   passport.authenticate("jwt", { session: false }),
   productController.subCategoryList);
router.delete("/delete-subcategory",
   passport.authenticate("jwt", { session: false }),
   productController.deleteSubCategory);
router.get("/get-all-product",
   passport.authenticate("jwt", { session: false }),
   productController.getAllProducts);
router.post("/post-banner",
   passport.authenticate("jwt", { session: false }),
   upload.single("bannerimage"),
   productController.postBanner);
router.post("/update-banner",
   passport.authenticate("jwt", { session: false }),
   upload.single("bannerimage"),
   productController.updateBanner);
router.delete("/delete-banner",
   passport.authenticate("jwt", { session: false }),
   productController.deleteBanner);
router.post("/product-image-validation",
   passport.authenticate("jwt", { session: false }),
   productController.imageValidation);

module.exports = router;
