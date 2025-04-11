const ResetPassword = {
   post: {
      tags: ["Admin Service"],
      summary: "Reset Password",
      description: `This endpoint allows users to reset 
      their password using a token received via email.`,
      consumes: ["application/json"],
      produces: ["application/json"],
      parameters: [
         {
            in: "body",
            name: "body",
            description: "Password reset details",
            required: true,
            schema: {
               type: "object",
               properties: {
                  confirmPassword: {
                     type: "string",
                     description: "Confirmation of the new password",
                     example: "admin@1234",
                  },
                  newPassword: {
                     type: "string",
                     description: "The new password to be set",
                     example: "admin@1234",
                  },
                  token: {
                     type: "string",
                     description: "JWT token received for password reset",
                     example: "",
                  },
               },
            },
         },
      ],
      responses: {
         "200": {
            description: "Password reset successfully.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: true,
                  },
                  message: {
                     type: "string",
                     example: "Password reset successfully.",
                  },
               },
            },
         },
         "400": {
            description: "Invalid token or password mismatch.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: false,
                  },
                  message: {
                     type: "string",
                     example: "Invalid token or passwords do not match.",
                  },
               },
            },
         },
      },
   },
};
  
module.exports = {
   ResetPassword,
};
  
