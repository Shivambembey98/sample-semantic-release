const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
   host: process.env.SMTP_HOST,
   port: process.env.SMTP_PORT,
   secure: false,
   auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
   },
});

const sendEmail = async (to, subject, data) => {
   const mailOptions = {
      from: `"Rentte Team" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: `
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Content</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #333333;
        }
        .email-container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            border: 1px solid #dddddd;
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            text-align: center;
            padding: 20px;
        }
        .header img {
            max-width: 120px;
            margin-bottom: 15px;
        }
        .content {
            padding: 30px;
            font-size: 16px;
            line-height: 1.7;
            color: #555555;
        }
        .content h2 {
            color: #0c6c6a;
            font-size: 20px;
            margin-bottom: 20px;
        }
        .cta-button {
            display: inline-block;
            padding: 12px 25px;
            margin-top: 20px;
            background-color: #0c6c6a;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-size: 14px;
        }
        .cta-button:hover {
            background-color: #056e6a;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #888888;
            border-top: 1px solid #dddddd;
        }
        .footer a {
            color: #0c6c6a;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://rentte-images.s3.ap-south-1.amazonaws.com/rentte/rentteLogo.png" alt="Rentte Logo">
        </div>
        <div class="content">
            <h2>Hello ${data.userType},</h2>
            <p>Thank you for your continued support and trust in Rentte! We're reaching out to provide you with some important updates regarding our services.</p>
            <p>
            ${data.message}
            </p>
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Rentte Team. All rights reserved.</p>
            <p>Want to unsubscribe? <a href="${process.env.EMAIL_SERVICE_API_URL}/notification/email/unsubscribe-email-notification?email=${to}">Click here</a>.</p>
        </div>
    </div>
</body>
</html>

      `,
   };
   return transporter.sendMail(mailOptions);
};

module.exports = {
   sendEmail,
};
