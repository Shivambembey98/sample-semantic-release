const DetailProduct = {
   get: {
      tags: ["Product Service"],
      summary: "Get Product Details",
      description: `This endpoint allows partners to retrieve the 
      details of a specific product by providing the product ID.`,
      produces: [
         "application/json",
      ],
      parameters: [
         {
            in: "query",
            name: "productId",
            description: "The ID of the product to retrieve details for.",
            required: true,
            type: "string",
            example: "9",
         },
      ],
      responses: {
         "200": {
            description: "Product details retrieved successfully.",
            schema: {
               type: "object",
               properties: {
                  productId: {
                     type: "string",
                     example: "9",
                  },
                  productName: {
                     type: "string",
                     example: "Honda Motorcycle",
                  },
                  description: {
                     type: "string",
                     example: "A well-maintained Honda motorcycle available for rent.",
                  },
                  latitude: {
                     type: "string",
                     example: "28.6820444",
                  },
                  longitude: {
                     type: "string",
                     example: "77.0675607",
                  },
                  state: {
                     type: "string",
                     example: "Delhi",
                  },
                  country: {
                     type: "string",
                     example: "India",
                  },
                  images: {
                     type: "array",
                     items: {
                        type: "string",
                        example: "https://example.com/image1.jpg",
                     },
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
   DetailProduct,
};
  
