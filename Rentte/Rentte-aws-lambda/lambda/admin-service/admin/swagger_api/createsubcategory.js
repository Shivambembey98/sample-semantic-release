const CreateSubCategory = {
   post: {
      tags: ["Admin Service"],
      summary: "Create Product Subcategory",
      description: `This endpoint allows an admin to create a 
      new product subcategory under a specified category.`,
      consumes: ["application/json"],
      produces: ["application/json"],
      parameters: [
         {
            in: "body",
            name: "body",
            description: "Subcategory details",
            required: true,
            schema: {
               type: "object",
               properties: {
                  subCategoryName: {
                     type: "string",
                     description: "Name of the subcategory",
                     example: "mixer",
                  },
                  categoryId: {
                     type: "string",
                     description: "ID of the parent category",
                     example: "12",
                  },
               },
            },
         },
      ],
      responses: {
         "200": {
            description: "Subcategory created successfully.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: true,
                  },
                  message: {
                     type: "string",
                     example: "Subcategory created successfully.",
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
         "401": {
            description: "Unauthorized access.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: false,
                  },
                  message: {
                     type: "string",
                     example: "Unauthorized access.",
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
   CreateSubCategory,
};
  
