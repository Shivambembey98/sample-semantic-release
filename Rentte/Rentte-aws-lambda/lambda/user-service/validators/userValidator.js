const { Validator } = require("node-input-validator");

const forgotPassword = {
   email: "required",
};
const resetPasswordSchema = {
   token: "required",
   newPassword: "required",
   confirmPassword: "required|same:newPassword",
};
const userInformation = {
   firstName: "required|string",
   lastName: "required|string",
   email: "required|email",
   mobileNumber: "required|minLength:10",
   password: "required|string",
   gender: "required|string",
   userType: "required|string",
   dob: "required|string",
};

const changePasswordValidation = {
   newPassword: "required|string",
   confirmPassword: "required|string|same:newPassword",
   otpId: "required|integer",
   mobile: "required|integer",
};

const sendOtp = {
   countryCode: "required|string",
   mobile: "required|integer|minLength:10",
};
const validationSchema = {
   forgotPassword,
   userInformation,
   sendOtp,
   verifyOtp: sendOtp,
   resetPassword: resetPasswordSchema,
   changePasswordValidation,
};
const inputValidation = async (data, type) => {
   const v = new Validator(data, validationSchema[type]);
   const valid = await v.check();
   if (!valid) {
      return v.errors[Object.keys(v.errors)[0]].message;
   } else {
      return false;
   }
};
  
module.exports = { inputValidation };
