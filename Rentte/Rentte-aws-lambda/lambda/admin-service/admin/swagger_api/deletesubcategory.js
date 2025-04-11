const DeleteSubCategory = {
   delete: {
      tags: ["Admin Service"],
      summary: "Delete Product Subcategory",
      description: `This endpoint allows an admin to delete
      a specific product subcategory by its ID.`,
      consumes: ["application/json"],
      produces: ["application/json"],
      parameters: [
         {
            in: "body",
            name: "body",
            description: "ID of the subcategory to be deleted",
            required: true,
            schema: {
               type: "object",
               properties: {
                  id: {
                     type: "string",
                     description: "ID of the subcategory to be deleted",
                     example: "6",
                  },
               },
            },
         },
      ],
      responses: {
         "200": {
            description: "Subcategory deleted successfully.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: true,
                  },
                  message: {
                     type: "string",
                     example: "Subcategory deleted successfully.",
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
                     example: "Invalid subcategory ID.",
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
   DeleteSubCategory,
};
  
