const UpdateCategory = {
   put: {
      tags: ["Admin Service"],
      summary: "Update Product Category",
      description: `This endpoint allows an admin to update 
      the details of an existing product category by its ID.`,
      consumes: ["application/json"],
      produces: ["application/json"],
      parameters: [
         {
            in: "body",
            name: "body",
            description: "Category details to update",
            required: true,
            schema: {
               type: "object",
               properties: {
                  id: {
                     type: "string",
                     description: "ID of the category to be updated",
                     example: "13",
                  },
                  categoryName: {
                     type: "string",
                     description: "New name of the category",
                     example: "testing",
                  },
                  description: {
                     type: "string",
                     description: "Description of the category",
                     example: "",
                  },
               },
            },
         },
      ],
      responses: {
         "200": {
            description: "Category updated successfully.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: true,
                  },
                  message: {
                     type: "string",
                     example: "Category updated successfully.",
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
                     example: "Invalid category ID or data.",
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
   UpdateCategory,
};
  
