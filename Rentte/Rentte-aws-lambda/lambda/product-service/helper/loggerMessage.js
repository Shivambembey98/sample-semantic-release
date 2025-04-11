const LOGGER_MESSAGES = {
   CREATE_PRODUCT: (code = 0) => {
      return {
         OPERATION: "create product",
         CONTEXT: {
            method: "POST",
            route: "partner/product/create-product",
            responseStatus: code,
         },
      };
   },
   LIST_PRODUCT: (code = 0) => {
      return {
         OPERATION: "List product",
         CONTEXT: {
            method: "POST",
            route: "partner/product/list-product",
            responseStatus: code,
         },
      };
   },
   PRODUCT_DETAILS: (code = 0) => {
      return {
         OPERATION: "Product details",
         CONTEXT: {
            method: "POST",
            route: "partner/product/detail-product",
            responseStatus: code,
         },
      };
   },
   EDIT_PRODUCT: (code = 0) => {
      return {
         OPERATION: "edit product",
         CONTEXT: {
            method: "POST",
            route: "partner/product/edit-product",
            responseStatus: code,
         },
      };
   },
   DELETE_PRODUCT: (code = 0) => {
      return {
         OPERATION: "delete product",
         CONTEXT: {
            method: "POST",
            route: "partner/product/delete-product",
            responseStatus: code,
         },
      };
   },
   RENT_PRODUCT: (code = 0) => {
      return {
         OPERATION: "sell product",
         CONTEXT: {
            method: "POST",
            route: "partner/product/rent-product",
            responseStatus: code,
         },
      };
   },
   CANCEL_RENT_PRODUCT: (code = 0) => {
      return {
         OPERATION: "cancel product",
         CONTEXT: {
            method: "POST",
            route: "partner/product/cancel-product",
            responseStatus: code,
         },
      };
   },
   LIST_PRODUCT_PARTNER: (code = 0) => {
      return {
         OPERATION: "list product partner",
         CONTEXT: {
            method: "POST",
            route: "partner/product/product-list-partner",
            responseStatus: code,
         },
      };
   },
   CANCEL_SELL_PRODUCT: (code = 0) => {
      return {
         OPERATION: "cancel sell product",
         CONTEXT: {
            method: "POST",
            route: "partner/product/cancel-sell-product",
            responseStatus: code,
         },
      };
   },
   RELATED_SEARCH: (code = 0) => {
      return {
         OPERATION: "Related search",
         CONTEXT: {
            method: "GET",
            route: "/partner/product/related-search",
            responseStatus: code,
         },
      };
   },
   WISH_LIST_PRODUCT: (code = 0) => {
      return {
         OPERATION: "Wish list product",
         CONTEXT: {
            method: "POST",
            route: "/partner/product/wishlist",
            responseStatus: code,
         },
      };
   },
   PRODUCT_VIEW_COUNT: (code = 0) => {
      return {
         OPERATION: "Product view count",
         CONTEXT: {
            method: "POST",
            route: "/partner/product/product-view-count",
            responseStatus: code,
         },
      };
   },
   CHAT_CLICK_COUNT: (code = 0) => {
      return {
         OPERATION: "Product view count",
         CONTEXT: {
            method: "POST",
            route: "/partner/product/chat-click-count",
            responseStatus: code,
         },
      };
   },
   PRODUCT_SEARCH_COUNT: (code = 0) => {
      return {
         OPERATION: "Product view count",
         CONTEXT: {
            method: "POST",
            route: "/partner/product/product-search-count",
            responseStatus: code,
         },
      };
   },
   GET_BANNER_LIST: (code = 0) => {
      return {
         OPERATION: "Get banner list",
         CONTEXT: {
            method: "GET",
            route: "/partner/product/get-banner-list",
            responseStatus: code,
         },
      };
   },
   GET_WISHLIST_PRODUCT: (code = 0) => {
      return {
         OPERATION: "Get wishlist product",
         CONTEXT: {
            method: "GET",
            route: "/partner/product/get-wishlist-product",
            responseStatus: code,
         },
      };
   },
   GET_FEATURED_PRODUCT: (code = 0) => {
      return {
         OPERATION: "Get featured product",
         CONTEXT: {
            method: "GET",
            route: "/partner/product/get-featured-product",
            responseStatus: code,
         },
      };
   },
};

module.exports = {
   LOGGER_MESSAGES,
};
