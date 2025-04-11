const { Validator } = require("node-input-validator");

const productValidator = {
   description: "required|string",
   categoryId: "required|integer",
   subCategoryId: "required|integer",
};
const ratingValidation = {
   productId: "required|integer",
   rating: "required|integer",
   comments: "required|string",
};
const idIsRequired = {
   ratingId: "required|integer",
};
const wishList = {
   productId: "required|integer",
};
const validationSchema = {
   productValidator,
   ratingValidation,
   idIsRequired,
   wishList,
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
