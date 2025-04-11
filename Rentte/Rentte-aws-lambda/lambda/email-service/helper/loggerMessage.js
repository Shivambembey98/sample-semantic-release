const LOGGER_MESSAGES = {
   SEND_BULK_EMAIL: (code = 0) => {
      return {
         OPERATION: "Send Bulk email",
         CONTEXT: {
            method: "POST",
            route: "/notification/email/bulk-email",
            responseStatus: code,
         },
      };
   },
   SEND_EMAIL_NOTIFICATION: (code = 0) => {
      return {
         OPERATION: "Send email notification",
         CONTEXT: {
            method: "POST",
            route: "/notification/email/send-email-notification",
            responseStatus: code,
         },
      };
   },
   CONTACT_US: (code = 0) => {
      return {
         OPERATION: "Contact Us",
         CONTEXT: {
            method: "POST",
            route: "/notification/email/contact-us-user",
            responseStatus: code,
         },
      };
   },
   REPLY_TO_CUSTOMER_QUERIES: (code = 0) => {
      return {
         OPERATION: "Reply to customer queries",
         CONTEXT: {
            method: "POST",
            route: "/notification/email/reply-to-customer",
            responseStatus: code,
         },
      };
   },
}
 
module.exports = LOGGER_MESSAGES
 
