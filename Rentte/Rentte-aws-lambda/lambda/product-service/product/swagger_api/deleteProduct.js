const DeleteProduct = {
   delete: {
      tags: ["Product Service"],
      summary: "Delete Product",
      description: `This endpoint allows partners to 
      delete an existing product by providing the product ID.`,
      parameters: [
         {
            in: "query",
            name: "productId",
            description: "ID of the product to delete.",
            required: true,
            type: "string",
            example: "9",
         },
      ],
      responses: {
         "200": {
            description: "Product deleted successfully.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: true,
                  },
                  message: {
                     type: "string",
                     example: "Product deleted successfully.",
                  },
               },
            },
         },
         "400": {
            description: "Invalid product ID.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: false,
                  },
                  message: {
                     type: "string",
                     example: "Invalid product ID.",
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
   DeleteProduct,
};
  
