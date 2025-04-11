const CreateCategory = {
   post: {
      tags: ["Admin Service"],
      summary: "Create Product Category",
      description: "This endpoint allows an admin user to create a new product category.",
      consumes: ["application/json"],
      produces: ["application/json"],
      parameters: [
         {
            in: "body",
            name: "body",
            description: "Category details",
            required: true,
            schema: {
               type: "object",
               properties: {
                  categoryName: {
                     type: "string",
                     description: "Name of the product category to be created",
                     example: "motorcycle",
                  },
               },
            },
         },
      ],
      responses: {
         "200": {
            description: "Category created successfully.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: true,
                  },
                  message: {
                     type: "string",
                     example: "Category created successfully.",
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
   CreateCategory,
};
  
