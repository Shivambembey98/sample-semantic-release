const AWS = require('aws-sdk');
// const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
AWS.config.update({ region: 'ap-south-1' });
// const client = new SESClient({ region: "ap-south-1" });
require('dotenv').config();
const constant = require("../../config/constant");
const logger = require("../../config/winston");
const { inputValidation } = require('../../validators/notification');
const LOGGER_MESSAGES = require('../../helper/loggerMessage');
const { sendMail } = require('../../helper/mailSmtp');
const { processMessages, createBatches } = require('../../config/sqsService');
const { sendResponse } = require('../../config/helper');
const { SEND_BULK_EMAIL,SEND_EMAIL_NOTIFICATION,
   CONTACT_US, REPLY_TO_CUSTOMER_QUERIES } = LOGGER_MESSAGES
const knex = require("../../db/db");
module.exports = {
   sendBulkEmail: async (req, res) => {
      try {
         const { emailList, subject, message,userType } = req.body;
         if (userType === 'partner') {
            const emails = await knex('users')
               .select('email')
               .where({ userType: 'partner', isEmailVerify: true, isSubscribeUser: true })
               .whereNotNull('email')
            const allPartnerEmails = emails.map((user) => user.email);
            logger.info("Partner process Email Batch",allPartnerEmails, subject, { message, userType })
            await createBatches(allPartnerEmails, subject, { message, userType });
            return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {}, 1);
         }
         if (userType === 'user') {
            const emails = await knex('users')
               .select('email')
               .where({ userType: 'user', isEmailVerify: true, isSubscribeUser: true })
               .whereNotNull('email')
            const allUserEmails = emails.map((user) => user.email);
            await createBatches(allUserEmails, subject, { message, userType });
            logger.info("Partner process Email Batch",allUserEmails, subject, { message, userType })
            return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {}, 1);
         }
         if (!emailList || emailList.length === 0) {
            return sendResponse('Email list is required', res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         const checkAllEmaiVerified = await knex('users')
            .whereIn('email', emailList)
            .andWhere('isEmailVerify', false)
            .select('email');
         
         if (checkAllEmaiVerified.length > 0) {
            return sendResponse('Email is not verified', res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         await createBatches(emailList, subject, { message, userType });
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {}, 1);
      } catch (error) {
         logger.error("Exception error", {
            error: error.message,
            stack: error.stack,
            context: SEND_BULK_EMAIL(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.INTERNAL_ERROR, 
            res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   sendEmailNotification: async (req, res) => {
      try {
         let status = false
         while (status === false) {
            const statusQueue = await processMessages();
            if (statusQueue === true) {
               status = false
            } else {
               status = true
               return res.status(200).json({ message: "Emails sent successfully" });
            }
         }
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {}, 1);
      } catch (error) {
         logger.error("Exception error", {
            error: error.message,
            stack: error.stack,
            context: SEND_EMAIL_NOTIFICATION(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(
            constant.MESSAGE.INTERNAL_ERROR,
            res,
            constant.CODE.INTERNAL_SERVER_ERROR,
            {},
            0,
         );
      }
   },
   contactUs: async (req, res) => {
      try {
         const { email, message } = req.body;
  
         const requestValidation = await inputValidation(req.body, "contactUsValidator");
         if (requestValidation) {
            logger.error("Exception error", {
               error: requestValidation,
               context: CONTACT_US(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(requestValidation, res, constant.CODE.INPUT_VALIDATION, {}, 0);
         }
      
  
         // const adminEmailParams = {
         //    Source: AWS_SES_SENDER,
         //    Destination: {
         //       ToAddresses: [AWS_SES_SENDER],
         //    },
         //    Message: {
         //       Body: {
         //          Html: {
         //             Charset: "UTF-8",
         //             Data: `
         //               <div style="font-family: Arial, sans-serif; line-height: 1.5; 
         //               color: #333; max-width: 600px; margin: auto;">
         //                   <p style="font-size: 16px;">You have received a new enquiry:</p>
         //                   <p><strong>Email:</strong> ${email}</p>
         //                   <p><strong>Message:</strong></p>
         //                   <p>${message}</p>
         //               </div>
         //                  `,
         //          },
         //       },
         //       Subject: {
         //          Charset: "UTF-8",
         //          Data: "Enquiry Alert!",
         //       },
         //    },
         // };
  
         // const userEmailParams = {
         //    Source: AWS_SES_SENDER,
         //    Destination: {
         //       ToAddresses: [email],
         //    },
         //    Message: {
         //       Body: {
         //          Html: {
         //             Charset: "UTF-8",
         //             Data: `
         //    <div style="font-family: Arial, sans-serif; 
         //    line-height: 1.5; color: #333; max-width: 600px; margin: auto;">
         //    <p style="font-size: 16px;">Thank you for reaching out to us!</p>
         //          <p>We’ve successfully received your email and are reviewing your query. 
         //          Our team will address your concern as quickly as possible. 
         //          Expect a response soon.</p>
         //          <p>Thank you for your patience!</p>
         //      </div>
         //      <footer style="margin-top: 40px; text-align: center; 
         //      font-size: 12px; color: #888;">
         //          <p>Thank you for choosing Rentte!</p>
         //          <p>Follow us on 
         //              <a href="https://www.facebook.com/profile.php?id=61561400166548" 
         //              style="color: #0073e6;">Facebook</a> |
         //              <a href="https://www.instagram.com/__rentte__/" 
         //              style="color: #0073e6;">Instagram</a> |
         //              <a href="https://www.youtube.com/channel/UCnmEe6bRKX1sgNVnezqULOA" 
         //              style="color: #0073e6;">YouTube</a> |
         //              <a href="https://x.com/Rentte24" style="color: #0073e6;">Twitter</a>
         //          </p>
         //          <p>&copy; ${new Date().getFullYear()} Rentte. All rights reserved.</p>
         //      </footer>
         //                  `,
         //          },
         //       },
         //       Subject: {
         //          Charset: "UTF-8",
         //          Data: "We’ve Received Your Email",
         //       },
         //    },
         // };
  
         // const sendAdminMail = new SendEmailCommand(adminEmailParams);
         // const sendUserMail = new SendEmailCommand(userEmailParams);
  
         // await client.send(sendAdminMail);
         // await client.send(sendUserMail);

         const emailParamsAdmin = {
            email: process.env.SMTP_USER,
            html: `
             <div style="font-family: Arial, sans-serif; line-height: 1.5; 
                color: #333; max-width: 600px; margin: auto;">
                    <p style="font-size: 16px;">You have received a new enquiry:</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Message: ${message}</strong></p>
                </div>
            `,
            subject: "Enquiry Alert!",
         }
         const emailParamsUser = {
            email,
            html: `
            <div style="font-family: Arial, sans-serif; 
            line-height: 1.5; color: #333; max-width: 600px; margin: auto;">
            <p style="font-size: 16px;">Thank you for reaching out to us!</p>
                  <p>We’ve successfully received your email and are reviewing your query. 
                  Our team will address your concern as quickly as possible. 
                  Expect a response soon.</p>
                  <p>Thank you for your patience!</p>
              </div>
              <footer style="margin-top: 40px; text-align: center; 
              font-size: 12px; color: #888;">
                  <p>Thank you for choosing Rentte!</p>
                  <p>Follow us on 
                      <a href="https://www.facebook.com/profile.php?id=61561400166548" 
                      style="color: #0073e6;">Facebook</a> |
                      <a href="https://www.instagram.com/__rentte__/" 
                      style="color: #0073e6;">Instagram</a> |
                      <a href="https://www.youtube.com/channel/UCnmEe6bRKX1sgNVnezqULOA" 
                      style="color: #0073e6;">YouTube</a> |
                      <a href="https://x.com/Rentte24" style="color: #0073e6;">Twitter</a>
                  </p>
                  <p>&copy; ${new Date().getFullYear()} Rentte. All rights reserved.</p>
              </footer>`,
            subject: "We’ve Received Your Email",
         }
         await sendMail(res, emailParamsAdmin);
         await sendMail(res, emailParamsUser);
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {}, 1);
      } catch (error) {
         logger.error("Exception error", {
            error: error.message,
            stack: error.stack,
            context: CONTACT_US(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.INTERNAL_ERROR, 
            res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   replyCustomerQueries: async (req, res) => {
      try {
         const { email,message } = req.body;
  
         const requestValidation = await inputValidation(req.body, "contactUsValidator");
         if (requestValidation) {
            logger.error("Exception error", {
               error: requestValidation,
               context: REPLY_TO_CUSTOMER_QUERIES(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(requestValidation, res, constant.CODE.INPUT_VALIDATION, {}, 0);
         }
       
         // const userEmailParams = {
         //    Source: AWS_SES_SENDER,
         //    Destination: {
         //       ToAddresses: [email],
         //    },
         //    Message: {
         //       Body: {
         //          Html: {
         //             Charset: "UTF-8",
         //             Data: `
         //    <div style="font-family: Arial, sans-serif; 
         //    line-height: 1.5; color: #333; max-width: 600px; margin: auto;">
         //    <p style="font-size: 16px;">Thank you for reaching out to us!</p>
                           
         //                    <p>${message}</p>
         //                </div>
         //                <footer style="margin-top: 40px; text-align: center; 
         //                font-size: 12px; color: #888;">
         //                    <p>Thank you for choosing Rentte!</p>
         //                    <p>Follow us on 
         //                        <a href="https://www.facebook.com/profile.php?id=61561400166548" 
         //                        style="color: #0073e6;">Facebook</a> |
         //                        <a href="https://www.instagram.com/__rentte__/" 
         //                        style="color: #0073e6;">Instagram</a> |
         //                        <a href="https://www.youtube.com/channel/UCnmEe6bRKX1sgNVnezqULOA" 
         //                        style="color: #0073e6;">YouTube</a> |
         //                        <a href="https://x.com/Rentte24" style="color: #0073e6;">Twitter</a>
         //                    </p>
         //                    <p>&copy; ${new Date().getFullYear()} Rentte. All rights reserved.</p>
         //                </footer>
         //                  `,
         //          },
         //       },
         //       Subject: {
         //          Charset: "UTF-8",
         //          Data: "We’ve Received Your Email",
         //       },
         //    },
         // };
         const emailParams = {
            email,
            html: `
             <div style="font-family: Arial, sans-serif; 
            line-height: 1.5; color: #333; max-width: 600px; margin: auto;">
            <p style="font-size: 16px;">Thank you for reaching out to us!</p>
                           
                            <p>${message}</p>
                        </div>
                        <footer style="margin-top: 40px; text-align: center; 
                        font-size: 12px; color: #888;">
                            <p>Thank you for choosing Rentte!</p>
                            <p>Follow us on 
                                <a href="https://www.facebook.com/profile.php?id=61561400166548" 
                                style="color: #0073e6;">Facebook</a> |
                                <a href="https://www.instagram.com/__rentte__/" 
                                style="color: #0073e6;">Instagram</a> |
                                <a href="https://www.youtube.com/channel/UCnmEe6bRKX1sgNVnezqULOA" 
                                style="color: #0073e6;">YouTube</a> |
                                <a href="https://x.com/Rentte24" style="color: #0073e6;">Twitter</a>
                            </p>
                            <p>&copy; ${new Date().getFullYear()} Rentte. All rights reserved.</p>
                        </footer>
            `,
            subject: "We’ve Received Your Email",
         }
       
  
         // const sendUserMail = new SendEmailCommand(userEmailParams);
         // await client.send(sendUserMail);  
         await sendMail(res, emailParams);
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {}, 1);
      } catch (error) {
         logger.error("Exception error", {
            error: error.message,
            stack: error.stack,
            context: REPLY_TO_CUSTOMER_QUERIES(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.INTERNAL_ERROR, 
            res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   unsubscribeUser: async (req,res) => {
      try {
         const { email } = req.query;
         const unsubscribe = await knex('users').where({ email })
            .update({ isSubscribeUser: false });
         if (unsubscribe === 1) {
            return res.redirect(process.env.UNSUBSCRIBE_EMAIL_TEMPLATE)
         }
         return sendResponse('Fail to unsubscribe',res,constant.CODE.BAD_REQUEST,{},0);
      } catch (error) {
         logger.error("Exception error", {
            error: error.message,
            stack: error.stack,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.INTERNAL_ERROR, 
            res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },


};
