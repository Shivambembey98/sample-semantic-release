const CategoryList = {
   get: {
      tags: ["Admin Service"],
      summary: "Get Category List",
      description: `This endpoint allows an admin to retrieve a list 
      of product categories with pagination.`,
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
            description: "Category list retrieved successfully.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: true,
                  },
                  data: {
                     type: "array",
                     description: "List of categories",
                     items: {
                        type: "object",
                        properties: {
                           id: {
                              type: "integer",
                              example: 1,
                           },
                           categoryName: {
                              type: "string",
                              example: "motorcycle",
                           },
                        },
                     },
                  },
                  page: {
                     type: "integer",
                     example: 1,
                  },
                  totalPages: {
                     type: "integer",
                     example: 5,
                  },
               },
            },
         },
         "400": {
            description: "Invalid request parameters.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: false,
                  },
                  message: {
                     type: "string",
                     example: "Invalid page number.",
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
   CategoryList,
};
  
