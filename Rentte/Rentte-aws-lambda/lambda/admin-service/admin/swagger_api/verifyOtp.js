const VerifyOtp = {
   post: {
      tags: ["Admin Service"],
      summary: "Verify OTP",
      description: "This endpoint allows users to verify the OTP sent to their mobile number.",
      consumes: ["application/json"],
      produces: ["application/json"],
      parameters: [
         {
            in: "body",
            name: "body",
            description: "User's mobile number, country code, and OTP for verification",
            required: true,
            schema: {
               type: "object",
               properties: {
                  mobile: {
                     type: "string",
                     description: "Mobile number of the user",
                     example: "9667335148",
                  },
                  countryCode: {
                     type: "string",
                     description: "Country code in international format",
                     example: "+91",
                  },
                  otp: {
                     type: "string", // Using string to handle any OTP format
                     description: "One-time password (OTP) sent to the user's mobile number",
                     example: "1942223",
                  },
               },
               required: ["mobile", "countryCode", "otp"], // All fields are required
            },
         },
      ],
      responses: {
         "200": {
            description: "OTP verified successfully.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: true,
                  },
                  message: {
                     type: "string",
                     example: "OTP verified successfully.",
                  },
               },
            },
         },
         "400": {
            description: "Invalid OTP, mobile number, or country code.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: false,
                  },
                  message: {
                     type: "string",
                     example: "Invalid OTP, mobile number, or country code.",
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
   VerifyOtp,
};
  
