
const constant = require("../../config/constant");
const { sendResponse, commonLogger,loginSuccess, 
   contactUsEmail } = require("../../config/helper");
// const memcached = require("../../config/memcached")
const logger = require("../../config/winston");
const knex = require("../../db/db");
const { inputValidation } = require("../../validators/userValidator");
// const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const { LOGGER_MESSAGES } = require("../../helper/loggerMessage");
const { REGISTER,VERIFY_EMAIL_OTP,UPDATE_PROFILE,SEND_OTP,VERIFY_OTP,LIST_USER,DETAIL_USER,
   LOGIN,UPDATE_KYC,LEGAL_POLICY_ACCEPTANCE,RESET_PASSWORD,
   CHANGE_PASSWORD, FORGOT_PASSWORD } = LOGGER_MESSAGES;
const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-south-1' });
const { encryptdata, decryptData } = require("../../helper/validator");
const { formatDate } = require("../../helper/common");
const { sendMail, verifyEmail } = require("../../helper/mail");
// const { SNS } = require("../../config/snsConfig")
const cognito = new AWS.CognitoIdentityServiceProvider();
const SNS = new AWS.SNS();
module.exports = {
   register: async (req,res) => {
      try {
         logger.info("Request coming for register user",{
            ...commonLogger(),
            operation: REGISTER().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const requestValidation = await inputValidation(req.body,"userInformation");
         if (requestValidation) {
            return sendResponse(requestValidation,res,constant.CODE.INPUT_VALIDATION,{},0);
         }
         const { password, email, mobileNumber, firstName, lastName,
            gender, profession, dob,countryCode } = req.body;
         const phone_number = countryCode + mobileNumber;

         const encryptedPassword = encryptdata(password);
         const dateOfBirth = formatDate(dob);
         const userData = {
            ...req.body, // Copy the existing body
            password: encryptedPassword, // Set encrypted password
            dob: dateOfBirth, // Format date of birth
         };
         const params = {
            ClientId: process.env.COGNITO_CLIENT_ID,
            Username: email,
            Password: password,
            UserAttributes: [
               { Name: 'phone_number', Value: phone_number },
               { Name: 'email', Value: email },
               { Name: 'custom:firstName', Value: firstName },
               { Name: 'custom:lastName', Value: lastName }, 
               { Name: 'custom:gender', Value: gender },
               { Name: 'custom:profession', Value: profession }, 
               { Name: 'custom:dob', Value: dateOfBirth },
            ],
         };
         const findUserByMobile = await knex('users').where({ mobileNumber })
            .first();
         if (findUserByMobile) {
            return sendResponse(constant.MESSAGE.ALREADY_EXIST.replace("{{key}}",'mobile number'), 
               res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         const findUserByEmail = await knex('users').where({ email })
            .first();
         if (findUserByEmail) {
            return sendResponse(constant.MESSAGE.ALREADY_EXIST.replace("{{key}}", 'email'),
               res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         
         const signUpResponse = await cognito.signUp(params).promise();
         const { UserSub } = signUpResponse;
         userData.cognitoid = UserSub;
         const [id] = await knex("users").insert(userData)
            .returning("id");
         const token = jwt.sign(id,
            process.env.JWT_SECRET_KEY,
            {
               algorithm: "HS256",
               expiresIn: "300s",
            });
         await verifyEmail(res, {
            email,
            token,
            subject: "Verify your email address",
         });
         logger.info("User successfully registered",{
            ...commonLogger(),
            userId: id,
            operation: REGISTER().OPERATION,
            context: REGISTER(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         // await registerSuccess(email,userType);

         return sendResponse(constant.MESSAGE.EMAIL_VERIFY_MESSAGE, res, constant.CODE.SUCCESS, {}, 1);    
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: REGISTER().OPERATION,
            context: REGISTER(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   login: async (req,res) => {
      try {
         const { email, password } = req.body;
         if (!email) {
            return sendResponse(constant.MESSAGE.REQUIRED_FIELDS.replace("{{key}}",'email'), res,
               constant.CODE.INPUT_VALIDATION, {}, 0);
         }
         if (!password) {
            return sendResponse(constant.MESSAGE.REQUIRED_FIELDS.replace("{{key}}",'password'), res,
               constant.CODE.INPUT_VALIDATION, {}, 0);
         }
         logger.info("User login",{
            ...commonLogger(),
            operation: LOGIN().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         }); 
         const isExistUser = await knex("users").where({ email })
            .first();
         if (!isExistUser) {
            logger.error("Exception error",{
               ...commonLogger(),
               operation: LOGIN().OPERATION,
               error: "user not exist",
               context: LOGIN(constant.CODE.NOT_EXIST).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.EMAIL_NOT_REGISTERED, res,
               constant.CODE.NOT_FOUND, {}, 0);
         }
         const checkEmailVerify = await knex("users").where({ email, isEmailVerify: false })
            .first()
         if (checkEmailVerify) {
            return sendResponse(constant.MESSAGE.EMAIL_NOT_VERIFIED, res,
               constant.CODE.BAD_REQUEST, {}, 0);
         }
         if (password !== decryptData(isExistUser.password)) {
            return sendResponse(constant.MESSAGE.INCORRECT_PASS, res,
               constant.CODE.AUTH, {}, 0);
         }
         const tokenPayload = {
            id: isExistUser.id,
            email: isExistUser.email,
            firstName: isExistUser.firstName,
            lastName: isExistUser.lastName,
         };
         const token = jwt.sign(tokenPayload, process.env.JWT_SECRET_KEY, {
            expiresIn: process.env.JWT_EXPIRES_IN,

         });
         logger.info("Logged In successfully",{
            ...commonLogger(),
            user: {
               detail: tokenPayload,
               token,
            },
            operation: LOGIN().OPERATION,
            context: LOGIN(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         await loginSuccess(email);
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {
            token: `Bearer ${  token}`,
            user: tokenPayload,
         }, 1);
    
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: LOGIN().OPERATION,
            context: LOGIN(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   updateProfile: async (req,res) => {
      try {
         logger.info("update profile",{
            ...commonLogger(),
            operation: UPDATE_PROFILE().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { id } = req.user;
         if (isNaN(req.body.mobileNumber)) {return sendResponse(constant.MESSAGE.MOBILE_INVALID,
            res,constant.CODE.BAD_REQUEST,{},0)}
         const updatedProfileData = { ...req.body };
         if (req.file && req.file.key) {
            updatedProfileData.profileimage = req.file.key;
         }
         const getUser = await knex("users").where({ id })
            .first()
         const { mobileUpdateCount,mobileNumber } = getUser
         if (mobileUpdateCount === 2 && mobileNumber !== req.body.mobileNumber) {
            return sendResponse(constant.MESSAGE.MOBILE_UPDATE_TWICE,
               res,constant.CODE.BAD_REQUEST,{},0)
         }
         const updateUser = await knex("users").where({ id })
            .update(updatedProfileData);
         if (updateUser === 1) {
            if (mobileNumber !== req.body.mobileNumber) {
               await knex('users').where({ id })
                  .increment('mobileUpdateCount',1);
            }
            logger.info("profile update successfully",{
               ...commonLogger(),
               userId: id,
               operation: REGISTER().OPERATION,
               context: UPDATE_PROFILE(constant.CODE.SUCCESS).CONTEXT,
               client: {
                  ip: req.ip,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.UPDATE_PROFILE,res,constant.CODE.SUCCESS,{},1);
         }
         logger.error("Exception error",{
            ...commonLogger(),
            operation: UPDATE_PROFILE().OPERATION,
            error: "Fail to update profile",
            context: UPDATE_PROFILE(constant.CODE.BAD_REQUEST).CONTEXT,
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
            operation: UPDATE_PROFILE().OPERATION,
            context: UPDATE_PROFILE(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.INTERNAL_ERROR,
            res,constant.CODE.INTERNAL_SERVER_ERROR,{},0);
      }
   },
   sendOtp: async (req,res) => {
      try {
         logger.info("send otp",{
            ...commonLogger(),
            operation: SEND_OTP().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const requestValidation = await inputValidation(req.body, "sendOtp");
         if (requestValidation) {
            logger.error("Exception error",{
               ...commonLogger(),
               operation: SEND_OTP().OPERATION,
               error: "Input Validation",
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
         await knex("userOtp").insert(sendOtp);
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
            logger.info("OTP sent successfully",{
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
            operation: UPDATE_PROFILE().OPERATION,
            error: "Fail to send OTP",
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
            context: SEND_OTP(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         })
         return sendResponse(constant.MESSAGE.INTERNAL_ERROR,
            res,constant.CODE.INTERNAL_SERVER_ERROR,{},0);
      }
   },
   verifyOtp: async (req,res) => {
      try {
         logger.info("Verify OTP",{
            ...commonLogger(),
            operation: VERIFY_OTP().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { mobile,otp,countryCode } = req.body;
         const requestValidation = await inputValidation(req.body, "verifyOtp");
         if (requestValidation) {return sendResponse(requestValidation, 
            res, constant.CODE.INPUT_VALIDATION,{},0);}
         const isVerifyOtp = await knex("userOtp").where({ mobile,otp,isVerify: false })
            .first();
         if (!isVerifyOtp) {
            logger.error("Exception error",{
               ...commonLogger(),
               operation: VERIFY_OTP().OPERATION,
               error: "Invalid OTP",
               context: VERIFY_OTP(constant.CODE.BAD_REQUEST).CONTEXT,
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
         if (req.body.type === 'changePassword') {
            return sendResponse(constant.MESSAGE.VERIFIED.replace("{{key}}",'otp'),
               res,constant.CODE.SUCCESS,{ otpDetail: { id,isVerify,otpType } },1);
         }
         let user = await knex("users").where({ mobileNumber: mobile })
            .first();
         if (!user) {
            const userObj = {
               countryCode,
               mobileNumber: mobile,
            };
            const saveUser = await knex("users").insert(userObj)
               .returning("*");
            // eslint-disable-next-line prefer-destructuring
            user = saveUser[0];
         }
         const token = jwt.sign(user,process.env.JWT_SECRET_KEY,{
            expiresIn: process.env.JWT_EXPIRES_IN,
         });
         logger.info("OTP Verified",{
            ...commonLogger(),
            user: {
               detail: user,
               token,
            },
            operation: VERIFY_OTP().OPERATION,
            context: VERIFY_OTP(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.SUCCESS,res,constant.CODE.SUCCESS,
            { token: `Bearer ${  token}`,user,otpDetail: { id,isVerify,otpType } },1);
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
         return sendResponse(constant.MESSAGE.INTERNAL_ERROR,res,
            constant.CODE.INTERNAL_SERVER_ERROR,{},0);
      }
   },
   verifyEmailOtp: async (req,res) => {
      try {
         logger.info("send OTP",{
            ...commonLogger(),
            operation: VERIFY_EMAIL_OTP().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { email, confirmationCode } = req.body;
         const params = {
            ClientId: process.env.COGNITO_CLIENT_ID, 
            Username: email,
            ConfirmationCode: confirmationCode,
         };
         await cognito.confirmSignUp(params).promise();
         logger.info("Email OTP Verified",{
            ...commonLogger(),
            operation: VERIFY_EMAIL_OTP().OPERATION,
            context: VERIFY_EMAIL_OTP(constant.CODE.SUCCESS).CONTEXT,
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
            operation: VERIFY_EMAIL_OTP().OPERATION,
            context: VERIFY_EMAIL_OTP(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   listUser: async (req, res) => {
      try {
         const { search } = req.query || null;
         const page = parseInt(req.query.page, 10) || 1;
         const limit = 10;
         const offset = (page - 1) * limit;
    
         // Start building the query
         const userQuery = knex('users')
            .select(
               'id',
               'firstName',
               'lastName',
               'email',
               'mobileNumber',
               'countryCode',
               'gender',
               'profession',
               'dob',
               'status',
               'userType',
               'created_at',
               'updated_at',
            )
            .where('userType', 'user')
            .orderBy('created_at','desc');
         // Apply search filter if search is provided
         if (search) {
            userQuery.andWhere(function () {
               this.whereRaw('CAST("mobileNumber" AS TEXT) LIKE ?', [`%${search}%`])
                  .orWhereRaw('CAST("email" AS TEXT) LIKE ?', [`%${search}%`])
                  .orWhereRaw('CAST("firstName" AS TEXT) LIKE ?', [`%${search}%`])
                  .orWhereRaw('CAST("lastName" AS TEXT) LIKE ?', [`%${search}%`]);
            });
         }
    
         // Apply pagination and ordering
         const userList = await userQuery
            .limit(limit)
            .orderBy('created_at', 'desc')
            .offset(offset);
    
         const totalCountResult = await knex('users')
            .where({ userType: 'user' })
            .count('users.id as count');
         const totalCount = totalCountResult[0].count;
         const totalPages = Math.ceil(totalCount / limit);
         logger.info("User listed",{
            ...commonLogger(),
            operation: LIST_USER().OPERATION,
            context: LIST_USER(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.SUCCESS, res, constant.CODE.SUCCESS, {
            userList,
            pagination: { page, limit, totalCount, totalPages },
         }, 1);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: LIST_USER().OPERATION,
            context: LIST_USER(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   detailUser: async (req,res) => {
      try {
         const user = await knex('users').where({ id: req.user.id })
            .first();
         if (!user) {
            logger.error("exception error",{
               ...commonLogger(),
               operation: DETAIL_USER().OPERATION,
               error: "user not exist",
               context: DETAIL_USER(constant.CODE.NOT_FOUND).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace("{{key}}","user"),
               res,constant.CODE.NOT_FOUND,{},0);
         }
         logger.info("User details",{
            ...commonLogger(),
            user: {
               detail: user,
            },
            operation: DETAIL_USER().OPERATION,
            context: DETAIL_USER(constant.CODE.SUCCESS).CONTEXT,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.SUCCESS,res,constant.CODE.SUCCESS,{ user },1);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: DETAIL_USER().OPERATION,
            context: DETAIL_USER(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.INTERNAL_ERROR,
            res,constant.CODE.INTERNAL_SERVER_ERROR,{},0);
      }
   },
   verifyEmail: async (req,res) => {
      try {
         const { token,to } = req.query
         const tokenValidation = jwt.verify(
            token,
            process.env.JWT_SECRET_KEY,
            (error, valid) => {
               if (error) {
                  return sendResponse(constant.MESSAGE.EXPIRE_LINK, res,
                     constant.CODE.AUTH, {}, 0);
               } else {
                  return valid;
               }
            },
         );
         const { id } = tokenValidation;
         const verifyUserEmail = await knex('users').where({ id })
            .update({ isEmailVerify: true })
         
         if (verifyUserEmail === 1) {
            if (to) {
               return res.redirect(to); // Redirect to the URL
            }
         }
         return sendResponse('Fail to verify email',res,constant.CODE.BAD_REQUEST,{},0);

      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: REGISTER().OPERATION,
            context: REGISTER(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   forgotPassword: async (req, res) => {
      try {
           
         // validation
         const requestValidation = await inputValidation(req.body, "forgotPassword");
         if (requestValidation) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: requestValidation,
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
         const userData = await knex("users").where({ email })
            .first();
         if (!userData) {
            logger.error("Exception error",{
               ...commonLogger(),
               error: constant.MESSAGE.EMAIL_NOT_REGISTERED,
               context: FORGOT_PASSWORD(constant.CODE.NOT_FOUND).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.EMAIL_NOT_REGISTERED,
               res, constant.CODE.SUCCESS, {}, constant.CODE.NOT_EXIST);
         }
         const { firstName,lastName } = userData;
         const token = jwt.sign({ email: userData.email, id: userData.id },
            process.env.JWT_SECRET_KEY,
            {
               algorithm: "HS256",
               expiresIn: "300s",
            });
            
         await sendMail(res, {
            name: `${firstName  } ${  lastName}`,
            email,
            subject: "Password Reset Link",
            link: `${process.env.USER_RESET_PASSWORD_URL}/${token}`,

         });
         return sendResponse(constant.MESSAGE.EMAIL_SEND, res, constant.CODE.SUCCESS, {}, 1);
      } catch (error) {
         logger.error("Exception error",{
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: FORGOT_PASSWORD(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   resetPassword: async (req, res) => {
      try {
         const requestValidation = await inputValidation(req.body, "resetPassword");
         if (requestValidation)    
         {
            return sendResponse(requestValidation, res, constant.CODE.INPUT_VALIDATION, {}, 0);
         }
         const { token, confirmPassword } = req.body;
         const tokenValidation = jwt.verify(
            token,
            process.env.JWT_SECRET_KEY,
            (error, valid) => {
               if (error) {
                  logger.error("exception error",{
                     ...commonLogger(),
                     operation: RESET_PASSWORD().OPERATION,
                     error: error.message,
                     context: RESET_PASSWORD(constant.CODE.AUTH).CONTEXT,
                     client: {
                        ip: req.ip,
                        headers: req.headers,
                        requestBody: req.body,
                     },
                  });
                  return sendResponse(constant.MESSAGE.EXPIRE_LINK, res,
                     constant.CODE.AUTH, {}, 0);
               } else {
                  return valid;
               }
            },
         );
         const userDetail = await knex("users").where({ id: tokenValidation.id })
            .first();
         const { password } = userDetail;
         if (tokenValidation) {
            if (decryptData(password) === confirmPassword) {
               logger.error("exception error",{
                  ...commonLogger(),
                  operation: RESET_PASSWORD().OPERATION,
                  error: "password should not be same as previous password",
                  context: RESET_PASSWORD(constant.CODE.BAD_REQUEST).CONTEXT,
                  client: {
                     ip: req.ip,
                     headers: req.headers,
                     requestBody: req.body,
                  },
               });
               return sendResponse(constant.MESSAGE.PASSWORD_NOT_MATCH, res, 
                  constant.CODE.BAD_REQUEST, {}, 0);
            }
            const updateResponse = await knex("users").where({ id: tokenValidation.id })
               .update({ password: encryptdata(confirmPassword) });
            if (updateResponse === 0) {
               logger.error("exception error",{
                  ...commonLogger(),
                  operation: RESET_PASSWORD().OPERATION,
                  error: "Fail to update password",
                  context: RESET_PASSWORD(constant.CODE.BAD_REQUEST).CONTEXT,
                  client: {
                     ip: req.ip,
                     headers: req.headers,
                     requestBody: req.body,
                  },
               });
               return sendResponse(constant.MESSAGE.BAD_REQUEST,
                  res,constant.CODE.BAD_REQUEST,{},0)
            }
            return sendResponse(constant.MESSAGE.PASSWORD_UPDATE, res, 
               constant.CODE.SUCCESS, {}, 1);
         }
         return sendResponse(constant.MESSAGE.BAD_REQUEST,res,constant.CODE.BAD_REQUEST,{},0)
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            context: RESET_PASSWORD(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
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
   updateKyc: async (req,res) => {
      try {
         logger.info("Update Kyc",{
            ...commonLogger(),
            operation: UPDATE_KYC().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { id } = req.user;
         const updatedKycData = { ...req.body };
         if (req.files && req.files.aadhaarImage && req.files.aadhaarImage[0].key) {
            updatedKycData.aadhaarImage = req.files.aadhaarImage[0].key;
         }
         if (req.files && req.files.panCardImage && req.files.panCardImage[0].key) {
            updatedKycData.panCardImage = req.files.panCardImage[0].key;
         }
         const updateUser = await knex("users").where({ id })
            .update(updatedKycData);
         if (updateUser === 1) {
            logger.info("update KYC successfully",{
               ...commonLogger(),
               userId: id,
               operation: UPDATE_KYC().OPERATION,
               context: UPDATE_KYC(constant.CODE.SUCCESS).CONTEXT,
               client: {
                  ip: req.ip,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.SUCCESS,res,constant.CODE.SUCCESS,{},1);
         }
         logger.error("Exception error",{
            ...commonLogger(),
            operation: UPDATE_KYC().OPERATION,
            error: "Fail to update KYC",
            context: UPDATE_KYC(constant.CODE.BAD_REQUEST).CONTEXT,
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
            operation: UPDATE_KYC().OPERATION,
            context: UPDATE_KYC(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.INTERNAL_ERROR,res,
            constant.CODE.INTERNAL_SERVER_ERROR,{},0);
      }
   },
   legalPolicyAcceptance: async (req,res) => {
      try {
         logger.info("legal policy",{
            ...commonLogger(),
            operation: LEGAL_POLICY_ACCEPTANCE().OPERATION,
            client: {
               ip: req.ip,
               requestBody: req.body,
            },
         });
         const { id } = req.user;
         const { legalPolicyAcceptance } = req.body;
         if (!legalPolicyAcceptance) {
            logger.error("Exception error", {
               ...commonLogger(),
               error: 'failed to get legal policy status from payload',
               operation: LEGAL_POLICY_ACCEPTANCE().OPERATION,
               context: LEGAL_POLICY_ACCEPTANCE(constant.CODE.NOT_FOUND).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.NOT_FOUND.replace('{{key}}', 
               'status of legal policy acceptance'),
            res,constant.CODE.NOT_FOUND,{},0);
         }
         const checkFindPolicyAcceptance = await knex('users').where({ id, legalPolicyAcceptance })
            .first();
         if (checkFindPolicyAcceptance) {
            return sendResponse(constant.MESSAGE.LEGAL_POLICY_ACCEPTANCE,
               res,constant.CODE.ALREADY_EXIST,{},0);
         }
         const updateStatusLegalPolicy = await knex('users').where({ id })
            .update({ legalPolicyAcceptance });
         if (updateStatusLegalPolicy === 1) {
            return sendResponse(constant.MESSAGE.SUCCESS,res,constant.CODE.SUCCESS,{},1);
         }
         logger.error("Exception error", {
            ...commonLogger(),
            error: 'Failed to update leagal policy acceptance',
            operation: LEGAL_POLICY_ACCEPTANCE().OPERATION,
            context: LEGAL_POLICY_ACCEPTANCE(constant.CODE.NOT_FOUND).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.BAD_REQUEST,res,constant.CODE.BAD_REQUEST,{},0);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: LEGAL_POLICY_ACCEPTANCE().OPERATION,
            context: LEGAL_POLICY_ACCEPTANCE(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.INTERNAL_ERROR,
            res,constant.CODE.INTERNAL_SERVER_ERROR,{},0);
            
      }
   },
   changePassword: async (req,res) => {
      try {
         const { otpId,confirmPassword,mobile } = req.body;
         const { id } = req.user;
         const requestValidation = await inputValidation(req.body, "changePasswordValidation");
         if (requestValidation) {
            return sendResponse(requestValidation, res, constant.CODE.INPUT_VALIDATION,{},0);
         }
         const userDetail = await knex("users").where({ id })
            .first();
         const { password } = userDetail;
         if (decryptData(password) === confirmPassword) {
            logger.error("exception error",{
               ...commonLogger(),
               operation: CHANGE_PASSWORD().OPERATION,
               error: "password should not be same as previous password",
               context: CHANGE_PASSWORD(constant.CODE.BAD_REQUEST).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse(constant.MESSAGE.PASSWORD_NOT_MATCH,
               res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         const isVerifyOtp = await knex("userOtp").where({ id: otpId, isVerify: true })
            .first();
         if (!isVerifyOtp) {
            logger.error("exception error",{
               ...commonLogger(),
               operation: CHANGE_PASSWORD().OPERATION,
               error: "otp not verified",
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
         const result = await knex("users").where({ id,mobileNumber: mobile })
            .update({ password: encryptdata(confirmPassword) });
         if (!result) {
            logger.error("exception error",{
               ...commonLogger(),
               operation: CHANGE_PASSWORD().OPERATION,
               error: "fail to update password",
               context: CHANGE_PASSWORD(constant.CODE.BAD_REQUEST).CONTEXT,
               client: {
                  ip: req.ip,
                  headers: req.headers,
                  requestBody: req.body,
               },
            });
            return sendResponse('fail to update password', res, constant.CODE.BAD_REQUEST, {}, 0);
         }
         return sendResponse(constant.MESSAGE.PASSWORD_UPDATE, res, constant.CODE.SUCCESS, {}, 1);
      } catch (error) {
         logger.error("Exception error", {
            ...commonLogger(),
            error: error.message,
            stack: error.stack,
            operation: CHANGE_PASSWORD().OPERATION,
            context: CHANGE_PASSWORD(constant.CODE.INTERNAL_SERVER_ERROR).CONTEXT,
            client: {
               ip: req.ip,
               headers: req.headers,
               requestBody: req.body,
            },
         });
         return sendResponse(constant.MESSAGE.INTERNAL_ERROR,
            res, constant.CODE.INTERNAL_SERVER_ERROR, { error }, 0);
      }
   },
   testingUnitTest: async (req,res) => {
      const { username, password } = req.body;
      // Implement your login logic here
      if (username === 'user' && password === 'pass') {
         res.status(200).json({ message: 'Login successful' });
      } else {
         res.status(401).json({ message: 'Login failed' });
      }
   },
   contactUs: async (req, res) => {
      try {
         const { email, message } = req.body;
         const requestValidation = await inputValidation(req.body, "contactUs");
         if (requestValidation) {
            return sendResponse(
               requestValidation,
               res,
               constant.CODE.INPUT_VALIDATION,
               {},
               0,
            );
         }
         // const contactUsData = {
         //    email,
         //    message,
         // };
         // await knex("contactUs").insert(contactUsData);
         await contactUsEmail(email, message);
         return sendResponse(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            {},
            1,
         );
      } catch (error) {
         return sendResponse(
            error.message,
            res,
            constant.CODE.INTERNAL_SERVER_ERROR,
            {},
            0,
         );
      }
   },
   
};
