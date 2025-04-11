const { CreateProduct } = require("./product/swagger_api/createProduct");
const { DeleteProduct } = require("./product/swagger_api/deleteProduct");
const { DetailProduct } = require("./product/swagger_api/detailProduct");
const { EditProduct } = require("./product/swagger_api/editProduct");
const { ListProduct } = require("./product/swagger_api/listProduct");
module.exports = {
   swagger: "2.0",
   info: {
      version: "1.0.0",
      title: "Rentte",
      description: "API for registering a product",
   },
   host: "localhost:5000",
   basePath: "/",
   schemes: [
      "http",
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
      "/partner/product/create-product": CreateProduct,
      "/partner/product/list-product": ListProduct,
      "/partner/product/detail-product": DetailProduct,
      "/partner/product/edit-product": EditProduct,
      "/partner/product/delete-product": DeleteProduct,
   },
};
  
