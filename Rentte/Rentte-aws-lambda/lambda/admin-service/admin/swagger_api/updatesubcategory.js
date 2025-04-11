const UpdateSubCategory = {
   put: {
      tags: ["Admin Service"],
      summary: "Update Product Subcategory",
      description: `This endpoint allows an admin to 
      update details of an existing product subcategory.`,
      consumes: ["application/json"],
      produces: ["application/json"],
      parameters: [
         {
            in: "body",
            name: "body",
            description: "Subcategory details to be updated",
            required: true,
            schema: {
               type: "object",
               properties: {
                  id: {
                     type: "string",
                     description: "ID of the subcategory to be updated",
                     example: "5",
                  },
                  subCategoryName: {
                     type: "string",
                     description: "New name for the subcategory",
                     example: "water glass",
                  },
               },
            },
         },
      ],
      responses: {
         "200": {
            description: "Subcategory updated successfully.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: true,
                  },
                  message: {
                     type: "string",
                     example: "Subcategory updated successfully.",
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
                     example: "Invalid subcategory ID or data.",
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
   UpdateSubCategory,
};
  
