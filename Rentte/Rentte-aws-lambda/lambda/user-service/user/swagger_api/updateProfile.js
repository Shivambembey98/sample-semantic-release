const UpdateProfile = {
   post: {
      tags: ["User_auth"],
      summary: "Update Admin Profile",
      description: "Update the profile details of an admin user",
      consumes: ["application/json"],
      produces: ["application/json"],
      parameters: [
         {
            in: "body",
            name: "body",
            description: "Admin profile update details",
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
                     example: "26-10-1999",
                  },
               },
            },
         },
      ],
      responses: {
         "200": {
            description: "Profile updated successfully",
            schema: {
               type: "object",
               properties: {
                  message: {
                     type: "string",
                     example: "Profile updated successfully",
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
                     example: "Unauthorized access",
                  },
               },
            },
         },
      },
   },
};
  
module.exports = { UpdateProfile };
  
