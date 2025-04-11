const { Validator } = require("node-input-validator");

const blogValidator = {
   title: "required|string",
   description: "required|string",
   blogimage: "required|array",
}

const validationSchema = { blogValidator }

const blogInputValidator = async (data, type) => {
   const v = new Validator(data, validationSchema[type]);
   const valid = await v.check();
   if (!valid) {
      return v.errors[Object.keys(v.errors)[0]].message;
   } else {
      return false;
   }
};
 
module.exports = { blogInputValidator };
