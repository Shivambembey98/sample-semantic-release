const Register = {
   post: {
      tags: ["User_auth"],
      summary: "Register User",
      description: "This endpoint registers a new admin user with the provided details",
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
            description: "Admin user registration details",
            required: true,
            schema: {
               type: "object",
               properties: {
                  firstName: {
                     type: "string",
                     example: "Harkesh",
                  },
                  lastName: {
                     type: "string",
                     example: "Saini",
                  },
                  email: {
                     type: "string",
                     format: "email",
                     example: "sainiharkesh336@gmail.com",
                  },
                  mobileNumber: {
                     type: "string",
                     example: "+919667335148",
                  },
                  password: {
                     type: "string",
                     example: "Admin@123",
                  },
                  gender: {
                     type: "string",
                     example: "male",
                  },
                  profession: {
                     type: "string",
                     example: "asdfsdfsd",
                  },
                  dob: {
                     type: "string",
                     example: "1999-01-25",
                  },
               },
               required: [
                  "firstName",
                  "lastName",
                  "email",
                  "mobileNumber",
                  "password",
                  "gender",
                  "profession",
                  "dob",
               ],
            },
         },
      ],
      responses: {
         "200": {
            description: "Successful registration",
            schema: {
               type: "object",
               properties: {
                  message: {
                     type: "string",
                     example: "Admin registered successfully",
                  },
               },
            },
         },
         "400": {
            description: "Invalid input",
            schema: {
               type: "object",
               properties: {
                  error: {
                     type: "string",
                     example: "Invalid input data",
                  },
               },
            },
         },
      },
   },
};

module.exports = {
   Register,
};
