const SubCategoryList = {
   get: {
      tags: ["Admin Service"],
      summary: "List Product Subcategories",
      description: "This endpoint retrieves a paginated list of product subcategories.",
      produces: ["application/json"],
      parameters: [
         {
            in: "query",
            name: "page",
            description: "Page number for pagination",
            required: true,
            type: "integer",
            example: 1,
         },
      ],
      responses: {
         "200": {
            description: "Successfully retrieved the list of subcategories.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: true,
                  },
                  data: {
                     type: "array",
                     items: {
                        type: "object",
                        properties: {
                           id: {
                              type: "string",
                              example: "5",
                           },
                           subCategoryName: {
                              type: "string",
                              example: "mixer",
                           },
                           categoryId: {
                              type: "string",
                              example: "12",
                           },
                        },
                     },
                  },
                  message: {
                     type: "string",
                     example: "Subcategories retrieved successfully.",
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
   SubCategoryList,
};
  
