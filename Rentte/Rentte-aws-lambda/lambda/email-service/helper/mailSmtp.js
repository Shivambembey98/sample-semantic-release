const nodemailer = require("nodemailer");
const { sendResponse } = require("../config/helper");
require("dotenv").config();
const { SMTP_USER, SMTP_PASS,SMTP_HOST,SMTP_PORT } = process.env;
const sendMail = async (res, data) => {
   try {
      const { email, subject, html } = data
      const transporter = nodemailer.createTransport({
         host: SMTP_HOST,
         port: SMTP_PORT,
         secure: false, // Use true for 465, false for 587
         auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
         },
      });
  
      const mailFormat = {
         from: SMTP_USER,
         to: email,
         subject,
         html,
      };
  
      // Use await with the sendMail method
      return await transporter.sendMail(mailFormat);
  
   } catch (error) {
      // Send an error response
      return sendResponse(error, res, 500, {}, 0);
   }
};

module.exports = { sendMail };
