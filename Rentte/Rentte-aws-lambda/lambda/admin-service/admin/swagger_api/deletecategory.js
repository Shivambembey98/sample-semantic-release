const DeleteCategory = {
   delete: {
      tags: ["Admin Service"],
      summary: "Delete Product Category",
      description: "This endpoint allows an admin to delete a product category by its ID.",
      consumes: ["application/json"],
      produces: ["application/json"],
      parameters: [
         {
            in: "body",
            name: "body",
            description: "Category ID to delete",
            required: true,
            schema: {
               type: "object",
               properties: {
                  id: {
                     type: "string",
                     description: "ID of the category to be deleted",
                     example: "3",
                  },
               },
            },
         },
      ],
      responses: {
         "200": {
            description: "Category deleted successfully.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: true,
                  },
                  message: {
                     type: "string",
                     example: "Category deleted successfully.",
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
                     example: "Invalid category ID.",
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
   DeleteCategory,
};
  
