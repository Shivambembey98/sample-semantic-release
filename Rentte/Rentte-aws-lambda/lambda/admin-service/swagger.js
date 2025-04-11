const { RegisterAdmin } = require("./admin/swagger_api/registerAdmin");
const { LoginAdmin } = require("./admin/swagger_api/loginAdmin");
const { ForgetPassword } = require("./admin/swagger_api/forgetpassword");
const { ResetPassword } = require("./admin/swagger_api/resetpassword");
const { CreateCategory } = require("./admin/swagger_api/createcategory");
const { CategoryList } = require("./admin/swagger_api/categorylist");
const { DeleteCategory } = require("./admin/swagger_api/deletecategory");
const { UpdateCategory } = require("./admin/swagger_api/updatecategory");
const { CreateSubCategory } = require("./admin/swagger_api/createsubcategory");
const { DeleteSubCategory } = require("./admin/swagger_api/deletesubcategory");
const { UpdateSubCategory } = require("./admin/swagger_api/updatesubcategory");
const { SubCategoryList } = require("./admin/swagger_api/subcategorylist");
const { SendOtp } = require("./admin/swagger_api/sendOtp");
const { VerifyOtp } = require("./admin/swagger_api/verifyOtp");
const { ChangePassword } = require("./admin/swagger_api/changePassword");

module.exports = {
   swagger: "2.0",
   info: {
      version: "1.0.0",
      title: "Rentte",
      description: "API for registering a new admin user",
   },
   host: "localhost:5002",
   basePath: "/",
   schemes: [
      "https",
   ],
   securityDefinitions: {
      BearerAuth: {
         type: "apiKey",
         name: "Authorization",
         in: "header",
         description: "Enter your bearer token in the format: Bearer <token>",
      },
   },

   // Apply security globally to all endpoints
   security: [
      {
         BearerAuth: [],
      },
   ],
   paths: {
      "/admin/auth/register": RegisterAdmin,
      "/admin/auth/login": LoginAdmin,
      "/admin/auth/forget-password": ForgetPassword,
      "/admin/auth/reset-password": ResetPassword,
      "/admin/auth/send-otp": SendOtp,
      "/admin/auth/verify-otp": VerifyOtp,
      "/admin/auth/change-password": ChangePassword,
      "/admin/product/create-category": CreateCategory,
      "/admin/product/category-list?page=1": CategoryList,
      "/admin/product/delete-category": DeleteCategory,
      "/admin/product/update-category": UpdateCategory,
      "/admin/product/create-subcategory": CreateSubCategory,
      "/admin/product/delete-subcategory": DeleteSubCategory,
      "/admin/product/update-subcategory": UpdateSubCategory,
      "/admin/product/subcategory-list?page=1": SubCategoryList,
   },
};
  
