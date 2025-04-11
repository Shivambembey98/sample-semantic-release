const EditProduct = {
   put: {
      tags: ["Product Service"],
      summary: "Edit Product Details",
      description: `This endpoint allows partners to edit the details of 
      an existing product by providing the product ID and other related information.`,
      consumes: [
         "multipart/form-data",
      ],
      parameters: [
         {
            in: "formData",
            name: "productImages",
            description: "Array of images for the product.",
            required: false,
            type: "file",
            items: {
               type: "string",
               format: "binary",
            },
            collectionFormat: "multi",
         },
         {
            in: "formData",
            name: "description",
            description: "Description of the product.",
            required: false,
            type: "string",
            example: "Lorem Ipsum is simply dummy text of the printing and typesetting industry.",
         },
         {
            in: "formData",
            name: "latitude",
            description: "Latitude of the product location.",
            required: false,
            type: "string",
            example: "28.609900880977644",
         },
         {
            in: "formData",
            name: "longitude",
            description: "Longitude of the product location.",
            required: false,
            type: "string",
            example: "77.2109919549809",
         },
         {
            in: "formData",
            name: "categoryId",
            description: "ID of the category the product belongs to.",
            required: true,
            type: "string",
            example: "1",
         },
         {
            in: "formData",
            name: "subCategoryId",
            description: "ID of the subcategory the product belongs to.",
            required: true,
            type: "string",
            example: "1",
         },
         {
            in: "formData",
            name: "address",
            description: "Address of the product location.",
            required: true,
            type: "string",
            example: "Gurugaon",
         },
         {
            in: "formData",
            name: "productId",
            description: "ID of the product to edit.",
            required: true,
            type: "string",
            example: "9",
         },
         {
            in: "formData",
            name: "country",
            description: "Country of the product location.",
            required: false,
            type: "string",
            example: "India",
         },
         {
            in: "formData",
            name: "state",
            description: "State of the product location.",
            required: false,
            type: "string",
            example: "Delhi",
         },
      ],
      responses: {
         "200": {
            description: "Product details updated successfully.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: true,
                  },
                  message: {
                     type: "string",
                     example: "Product details updated successfully.",
                  },
               },
            },
         },
         "400": {
            description: "Invalid input data.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: false,
                  },
                  message: {
                     type: "string",
                     example: "Invalid input data.",
                  },
               },
            },
         },
         "404": {
            description: "Product not found.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: false,
                  },
                  message: {
                     type: "string",
                     example: "Product not found.",
                  },
               },
            },
         },
      },
      security: [
         {
            BearerAuth: [],
         },
      ],
   },
};
  
module.exports = {
   EditProduct,
};
  
