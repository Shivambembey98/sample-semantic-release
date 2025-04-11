const ForgetPassword = {
   post: {
      tags: ["Admin Service"],
      summary: "Forget Password",
      description: `This endpoint allows users to request a password 
      reset by providing their registered email address.`,
      consumes: ["application/json"],
      produces: ["application/json"],
      parameters: [
         {
            in: "body",
            name: "body",
            description: "User email for password reset",
            required: true,
            schema: {
               type: "object",
               properties: {
                  email: {
                     type: "string",
                     description: "Registered email address of the user",
                     example: "sainiharkesh336@gmail.com",
                  },
               },
            },
         },
      ],
      responses: {
         "200": {
            description: "Password reset link sent successfully.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: true,
                  },
                  message: {
                     type: "string",
                     example: "Password reset link sent successfully.",
                  },
               },
            },
         },
         "400": {
            description: "Invalid email address.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: false,
                  },
                  message: {
                     type: "string",
                     example: "Invalid email address.",
                  },
               },
            },
         },
      },
   },
};
  
module.exports = {
   ForgetPassword,
};
  
