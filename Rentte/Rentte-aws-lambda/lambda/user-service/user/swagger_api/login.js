const Login = {
   post: {
      tags: ["User_auth"],
      summary: "User Login",
      description: "This endpoint allows an admin to login with their credentials",
      consumes: ["application/json"],
      produces: ["application/json"],
      parameters: [
         {
            in: "body",
            name: "body",
            description: "Admin login details",
            required: true,
            schema: {
               type: "object",
               properties: {
                  email: {
                     type: "string",
                     format: "email",
                     example: "sainiharkesh338@gmail.com",
                  },
                  password: {
                     type: "string",
                     example: "admin@123",
                  },
               },
               required: ["email", "password"],
            },
         },
      ],
      responses: {
         "200": {
            description: "Successful login",
            schema: {
               type: "object",
               properties: {
                  token: {
                     type: "string",
                     example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  },
                  message: {
                     type: "string",
                     example: "Login successful",
                  },
               },
            },
         },
         "401": {
            description: "Unauthorized",
            schema: {
               type: "object",
               properties: {
                  error: {
                     type: "string",
                     example: "Invalid email or password",
                  },
               },
            },
         },
      },
   },
};
  
module.exports = {
   Login,
};
  
