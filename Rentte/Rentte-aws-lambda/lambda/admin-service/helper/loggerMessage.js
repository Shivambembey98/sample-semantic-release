
const LOGGER_MESSAGES = {
   REGISTER_ADMIN: (code = 0) => {
      return {
         OPERATION: "Admin registration",
         CONTEXT: {
            method: "POST",
            route: "/admin/auth/register",
            responseStatus: code,
         },
      };
   },
   LOGIN_ADMIN: (code = 0) => {
      return {
         OPERATION: "Admin login",
         CONTEXT: {
            method: "POST",
            route: "/admin/auth/login",
            responseStatus: code,
         },
      };
   },
   FORGOT_PASSWORD: (code = 0) => {
      return {
         OPERATION: "Forgot password",
         CONTEXT: {
            method: "POST",
            route: "/admin/auth/forget-password",
            responseStatus: code,
         },
      };
   },
   RESET_PASSWORD: (code = 0) => {
      return {
         OPERATION: "Reset password",
         CONTEXT: {
            method: "POST",
            route: "/admin/auth/reset-password",
            responseStatus: code,
         },
      };
   },
   SEND_OTP: (code = 0) => {
      return {
         OPERATION: "Send OTP",
         CONTEXT: {
            method: "POST",
            route: "/admin/auth/send-otp",
            responseStatus: code,
         },
      };
   },
   VERIFY_OTP: (code = 0) => {
      return {
         OPERATION: "Verify OTP",
         CONTEXT: {
            method: "POST",
            route: "/admin/auth/verify-otp",
            responseStatus: code,
         },
      };
   },
   CHANGE_PASSWORD: (code = 0) => {
      return {
         OPERATION: "Change password",
         CONTEXT: {
            method: "POST",
            route: "/admin/auth/change-password",
            responseStatus: code,
         },
      };
   },
   ADD_CATEGORY: (code = 0) => {
      return {
         OPERATION: "Add Category",
         CONTEXT: {
            method: "POST",
            route: "/admin/auth/create-category",
            responseStatus: code,
         },
      };
   },
   CATEGORY_LIST: (code = 0) => {
      return {
         OPERATION: "Category list",
         CONTEXT: {
            method: "POST",
            route: "/admin/auth/category-list",
            responseStatus: code,
         },
      };
   },
   UPDATE_CATEGORY: (code = 0) => {
      return {
         OPERATION: "Update category",
         CONTEXT: {
            method: "POST",
            route: "admin/product/update-category",
            responseStatus: code,
         },
      };
   },
   DELETE_CATEGORY: (code = 0) => {
      return {
         OPERATION: "Delete category",
         CONTEXT: {
            method: "POST",
            route: "admin/product/delete-category",
            responseStatus: code,
         },
      };
   },
   ADD_SUBCATEGORY: (code = 0) => {
      return {
         OPERATION: "Add Subcategory",
         CONTEXT: {
            method: "POST",
            route: "admin/product/create-subcategory",
            responseStatus: code,
         },
      };
   },
   DELETE_SUBCATEGORY: (code = 0) => {
      return {
         OPERATION: "Delete Subcategory",
         CONTEXT: {
            method: "POST",
            route: "admin/product//delete-subcategory",
            responseStatus: code,
         },
      };
   },
   UPDATE_SUBCATEGORY: (code = 0) => {
      return {
         OPERATION: "Update Subcategory",
         CONTEXT: {
            method: "POST",
            route: "admin/product//update-subcategory",
            responseStatus: code,
         },
      };
   },
   SUBCATEGORY_LIST: (code = 0) => {
      return {
         OPERATION: "Subcategory list",
         CONTEXT: {
            method: "POST",
            route: "admin/product//subcategory-list",
            responseStatus: code,
         },
      };
   },
   BLOCK_AND_UNBLOCK_PRODUCT: (code = 0) => {
      return {
         OPERATION: "Block and unblock product",
         CONTEXT: {
            method: "POST",
            route: "/admin/auth/block-and-unblock-product",
            responseStatus: code,
         },
      };
   },
   BLOCK_AND_UNBLOCK_USER: (code = 0) => {
      return {
         OPERATION: "Block and unblock user",
         CONTEXT: {
            method: "POST",
            route: "/admin/auth/block-and-unblock-user",
            responseStatus: code,
         },
      };
   },
   POST_BANNER: (code = 0) => {
      return {
         OPERATION: "Post Banner",
         CONTEXT: {
            method: "POST",
            route: "admin/product/update-categorypost-banner",
            responseStatus: code,
         },
      };
   },
   UPDATE_BANNER: (code = 0) => {
      return {
         OPERATION: " Update Banner ",
         CONTEXT: {
            method: "POST",
            route: "/admin/product/update-banner",
            responseStatus: code,
         },
      };
   },
   DELETE_BANNER: (code = 0) => {
      return {
         OPERATION: "Delete Banner",
         CONTEXT: {
            method: "POST",
            route: "/admin/product/delete-banner",
            responseStatus: code,
         },
      };
   },
   IMAGE_VALIDATION: (code = 0) => {
      return {
         OPERATION: "Image validation",
         CONTEXT: {
            method: "POST",
            route: "/admin/product/image-validation",
            responseStatus: code,
         },
      };
   },
   JOB_APPLICATION: (code = 0) => {
      return {
         OPERATION: "Job application",
         CONTEXT: {
            method: "POST",
            route: "/admin/jobs/get-all-jobapplications",
            responseStatus: code,
         },
      };
   },
   CREATE_FAQ_CATEGORY: (code = 0) => {
      return {
         OPERATION: "Create faq category",
         CONTEXT: {
            method: "POST",
            route: "/admin/faq/create-faq-category",
            responseStatus: code,
         },
      };
   },
   EDIT_FAQ_CATEGORY: (code = 0) => {
      return {
         OPERATION: "Edit faq category",
         CONTEXT: {
            method: "POST",
            route: "/admin/faq/edit-faq-category",
            responseStatus: code,
         },
      };
   },
   DELETE_FAQ_CATEGORY: (code = 0) => {
      return {
         OPERATION: "Delete faq category",
         CONTEXT: {
            method: "POST",
            route: "/admin/faq/delete-faq-category",
            responseStatus: code,
         },
      };
   },
   CREATE_FAQ: (code = 0) => {
      return {
         OPERATION: "Create faq",
         CONTEXT: {
            method: "POST",
            route: "/admin/faq/create-faq",
            responseStatus: code,
         },
      };
   },
   EDIT_FAQ: (code = 0) => {
      return {
         OPERATION: "Edit faq",
         CONTEXT: {
            method: "POST",
            route: "/admin/faq/edit-faq",
            responseStatus: code,
         },
      };
   },
   DELETE_FAQ: (code = 0) => {
      return {
         OPERATION: "Delete faq",
         CONTEXT: {
            method: "POST",
            route: "/admin/faq/delete-faq",
            responseStatus: code,
         },
      };
   },
   GET_ALL_CUSTOMER_QUERY: (code = 0) => {
      return {
         OPERATION: "Get all customer query",
         CONTEXT: {
            method: "POST",
            route: "/admin/faq/get-all-customer-query",
            responseStatus: code,
         },
      };
   },
   GET_ALL_JOB_APPLICATION: (code = 0) => {
      return {
         OPERATION: "Get all job application",
         CONTEXT: {
            method: "POST",
            route: "/admin/career/get-all-job-application",
            responseStatus: code,
         },
      };
   },
};

module.exports = {
   LOGGER_MESSAGES,
};
