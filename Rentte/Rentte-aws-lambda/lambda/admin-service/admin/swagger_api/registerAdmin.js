const RegisterAdmin = {
   post: {
      tags: ["Admin Service"],
      summary: "Register a new user",
      description: `This endpoint allows users to register by providing 
      necessary details like name, email, mobile number, and password.`,
      consumes: ["application/json"],
      produces: ["application/json"],
      parameters: [
         {
            in: "body",
            name: "body",
            description: "User registration details",
            required: true,
            schema: {
               type: "object",
               properties: {
                  firstName: {
                     type: "string",
                     description: "First name of the user",
                     example: "Harkesh",
                  },
                  lastName: {
                     type: "string",
                     description: "Last name of the user",
                     example: "saini",
                  },
                  email: {
                     type: "string",
                     description: "Email address of the user",
                     example: "sainiharkesh336@gmail.com",
                  },
                  mobileNumber: {
                     type: "string",
                     description: "Mobile number of the user",
                     example: "9667335148",
                  },
                  password: {
                     type: "string",
                     description: "Password for the user's account",
                     example: "admin@123",
                  },
                  userType: {
                     type: "string",
                     description: "Role of the user in the system",
                     example: "admin",
                  },
               },
            },
         },
      ],
      responses: {
         "200": {
            description: "User registered successfully.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: true,
                  },
                  message: {
                     type: "string",
                     example: "User registered successfully.",
                  },
               },
            },
         },
         "400": {
            description: "Invalid input data.",
            schema: {
               type: "object",
               properties: {
                  success: {
                     type: "boolean",
                     example: false,
                  },
                  message: {
                     type: "string",
                     example: "Invalid input data.",
                  },
               },
            },
         },
      },
   },
};
  
module.exports = {
   RegisterAdmin,
};
  
