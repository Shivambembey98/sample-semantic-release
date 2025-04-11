const LoginAdmin = {
   post: {
      tags: ["Admin Service"],
      summary: "User Login",
      description: "This endpoint allows users to log in by providing their email and password.",
      consumes: ["application/json"],
      produces: ["application/json"],
      parameters: [
         {
            in: "body",
            name: "body",
            description: "User login credentials",
            required: true,
            schema: {
               type: "object",
               properties: {
                  email: {
                     type: "string",
                     description: "Email address of the user",
                     example: "sainiharkesh336@gmail.com",
                  },
                  password: {
                     type: "string",
                     description: "Password for the user's account",
                     example: "admin@1234",
                  },
               },
            },
         },
      ],
      responses: {
         "200": {
            description: "Login successful.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: true,
                  },
                  message: {
                     type: "string",
                     example: "Login successful.",
                  },
                  token: {
                     type: "string",
                     description: "JWT token for authenticated sessions",
                     example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  },
               },
            },
         },
         "400": {
            description: "Invalid login credentials.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: false,
                  },
                  message: {
                     type: "string",
                     example: "Invalid email or password.",
                  },
               },
            },
         },
      },
   },
};
  
module.exports = {
   LoginAdmin,
};
  
