
const constant = require("../../config/constant");
const { sendResponse, commonLogger } = require("../../config/helper");
const logger = require("../../config/winston");
const knex = require("../../db/db");
const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-south-1' });
// const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const { adminInputValidation } = require("../../validators/adminValidator");
const { sendMail } = require("../../helper/mail");
const { encryptdata, decryptData } = require("../../helper/validator");
const { LOGGER_MESSAGES } = require("../../helper/loggerMessage");
const SNS = new AWS.SNS();
const { REGISTER_ADMIN,LOGIN_ADMIN,FORGOT_PASSWORD,
   RESET_PASSWORD,SEND_OTP,VERIFY_OTP,CHANGE_PASSWORD } = LOGGER_MESSAGES;
module.exports = {
   register: async (req,res) => {
      try {
         logger.info("Request coming for register admin",{
            ...commonLogger(),
            operation: REGISTER_ADMIN().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { email,password } = req.body;
         const newAdminData = { 
            ...req.body, 
            password: encryptdata(password), // Encrypt the password
         };
         const requestValidation = await adminInputValidation(newAdminData,"adminInformation");
         if (requestValidation) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: "Validation Error",
               operation: REGISTER_ADMIN().OPERATION,
               context: REGISTER_ADMIN(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(requestValidation,res,constant.CODE.INPUT_VALIDATION,{},0);
         }
         logger.info(`Register user`,newAdminData);
         const user = await knex("users").where({ email })
            .first();
         if (user) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: "Admin already exists",
               operation: REGISTER_ADMIN().OPERATION,
               context: REGISTER_ADMIN(constant.CODE.ALREADY_EXIST).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.ALREADY_EXIST.replace("{{key}}","user"),
               res,constant.CODE.ALREADY_EXIST,{},0);
         }
         // req.body.password = await bcrypt.hash(password,constant.SALT_VALUE.value)
         await knex("users").insert(newAdminData);
         logger.info("Admin Registered",{
            ...commonLogger(),
            operation: REGISTER_ADMIN().OPERATION,
            context: REGISTER_ADMIN(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.SUCCESS,res,constant.CODE.SUCCESS,{},1);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: REGISTER_ADMIN().OPERATION,
            context: REGISTER_ADMIN(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message,res,constant.CODE.INTERNAL_SERVER_ERROR,{},0);
      }
   },
   login: async (req,res) => {
      try {
         logger.info("Request coming for login admin",{
            ...commonLogger(),
            operation: LOGIN_ADMIN().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { email,password } = req.body;
         const requestValidation = await adminInputValidation(req.body,"adminLoginValidation");
         if (requestValidation) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: "Validation Error",
               operation: LOGIN_ADMIN().OPERATION,
               context: LOGIN_ADMIN(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(requestValidation,res,constant.CODE.INPUT_VALIDATION,{},0);
         }
         const isExistUser = await knex("users").where({ email })
            .first();
         logger.info(`Login via user`,req.body);
         if (!isExistUser) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: "Login failed as user",
               operation: LOGIN_ADMIN().OPERATION,
               context: LOGIN_ADMIN(constant.CODE.NOT_EXIST).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.EMAIL_NOT_REGISTERED,res,
               constant.CODE.SUCCESS,{},constant.CODE.NOT_EXIST);
         }
        
         if (password !== decryptData(isExistUser.password)) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: "Incorrect Password",
               operation: LOGIN_ADMIN().OPERATION,
               context: LOGIN_ADMIN(constant.CODE.BAD_REQUEST).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.INCORRECT_PASS,res,constant.CODE.SUCCESS,{},0);
         }
         const token = jwt.sign(isExistUser,process.env.JWT_SECRET_KEY,{
            expiresIn: process.env.JWT_EXPIRES_IN,
         });
         logger.info("Logged In successfully",{
            ...commonLogger(),
            user: {
               detail: isExistUser,
               token,
            },
            operation: LOGIN_ADMIN().OPERATION,
            context: LOGIN_ADMIN(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.SUCCESS,res,
            constant.CODE.SUCCESS,{ token: `Bearer ${  token}`,user: isExistUser },1);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: LOGIN_ADMIN().OPERATION,
            context: LOGIN_ADMIN(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message,res,constant.CODE.INTERNAL_SERVER_ERROR,{},0);
      }
   },
   forgotPassword: async (req, res) => {
      try {
         logger.info("Request for forgot password",{
            ...commonLogger(),
            operation: FORGOT_PASSWORD().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         // validation
         const requestValidation = await adminInputValidation(req.body, "forgotPassword");
         if (requestValidation) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: "Validation Error",
               operation: FORGOT_PASSWORD().OPERATION,
               context: FORGOT_PASSWORD(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(requestValidation, res, constant.CODE.INPUT_VALIDATION, {}, 0);
         }
         const email = req.body.email ? req.body.email.toLowerCase() : {};
         const adminData = await knex("users").where({ email })
            .first();
         if (!adminData) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: "Email not registered",
               operation: FORGOT_PASSWORD().OPERATION,
               context: FORGOT_PASSWORD(constant.CODE.NOT_EXIST).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.EMAIL_NOT_REGISTERED, res,
               constant.CODE.SUCCESS, {}, constant.CODE.NOT_EXIST);
         }
         const { firstName,lastName } = adminData;
         const token = jwt.sign({ email: adminData.email, id: adminData.id },
            process.env.JWT_SECRET_KEY,
            {
               algorithm: "HS256",
               expiresIn: "300s",
            });
            
         await sendMail(res, {
            name: `${firstName  } ${  lastName}`,
            email,
            subject: "Password Reset Link",
            link: `${process.env.ADMIN_RESET_PASSWORD_URL}/${token}`,

         });
         logger.info("Reset link sent",{
            ...commonLogger(),
            user: {
               detail: adminData,
               token,
            },
            operation: FORGOT_PASSWORD().OPERATION,
            context: FORGOT_PASSWORD(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.EMAIL_SEND, res,
            constant.CODE.SUCCESS, { token: `Bearer ${  token}` }, 1);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: FORGOT_PASSWORD().OPERATION,
            context: FORGOT_PASSWORD(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
   resetPassword: async (req, res) => {
      try {
         logger.info("Request to reset password",{
            ...commonLogger(),
            operation: RESET_PASSWORD().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         // validation
         const requestValidation = await adminInputValidation(req.body, "resetPassword");
         if (requestValidation)    
         {
            logger.error("Exception error",{
               ...commonLogger(),
               error: "Validation Error",
               operation: RESET_PASSWORD().OPERATION,
               context: RESET_PASSWORD(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(requestValidation, res, constant.CODE.INPUT_VALIDATION, {}, 0);
         }
         const { token, confirmPassword } = req.body;
         // checks token is expired or not
         const tokenValidation = jwt.verify(
            token,
            process.env.JWT_SECRET_KEY,
            (error, valid) => {
               if (error) {
                  logger.error("Exception error",{
                     ...commonLogger(),
                     error: "Link Expired",
                     operation: RESET_PASSWORD().OPERATION,
                     context: RESET_PASSWORD(constant.MESSAGE.EXPIRE_LINK).CONTEXT,
                     client: {
                        ip: req.ip,
                        headers: req.headers,
                        requestBody: req.body,
                     },
                  });
                  return sendResponse(constant.MESSAGE.EXPIRE_LINK, res,
                     constant.CODE.SUCCESS, {}, 0);
               } else {
                  return valid;
               }
            },
         );
         if (tokenValidation) {
            const userDetail = await knex("users").where({ id: tokenValidation.id })
               .first();
            const { password } = userDetail;

            if (decryptData(password) === confirmPassword) {
               return sendResponse(constant.MESSAGE.PASSWORD_NOT_MATCH,
                  res, constant.CODE.BAD_REQUEST, {}, 0);
            }
            await knex("users").where({ id: tokenValidation.id })
               .update({ password: encryptdata(confirmPassword) });
            logger.info("User successfully registered",{
               ...commonLogger(),
               userId: tokenValidation.id,
               operation: RESET_PASSWORD().OPERATION,
               context: RESET_PASSWORD(constant.CODE.SUCCESS).CONTEXT,
               client: {
                  ip: req.ip,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.PASSWORD_UPDATE, 
               res, constant.CODE.SUCCESS, {}, 1);
         }
         return sendResponse(constant.MESSAGE.BAD_REQUEST,res,constant.CODE.BAD_REQUEST,{},0)
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: RESET_PASSWORD().OPERATION,
            context: RESET_PASSWORD(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);

      }
   },
   sendOtp: async (req,res) => {
      try {
         logger.info("Request to send OTP",{
            ...commonLogger(),
            operation: SEND_OTP().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const requestValidation = await adminInputValidation(req.body, "sendOtp");
         if (requestValidation) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: "Validation Error",
               operation: SEND_OTP().OPERATION,
               context: SEND_OTP(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(requestValidation, res, constant.CODE.INPUT_VALIDATION,{},0);
         }
         const { countryCode, mobile } = req.body;
         // eslint-disable-next-line no-mixed-operators
         const otp = Math.floor(100000 + Math.random() * 900000).toString();
         const sendOtp = {
            countryCode,
            mobile,
            otpType: constant.OTP_TYPE.SEND_OTP,
            otp,
         };
         const phoneNumber = countryCode + mobile;
         const params = {
            Message: `Your verification code is ${otp}`,
            PhoneNumber: phoneNumber,
            MessageAttributes: {
               'AWS.SNS.SMS.SenderID': {
                  DataType: 'String',
                  StringValue: 'rentte',
               },
            },
         };
         // const command = new PublishCommand(params)
         const message = await SNS.publish(params).promise();
         if (message) {
            await knex("userOtp")
               .insert(sendOtp)
               .returning('*'); 
            logger.info("OTP sent",{
               ...commonLogger(),
               operation: SEND_OTP().OPERATION,
               context: SEND_OTP(constant.CODE.SUCCESS).CONTEXT,
               client: {
                  ip: req.ip,
                  requestBody: req.body,
               },
            });   
            return sendResponse(constant.MESSAGE.SENT_OTP,res,constant.CODE.SUCCESS,{},1);
         }
         logger.error("Exception error",{
            ...commonLogger(),
            error: "Error",
            operation: SEND_OTP().OPERATION,
            context: SEND_OTP(constant.CODE.BAD_REQUEST).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.BAD_REQUEST,res,constant.CODE.BAD_REQUEST,{},0);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: SEND_OTP().OPERATION,
            context: SEND_OTP(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message,res,constant.CODE.INTERNAL_SERVER_ERROR,{},0);
      }
   },
   verifyOtp: async (req,res) => {
      try {
         logger.info("Request to verify OTP",{
            ...commonLogger(),
            operation: VERIFY_OTP().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { mobile,otp } = req.body;
         const requestValidation = await adminInputValidation(req.body, "verifyOtp");
         if (requestValidation) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: "Validation Error",
               operation: VERIFY_OTP().OPERATION,
               context: VERIFY_OTP(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(requestValidation, res, constant.CODE.INPUT_VALIDATION,{},0);
         }
         const isVerifyOtp = await knex("userOtp").where({ mobile,otp,isVerify: false })
            .first();
         if (!isVerifyOtp) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: "Invalid OTP",
               operation: VERIFY_OTP().OPERATION,
               context: VERIFY_OTP(constant.MESSAGE.INVALID_OTP).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.INVALID_OTP,
               res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         const [updatedOtp] = await knex("userOtp").where({ id: isVerifyOtp.id })
            .update({ isVerify: true })
            .returning("*");
         const { id,isVerify,otpType } = updatedOtp;
         logger.info("User successfully registered",{
            ...commonLogger(),
            userId: id,
            operation: VERIFY_OTP().OPERATION,
            context: VERIFY_OTP(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.VERIFIED.replace("{{key}}",'otp'),
            res,constant.CODE.SUCCESS,{ otpDetail: { id,isVerify,otpType } },1);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: VERIFY_OTP().OPERATION,
            context: VERIFY_OTP(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message,res,constant.CODE.INTERNAL_SERVER_ERROR,{},0);
      }
   },
   changePassword: async (req,res) => {
      try {
         logger.info("Request to change password",{
            ...commonLogger(),
            operation: CHANGE_PASSWORD().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { otpId,confirmPassword,mobile } = req.body;
         const { id } = req.user;
         const requestValidation = await adminInputValidation(req.body, "changePasswordValidation");
         if (requestValidation) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: "Validation Error",
               operation: CHANGE_PASSWORD().OPERATION,
               context: CHANGE_PASSWORD(constant.CODE.INPUT_VALIDATION).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(requestValidation, res, constant.CODE.INPUT_VALIDATION,{},0);
         }
         const isVerifyOtp = await knex("userOtp").where({ id: otpId, isVerify: true })
            .first();
         if (!isVerifyOtp) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: "Invalid OTP",
               operation: CHANGE_PASSWORD().OPERATION,
               context: CHANGE_PASSWORD(constant.CODE.BAD_REQUEST).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_VERIFIED.replace("{{key}}","otp"),
               res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         const userDetail = await knex("users").where({ id })
            .first();
         const { password } = userDetail;
         if (decryptData(password) === confirmPassword) {
            return sendResponse(constant.MESSAGE.PASSWORD_NOT_MATCH,
               res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         const result = await knex("users").where({ id,mobileNumber: mobile })
            .update({ password: encryptdata(confirmPassword) });
         if (!result) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: "Input error",
               operation: CHANGE_PASSWORD().OPERATION,
               context: CHANGE_PASSWORD(constant.CODE.BAD_REQUEST).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse('fail to update password', res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         logger.info("Password Changed",{
            ...commonLogger(),
            userId: id,
            operation: CHANGE_PASSWORD().OPERATION,
            context: CHANGE_PASSWORD(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.PASSWORD_UPDATE, res, constant.CODE.SUCCESS, {}, 1);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: CHANGE_PASSWORD().OPERATION,
            context: (constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(error.message, res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
      }
   },
};
