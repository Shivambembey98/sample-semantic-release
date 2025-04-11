const SendOtp = {
   post: {
      tags: ["Admin Service"],
      summary: "Send OTP",
      description: `This endpoint allows users to request an OTP
      by providing their mobile number along with the country code.`,
      consumes: ["application/json"],
      produces: ["application/json"],
      parameters: [
         {
            in: "body",
            name: "body",
            description: "User's mobile number for OTP",
            required: true,
            schema: {
               type: "object",
               properties: {
                  countryCode: {
                     type: "string",
                     description: "Country code in international format",
                     example: "+91",
                  },
                  mobile: {
                     type: "string",
                     description: "Mobile number of the user",
                     example: "9667335148",
                  },
               },
               required: ["countryCode", "mobile"], // Both fields are required
            },
         },
      ],
      responses: {
         "200": {
            description: "OTP sent successfully.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: true,
                  },
                  message: {
                     type: "string",
                     example: "OTP sent successfully.",
                  },
               },
            },
         },
         "400": {
            description: "Invalid mobile number or country code.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: false,
                  },
                  message: {
                     type: "string",
                     example: "Invalid mobile number or country code.",
                  },
               },
            },
         },
         "500": {
            description: "Internal server error.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: false,
                  },
                  message: {
                     type: "string",
                     example: "An error occurred while processing the request.",
                  },
               },
            },
         },
      },
   },
};
  
module.exports = {
   SendOtp,
};
  
