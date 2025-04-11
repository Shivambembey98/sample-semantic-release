const LOGGER_MESSAGES = {
   CREATE_BLOG: (code = 0) => {
      return {
         OPERATION: "Create Blog",
         CONTEXT: {
            method: "POST",
            route: "/blogs/create-blog",
            responseStatus: code,
         },
      };
   },
   GET_ALL_BLOGS: (code = 0) => {
      return {
         OPERATION: "Get all blogs",
         CONTEXT: {
            method: "POST",
            route: "/blogs/get-all-blogs",
            responseStatus: code,
         },
      };
   },
   GET_BLOG_BY_ID: (code = 0) => {
      return {
         OPERATION: "Get blog by id",
         CONTEXT: {
            method: "POST",
            route: "/blogs/get-blog-by-id",
            responseStatus: code,
         },
      };
   },
   UPDATE_BLOG: (code = 0) => {
      return {
         OPERATION: "Update blog",
         CONTEXT: {
            method: "POST",
            route: "/blogs/update-blog",
            responseStatus: code,
         },
      };
   },
   DELETE_BLOG: (code = 0) => {
      return {
         OPERATION: "Delete blog",
         CONTEXT: {
            method: "POST",
            route: "/blogs/delete-blog",
            responseStatus: code,
         },
      };
   },
   CREATE_CAREER: (code = 0) => {
      return {
         OPERATION: "Create career",
         CONTEXT: {
            method: "POST",
            route: "/blogs/create-career",
            responseStatus: code,
         },
      };
   },
   GET_ALL_CAREERS: (code = 0) => {
      return {
         OPERATION: "Get all careers",
         CONTEXT: {
            method: "POST",
            route: "/blogs/get-all-careers",
            responseStatus: code,
         },
      };
   },
   GET_CAREER_BY_ID: (code = 0) => {
      return {
         OPERATION: "Get career by id",
         CONTEXT: {
            method: "POST",
            route: "/blogs/get-career-by-id",
            responseStatus: code,
         },
      };
   },
   UPDATE_CAREER: (code = 0) => {
      return {
         OPERATION: "Update career",
         CONTEXT: {
            method: "POST",
            route: "/blogs/update-career",
            responseStatus: code,
         },
      };
   },
   DELETE_CAREER: (code = 0) => {
      return {
         OPERATION: "Delete career",
         CONTEXT: {
            method: "POST",
            route: "/blogs/delete-career",
            responseStatus: code,
         },
      };
   },
}

module.exports = LOGGER_MESSAGES
