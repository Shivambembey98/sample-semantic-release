const ChangePassword = {
   post: {
      tags: ["Admin Service"],
      summary: "Change Password",
      description: "This endpoint allows users to change their password after verifying their OTP.",
      consumes: ["application/json"],
      produces: ["application/json"],
      parameters: [
         {
            in: "body",
            name: "body",
            description: "Details required to change the password",
            required: true,
            schema: {
               type: "object",
               properties: {
                  otpId: {
                     type: "integer",
                     description: "ID of the OTP that was sent to the user",
                     example: 35,
                  },
                  newPassword: {
                     type: "string",
                     description: "The new password the user wants to set",
                     example: "admin@1hkh1",
                  },
                  confirmPassword: {
                     type: "string",
                     description: "Confirmation of the new password",
                     example: "admin@1hkh1",
                  },
                  mobile: {
                     type: "string",
                     description: "Mobile number of the user",
                     example: "9667335148",
                  },
               },
               required: ["otpId", "newPassword",
                  "confirmPassword", "mobile"], // All fields are required
            },
         },
      ],
      responses: {
         "200": {
            description: "Password changed successfully.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: true,
                  },
                  message: {
                     type: "string",
                     example: "Password changed successfully.",
                  },
               },
            },
         },
         "400": {
            description: "Invalid OTP, password mismatch, or other client-side error.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: false,
                  },
                  message: {
                     type: "string",
                     example: "Invalid OTP or password mismatch.",
                  },
               },
            },
         },
         "401": {
            description: "Unauthorized access due to invalid or missing token.",
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
   ChangePassword,
};
  
