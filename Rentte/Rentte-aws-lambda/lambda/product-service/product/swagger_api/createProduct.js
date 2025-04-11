const CreateProduct = {
   post: {
      tags: ["Product Service"],
      summary: "Create a Product",
      description: `This endpoint allows partners to create a 
      new product with the provided details.`,
      consumes: [
         "multipart/form-data",
      ],
      produces: [
         "application/json",
      ],
      parameters: [
         {
            in: "formData",
            name: "productname",
            description: "Name of the product",
            required: true,
            type: "string",
            example: "coil",
         },
         {
            in: "formData",
            name: "categoryId",
            description: "ID of the product category",
            required: true,
            type: "string",
            example: "11",
         },
         {
            in: "formData",
            name: "subCategoryId",
            description: "ID of the product subcategory",
            required: true,
            type: "string",
            example: "1",
         },
         {
            in: "formData",
            name: "description",
            description: "Description of the product",
            required: true,
            type: "string",
            example: "Creating",
         },
         {
            in: "formData",
            name: "latitude",
            description: "Latitude of the product location",
            required: true,
            type: "string",
            example: "18.5204303",
         },
         {
            in: "formData",
            name: "longitude",
            description: "Longitude of the product location",
            required: true,
            type: "string",
            example: "73.8567437",
         },
         {
            in: "formData",
            name: "productImages",
            description: "Images of the product",
            required: true,
            type: "file",
         },
         {
            in: "formData",
            name: "state",
            description: "State where the product is located",
            required: true,
            type: "string",
            example: "Maharashtra",
         },
         {
            in: "formData",
            name: "country",
            description: "Country where the product is located",
            required: true,
            type: "string",
            example: "India",
         },
      ],
      responses: {
         "200": {
            description: "Product created successfully.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: true,
                  },
                  message: {
                     type: "string",
                     example: "Product created successfully.",
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
      },
      security: [
         {
            BearerAuth: [],
         },
      ],
   },
};
  
module.exports = {
   CreateProduct,
};
  
