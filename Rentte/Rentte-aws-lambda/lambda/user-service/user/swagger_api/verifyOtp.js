const VerifyOTP = {
   post: {
      tags: ["User_auth"],
      summary: "Verify OTP",
      description: "Verifies the OTP sent to the user's mobile number for authentication.",
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
            description: "Details required for OTP verification",
            required: true,
            schema: {
               type: "object",
               properties: {
                  countryCode: {
                     type: "string",
                     example: "+91",
                  },
                  mobile: {
                     type: "string",
                     example: "9667335148",
                  },
                  otp: {
                     type: "string",
                     example: "5979201",
                  },
               },
               required: [
                  "countryCode",
                  "mobile",
                  "otp",
               ],
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
            description: "Invalid OTP or input data.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: false,
                  },
                  message: {
                     type: "string",
                     example: "Invalid OTP or input data.",
                  },
               },
            },
         },
      },
   },
};
  
module.exports = {
   VerifyOTP,
};
  
