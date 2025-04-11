const { Validator } = require("node-input-validator");
const category = {
   categoryName: "required|string",
};
const updateCategory = {
   categoryName: "required|string",
   id: "required|integer",
};
const subCategory = {
   subCategoryName: "required|string",
   categoryId: "required|string",
};
const idIsRequired = {
   id: "required|integer",
};
const updateSubCategory = {
   subCategoryName: "required|string",
   id: "required|integer",
};
const bannerUpload = {
   bannername: "required|string",
   categoryid: "required|integer",
   subcategoryid: "required|integer",

};
const validationSchema = {
   category,
   subCategory,
   updateCategory,
   idIsRequired,
   updateSubCategory,
   bannerUpload,
};
const productValidator = async (data, type) => {
   const v = new Validator(data, validationSchema[type]);
   const valid = await v.check();
   if (!valid) {
      return v.errors[Object.keys(v.errors)[0]].message;
   } else {
      return false;
   }
};

module.exports = { productValidator };
