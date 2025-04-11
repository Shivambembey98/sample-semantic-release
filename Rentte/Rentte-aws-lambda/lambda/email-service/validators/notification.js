const { Validator } = require("node-input-validator");

const contactUsValidator = {
   email: "required|string",
   message: "required|string",
};

const validationSchema = { contactUsValidator }

const inputValidation = async (data, type) => {
   const v = new Validator(data, validationSchema[type]);
   const valid = await v.check();
   if (!valid) {
      return v.errors[Object.keys(v.errors)[0]].message;
   } else {
      return false;
   }
};
  
module.exports = { inputValidation }
