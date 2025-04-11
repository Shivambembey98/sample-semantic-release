const { Login } = require("./user/swagger_api/login");
const { Register } = require("./user/swagger_api/register");
const { SentOtp } = require("./user/swagger_api/sendOtp");
const { UpdateProfile } = require("./user/swagger_api/updateProfile");
const { VerifyEmailOtp } = require("./user/swagger_api/verifyEmailOtp");
const { VerifyOTP } = require("./user/swagger_api/verifyOtp");

module.exports = {
   swagger: "2.0",
   info: {
      version: "1.0.0",
      title: "Rentte",
      description: "API for registering a user",
   },
   host: "localhost:5000",
   basePath: "/",
   schemes: ["https"],
  
   // Define the security scheme
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
      "/user/auth/register": Register,
      "/user/auth/verify-email-otp": VerifyEmailOtp,
      "/user/auth/login": Login,
      "/user/auth/update-profile": UpdateProfile,
      "/user/auth/send-otp": SentOtp,
      "/user/auth/verify-otp": VerifyOTP,
   },
};
