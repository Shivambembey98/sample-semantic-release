const { Validator } = require("node-input-validator");
const forgotPassword = {
   email: "required",
};
const resetPasswordSchema = {
   token: "required",
   newPassword: "required",
   confirmPassword: "required|same:newPassword",
};
const adminInformation = {
   firstName: "required|string",
   lastName: "required|string",
   email: "required|email",
   mobileNumber: "required|minLength:10",
   password: "required|string",
};
const sendOtp = {
   countryCode: "required|string",
   mobile: "required|integer|minLength:10",
};
const adminLoginValidation = {
   email: "required|string",
   password: "required|string",
};
const changePasswordValidation = {
   newPassword: "required|string",
   confirmPassword: "required|string|same:newPassword",
   otpId: "required|integer",
   mobile: "required|integer",
};
const validationSchema = {
   forgotPassword,
   resetPassword: resetPasswordSchema,
   adminInformation,
   sendOtp,
   verifyOtp: sendOtp,
   adminLoginValidation,
   changePasswordValidation,
};
const adminInputValidation = async (data, type) => {
   const v = new Validator(data, validationSchema[type]);
   const valid = await v.check();
   if (!valid) {
      return v.errors[Object.keys(v.errors)[0]].message;
   } else {
      return false;
   }
};

module.exports = { adminInputValidation };
