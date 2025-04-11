const express = require("express");
const blogController = require("../controller/blogController");
const upload = require("../../config/s3bucketConfig");
const passport = require("passport");
const router = express.Router();
router.post("/create-blog", 
   passport.authenticate("jwt", { session: false }),
   upload.array('blogimage', 5),
   blogController.createBlog)
router.delete("/delete-blog",
   passport.authenticate("jwt", { session: false }),
   blogController.deleteBlog)
router.get("/blog-list", 
   blogController.blogList)
router.post("/update-blog",
   passport.authenticate("jwt", { session: false }),
   upload.array('blogimage', 5),
   blogController.updateBlog)
router.get("/blog-detail",
   blogController.blogDetail)
router.post("/create-career",
   passport.authenticate("jwt", { session: false }),
   blogController.createCareer)
router.delete("/delete-career",
   passport.authenticate("jwt", { session: false }),
   blogController.deleteCareer)
router.get("/career-list",
   blogController.careerList) 
router.post("/update-career",
   upload.array('blogimage', 5),
   passport.authenticate("jwt", { session: false }),
   blogController.updateCareer)
router.get("/career-detail",
   blogController.careerDetail)

module.exports = router;
