const SentOtp = {
   post: {
      tags: ["User_auth"],
      summary: "Send OTP",
      description: "Sends an OTP to the user's mobile number for authentication.",
      consumes: [
         "application/json",
      ],
      produces: [
         "application/json",
      ],
      parameters: [
         {
            in: "body",
            name: "body",
            description: "Mobile number and country code for OTP sending",
            required: true,
            schema: {
               type: "object",
               properties: {
                  mobile: {
                     type: "string",
                     example: "9667335148",
                  },
                  countryCode: {
                     type: "string",
                     example: "+91",
                  },
               },
               required: [
                  "mobile",
                  "countryCode",
               ],
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
            description: "Invalid input.",
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
      },
   },
};
  
module.exports = {
   SentOtp,
};
  
