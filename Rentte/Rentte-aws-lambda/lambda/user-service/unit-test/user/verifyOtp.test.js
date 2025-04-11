const { sendResponse } = require("../../config/helper");
const verifyOtpController = require('../../user/controller/authController'); // Adjust path
const constant = require('../../config/constant');
const knex = require('../../db/db');
const logger = require("../../config/winston");
const jwt = require("jsonwebtoken");
const { inputValidation } = require("../../validators/productValidator");
jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock("../../validators/productValidator");
jest.mock("jsonwebtoken");
jest.mock("../../config/helper"); // Mock sendResponse if it's in a separate file

describe("verifyOtp", () => {
   let req, res;

   beforeEach(() => {
      req = {
         ip: '127.0.0.1',
         body: { mobile: "1234567890", otp: "1234", countryCode: "+91", type: "" },
         headers: {},
      };
      res = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn(),
      };
      knex.mockReset();
      inputValidation.mockReset();
      jwt.sign.mockReset();
      jest.spyOn(logger, 'info').mockImplementation(() => {});
      jest.spyOn(logger, 'error').mockImplementation(() => {});
   });

   test('should successfully verify OTP and return user details with token', async () => {
      inputValidation.mockResolvedValue(null);
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 1, isVerify: false, otpType: 'login' }),
      }));
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockReturnThis(),
         returning: jest.fn().mockResolvedValue([{ id: 1, isVerify: true, otpType: 'login' }]),
      }));
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 1, mobileNumber: "1234567890" }),
      }));
      jwt.sign.mockReturnValue("mocked_token");

      await verifyOtpController.verifyOtp(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {
            token: "Bearer mocked_token",
            user: { id: 1, mobileNumber: "1234567890" },
            otpDetail: { id: 1, isVerify: true, otpType: 'login' },
         },
         1
      );
   });

   test('should return BAD_REQUEST if OTP is invalid', async () => {
      inputValidation.mockResolvedValue(null);
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null),
      }));

      await verifyOtpController.verifyOtp(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INVALID_OTP,
         res,
         constant.CODE.BAD_REQUEST,
         {},
         0
      );
   });

   test('should create a new user if user does not exist', async () => {
      inputValidation.mockResolvedValue(null);
  
      // Mock userOtp table to return a valid OTP
      knex.mockImplementationOnce(() => ({
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue({ id: 1, isVerify: false, otpType: 'login' }),
      }));
  
      // Mock updating the OTP status
      knex.mockImplementationOnce(() => ({
          where: jest.fn().mockReturnThis(),
          update: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValue([{ id: 1, isVerify: true, otpType: 'login' }]),
      }));
  
      // Mock users table to simulate no existing user
      knex.mockImplementationOnce(() => ({
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(null),
      }));
  
      // Mock inserting a new user
      knex.mockImplementationOnce(() => ({
          insert: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValue([{ id: 2, mobileNumber: "1234567890" }]),
      }));
  
      jwt.sign.mockReturnValue("mocked_token");
  
      await verifyOtpController.verifyOtp(req, res);
  
      expect(sendResponse).toHaveBeenCalledWith(
          constant.MESSAGE.SUCCESS,
          res,
          constant.CODE.SUCCESS,
          {
              token: "Bearer mocked_token",
              user: { id: 2, mobileNumber: "1234567890" },
              otpDetail: { id: 1, isVerify: true, otpType: 'login' }, // Include otpDetail
          },
          1
      );
  });
  

   test('should handle exceptions and return INTERNAL_SERVER_ERROR', async () => {
      inputValidation.mockResolvedValue(null);
      knex.mockImplementation(() => {
         throw new Error('Database error');
      });

      await verifyOtpController.verifyOtp(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });
});

