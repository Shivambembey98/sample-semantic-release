
const LOGGER_MESSAGES = {
   REGISTER: (code = 0) => {
      return {
         OPERATION: "user registration",
         CONTEXT: {
            method: "POST",
            route: "/user/auth/register",
            responseStatus: code,
         },
      };
   },
   LOGIN: (code = 0) => {
      return {
         OPERATION: "user login",
         CONTEXT: {
            method: "POST",
            route: "/user/auth/login",
            responseStatus: code,
         },
      };
   },
   UPDATE_PROFILE: (code = 0) => {
      return {
         OPERATION: "update profile user",
         CONTEXT: {
            method: "POST",
            route: "/user/auth/update-profile",
            responseStatus: code,
         },
      };
   },
   UPDATE_KYC: (code = 0) => {
      return {
         OPERATION: "update KYC user",
         CONTEXT: {
            method: "POST",
            route: "/user/auth/update-kyc",
            responseStatus: code,
         },
      };
   },
   SEND_OTP: (code = 0) => {
      return {
         OPERATION: "send otp user",
         CONTEXT: {
            method: "POST",
            route: "/user/auth/send-otp",
            responseStatus: code,
         },
      };
   },
   VERIFY_EMAIL_OTP: (code = 0) => {
      return {
         OPERATION: "verify email otp ",
         CONTEXT: {
            method: "POST",
            route: "/user/auth/verify-email-otp",
            responseStatus: code,
         },
      };
   },
   VERIFY_OTP: (code = 0) => {
      return {
         OPERATION: "verify otp user",
         CONTEXT: {
            method: "POST",
            route: "/user/auth/verify-otp",
            responseStatus: code,
         },
      };
   },
   LIST_USER: (code = 0) => {
      return {
         OPERATION: "list all user",
         CONTEXT: {
            method: "POST",
            route: "/user/auth/user-list",
            responseStatus: code,
         },
      };
   },
   DETAIL_USER: (code = 0) => {
      return {
         OPERATION: "user detail",
         CONTEXT: {
            method: "POST",
            route: "/user/auth/detail-user",
            responseStatus: code,
         },
      };
   },
   LIST_ALL_PARTNER: (code = 0) => {
      return {
         OPERATION: "list all partner",
         CONTEXT: {
            method: "POST",
            route: "/user/partner/partner-list",
            responseStatus: code,
         },
      };
   },
   DASHBOARD_PARTNER: (code = 0) => {
      return {
         OPERATION: "Dashboard partner",
         CONTEXT: {
            method: "POST",
            route: "/user/partner/partner-dashboard",
            responseStatus: code,
         },
      };
   },
   CREATE_RATING: (code = 0) => {
      return {
         OPERATION: "create rating",
         CONTEXT: {
            method: "POST",
            route: "/user/product/create-rating",
            responseStatus: code,
         },
      };
   },
   RATING_LIST: (code = 0) => {
      return {
         OPERATION: "create rating",
         CONTEXT: {
            method: "POST",
            route: "/user/product/rating-list",
            responseStatus: code,
         },
      };
   },
   EDIT_RATING: (code = 0) => {
      return {
         OPERATION: "edit rating",
         CONTEXT: {
            method: "POST",
            route: "/user/product/edit-rating",
            responseStatus: code,
         },
      };
   },
   DELETE_RATING: (code = 0) => {
      return {
         OPERATION: "delete rating",
         CONTEXT: {
            method: "POST",
            route: "/user/product/delete-rating",
            responseStatus: code,
         },
      };
   },
   GET_CATEGORY_LIST: (code = 0) => {
      return {
         OPERATION: "get category list",
         CONTEXT: {
            method: "GET",
            route: "/user/product/category-list",
            responseStatus: code,
         },
      };
   },
   GET_SUBCATEGORY_LIST: (code = 0) => {
      return {
         OPERATION: "get category list",
         CONTEXT: {
            method: "GET",
            route: "/user/product/subcategory-list",
            responseStatus: code,
         },
      };
   },
   CREATE_HISTORY_PARTNER: (code = 0) => {
      return {
         OPERATION: "Create history partner",
         CONTEXT: {
            method: "POST",
            route: "/user/product/create-history-partner",
            responseStatus: code,
         },
      };
   },
   GET_HISTORY_PARTNER: (code = 0) => {
      return {
         OPERATION: "Get history partner",
         CONTEXT: {
            method: "GET",
            route: "/user/product/get-history-partner",
            responseStatus: code,
         },
      };
   },
   CREATE_PRODUCT: (code = 0) => {
      return {
         OPERATION: "Create product",
         CONTEXT: {
            method: "POST",
            route: "/user/product/create-product",
            responseStatus: code,
         },
      };
   },
   GET_PRODUCT_LIST: (code = 0) => {
      return {
         OPERATION: "Get product list",
         CONTEXT: {
            method: "GET",
            route: "/user/product/product-list",
            responseStatus: code,
         },
      };
   },
   GET_PRODUCT_DETAIL: (code = 0) => {
      return {
         OPERATION: "Get product detail",
         CONTEXT: {
            method: "GET",
            route: "/user/product/product-detail",
            responseStatus: code,
         },
      };
   },
   EDIT_PRODUCT: (code = 0) => {
      return {
         OPERATION: "Edit product",
         CONTEXT: {
            method: "POST",
            route: "/user/product/edit-product",
            responseStatus: code,
         },
      };
   },
   DELETE_PRODUCT: (code = 0) => {
      return {
         OPERATION: "Delete product",
         CONTEXT: {
            method: "POST",
            route: "/user/product/delete-product",
            responseStatus: code,
         },
      };
   },
   LEGAL_POLICY_ACCEPTANCE: (code = 0) => {
      return {
         OPERATION: "legal policy acceptance",
         CONTEXT: {
            method: "POST",
            route: "/user/auth/legal-policy-acceptance",
            responseStatus: code,
         },
      };
   },
   RESET_PASSWORD: (code = 0) => {
      return {
         OPERATION: "reset password",
         CONTEXT: {
            method: "POST",
            route: "/user/auth/reset-password",
            responseStatus: code,
         },
      };
   },
   CHANGE_PASSWORD: (code = 0) => {
      return {
         OPERATION: "change password",
         CONTEXT: {
            method: "POST",
            route: "/user/auth/change-password",
            responseStatus: code,
         },
      };
   },
   FORGOT_PASSWORD: (code = 0) => {
      return {
         OPERATION: "forgot password",
         CONTEXT: {
            method: "POST",
            route: "/user/auth/forgot-password",
            responseStatus: code,
         },
      };
   },
   GET_ALL_FAQ: (code = 0) => {
      return {
         OPERATION: "get all faq",
         CONTEXT: {
            method: "GET",
            route: "/user/faq/faq-list",
            responseStatus: code,
         },
      };
   },
   GET_ALL_FAQ_CATEGORY: (code = 0) => {
      return {
         OPERATION: "get all faq category",
         CONTEXT: {
            method: "GET",
            route: "/user/faq/faq-category-list",
            responseStatus: code,
         },
      };
   },
   CREATE_CUSTOMER_QUERY: (code = 0) => {
      return {
         OPERATION: "create customer query",
         CONTEXT: {
            method: "GET",
            route: "/user/faq/create-customer-query",
            responseStatus: code,
         },
      };
   },
   GET_ALL_BLOG: (code = 0) => {
      return {
         OPERATION: "get all blog",
         CONTEXT: {
            method: "GET",
            route: "/user/blog/blog-list",
            responseStatus: code,
         },
      };
   },
   GET_ALL_CAREER: (code = 0) => {
      return {
         OPERATION: "get all career",
         CONTEXT: {
            method: "GET",
            route: "/user/career/career-list",
            responseStatus: code,
         },
      };
   },
   GET_FAQ_DETAILS: (code = 0) => {
      return {
         OPERATION: "Get FAQ Details",
         CONTEXT: {
            method: "GET",
            route: "/user/faq/faq-details",
            responseStatus: code,
         },
      };
   },
   GET_FAQ_CATEGORY_BY_ID: (code = 0) => {
      return {
         OPERATION: "Get FAQ Details",
         CONTEXT: {
            method: "GET",
            route: "/user/faq/get-faq-by-category",
            responseStatus: code,
         },
      };
      
   },
   APPLY_JOBS: (code = 0) => {
      return {
         OPERATION: "Apply jobs",
         CONTEXT: {
            method: "POST",
            route: "/user/jobs/applyjobs",
            responseStatus: code,
         },
      };
      
   },


};
module.exports = {
   LOGGER_MESSAGES,
};
