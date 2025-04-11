const uuid = require("uuid");
const { NODE_ENV } = process.env;
const moment = require("moment-timezone");
const AWS = require("aws-sdk");
AWS.config.update({ region: "ap-south-1" });
const { AWS_SES_SENDER } = process.env;
const ses = new AWS.SES();
module.exports = {
   sendResponse: (msg, res, statusCode, data = null, customeCode = 0) => {
      const finalData = {
         code: customeCode,
         message: msg,
         result: data === null ? {} : data,
      };
      return res.status(statusCode).json(finalData);
   },
   commonLogger: () => {
      return {
         timestamp: moment().tz("Asia/Kolkata")
            .format("YYYY-MM-DDTHH:mm:ss"),
         correlationId: uuid.v4(),
         requestId: uuid.v4(),
         environment: NODE_ENV,
         level: "info",
      };
   },
   loginSuccess: async (email) => {
      try {
         const params = {
            Source: AWS_SES_SENDER, // Verified sender email address
            Destination: {
               ToAddresses: [email], // List of recipient email addresses
            },
            Message: {
               Body: {
                  Html: {
                     Charset: "UTF-8",
                     Data: `<h1>You have logged in successfully 
                     to Rentte</h1><p>Thank you for using our service!</p>`,
                  },
                  Text: {
                     Charset: "UTF-8",
                     Data: `You have logged in successfully to Rentte.
                     Thank you for using our service!`,
                  },
               },
               Subject: {
                  Charset: "UTF-8",
                  Data: "Login Successful",
               },
            },
         };
         return await ses.sendEmail(params).promise();
      } catch (error) {
         console.error("Error sending login success email:", error.message);
         return {
            success: false,
            message: "Failed to send email, but continuing execution.",
         };
      }
   },
   registerSuccess: async (email, userType) => {
      try {
         const params = {
            Source: AWS_SES_SENDER, // Verified sender email address
            Destination: {
               ToAddresses: [email], // List of recipient email addresses
            },
            Message: {
               Body: {
                  Html: {
                     Charset: "UTF-8",
                     Data: `<h1>You have successfully registered as a <span style="text-transform: 
                     capitalize;">${userType}</span> with Rentte</h1><p>
                     Thank you for using our service!</p>`,
                  },
                  Text: {
                     Charset: "UTF-8",
                     Data: `You have register successfully to Rentte. 
                     Thank you for using our service!`,
                  },
               },
               Subject: {
                  Charset: "UTF-8",
                  Data: "Register Successful",
               },
            },
         };
         return await ses.sendEmail(params).promise();
      } catch (error) {
         console.error("Error sending login success email:", error.message);
         return {
            success: false,
            message: "Failed to send email, but continuing execution.",
         };
      }
   },

   contactUsEmail: async (email, message) => {
      try {
         const params = {
            Source: AWS_SES_SENDER, // Verified sender email address
            Destination: {
               ToAddresses: [email], // List of recipient email addresses
            },
            Message: {
               Body: {
                  Html: {
                     Charset: "UTF-8",
                     Data: `<h1>Thank you for contacting us.</h1>
                     <p><strong>Message:</strong></p>
                     <p>${message}</p>`,
                  },
                  Text: {
                     Charset: "UTF-8",
                     Data: `You have received a new message from (${email}).
                     Message: ${message}`,
                  },
               },
               Subject: {
                  Charset: "UTF-8",
                  Data: "New Contact Form Submission",
               },
            },
         };

         return await ses.sendEmail(params).promise();
      } catch (error) {
         console.error("Error sending contact us email:", error.message);
         return {
            success: false,
            message: "Failed to send email, but continuing execution.",
         };
      }
   },
};
