const ListProduct = {
   get: {
      tags: ["Product Service"],
      summary: "List Products",
      description: `This endpoint allows partners to list products 
      based on search criteria like location, search term, range, state, and country.`,
      produces: [
         "application/json",
      ],
      parameters: [
         {
            in: "query",
            name: "lat",
            description: "Latitude for the product location",
            required: true,
            type: "string",
            example: "28.6820444",
         },
         {
            in: "query",
            name: "long",
            description: "Longitude for the product location",
            required: true,
            type: "string",
            example: "77.0675607",
         },
         {
            in: "query",
            name: "search",
            description: "Search term for filtering products",
            required: false,
            type: "string",
            example: "honda",
         },
         {
            in: "query",
            name: "range",
            description: "Search range in meters",
            required: false,
            type: "number",
            example: 20000,
         },
         {
            in: "query",
            name: "state",
            description: "State for filtering products",
            required: true,
            type: "string",
            example: "Delhi",
         },
         {
            in: "query",
            name: "country",
            description: "Country for filtering products",
            required: true,
            type: "string",
            example: "India",
         },
      ],
      responses: {
         "200": {
            description: "Products retrieved successfully.",
            schema: {
               type: "array",
               items: {
                  type: "object",
                  properties: {
                     productId: {
                        type: "string",
                        example: "1234",
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
                     distance: {
                        type: "number",
                        example: 1500,
                     },
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
      },
      security: [
         {
            BearerAuth: [],
         },
      ],
   },
};
  
module.exports = {
   ListProduct,
};
  
