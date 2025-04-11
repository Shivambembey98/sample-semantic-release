const { Validator } = require("node-input-validator");
const ratingValidation = {
   productId: "required|integer",
   rating: "required|integer",
   comments: "required|string",
};
const partnerAndUserHistory = {
   productid: "required|integer",
   activitytype: "required|string",
}
const deletePartnerAndUserHistory = {
   historyid: "required|integer",
}

const validationSchema = {
   ratingValidations: ratingValidation,
   createHistory: partnerAndUserHistory,
   delteHistory: deletePartnerAndUserHistory,
}
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
