const VerifyEmailOtp = {
   post: {
      tags: ["User_auth"],
      summary: "Verify Email OTP",
      description: `This endpoint allows a user to verify 
      their email using an OTP (One-Time Password).`,
      consumes: ["application/json"],
      produces: ["application/json"],
      parameters: [
         {
            in: "body",
            name: "body",
            description: "Email verification details",
            required: true,
            schema: {
               type: "object",
               properties: {
                  email: {
                     type: "string",
                     format: "email",
                     example: "sainiharkesh336@gmail.com",
                  },
                  confirmationCode: {
                     type: "string",
                     example: "959013",
                  },
               },
               required: ["email", "confirmationCode"],
            },
         },
      ],
      responses: {
         "200": {
            description: "OTP verified successfully",
            schema: {
               type: "object",
               properties: {
                  message: {
                     type: "string",
                     example: "Email verified successfully",
                  },
               },
            },
         },
         "400": {
            description: "Invalid OTP or email",
            schema: {
               type: "object",
               properties: {
                  error: {
                     type: "string",
                     example: "Invalid OTP or email",
                  },
               },
            },
         },
      },
   },
};
  
module.exports = {
   VerifyEmailOtp,
};
  
