const verifyOtpController = require('../../admin/controller/authController'); // Adjust path
const constant = require('../../config/constant');
const knex = require('../../db/db');
const logger = require("../../config/winston");
const jwt = require("jsonwebtoken");
const { adminInputValidation } = require("../../validators/adminValidator");

jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock("../../validators/adminValidator");
jest.mock("jsonwebtoken");

describe("verifyOtp", () => {
   let req; let res;

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
      adminInputValidation.mockReset();
      jwt.sign.mockReset();
      jest.spyOn(logger, 'info').mockImplementation(() => {});
      jest.spyOn(logger, 'error').mockImplementation(() => {});
   });

   test('should successfully verify OTP and return user details with token', async () => {
      adminInputValidation.mockResolvedValue(null);
    
      // Mock the database calls and JWT signing
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
 
      // Call the verifyOtp controller
      await verifyOtpController.verifyOtp(req, res);
 
      // Assertions for the response
      expect(res.status).toHaveBeenCalledWith(constant.CODE.SUCCESS);
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            message: "otp verified successfully",  // Message from actual response
            result: expect.objectContaining({
               otpDetail: expect.objectContaining({ id: 1, isVerify: true, otpType: 'login' }),  // otpDetail
            }),
         }),
      );
   }); 

   test('should return INPUT_VALIDATION if validation fails', async () => {
      // Mock input validation to simulate a validation failure
      adminInputValidation.mockResolvedValue('Validation error');  // Simulate the validation error
 
      // Call the verifyOtp controller
      await verifyOtpController.verifyOtp(req, res);
 
      // Assertions for the response
      expect(res.status).toHaveBeenCalledWith(constant.CODE.INPUT_VALIDATION);  // Expect appropriate validation failure code
      expect(res.json).toHaveBeenCalledWith({
         code: 0,                        // Match the controller's response
         message: 'Validation error',    // The validation error message
         result: {},                     // Empty result (as returned by controller)
      });
   }); 
 

   test('should return BAD_REQUEST if OTP is invalid', async () => {
      adminInputValidation.mockResolvedValue(null);
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null),
      }));

      await verifyOtpController.verifyOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(constant.CODE.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            message: constant.MESSAGE.INVALID_OTP,
         }),
      );
   });

   test('should create a new user if user does not exist', async () => {
      adminInputValidation.mockResolvedValue(null);
 
      // Mocking the behavior of knex to simulate user OTP verification
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 1, isVerify: false, otpType: 'login' }),
      }));
 
      // Mock the behavior of OTP update
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockReturnThis(),
         returning: jest.fn().mockResolvedValue([{ id: 1, isVerify: true, otpType: 'login' }]),
      }));
 
      // Mock user existence check to simulate user not found
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null), // No user found
      }));
 
      // Mock inserting a new user
      knex.mockImplementationOnce(() => ({
         insert: jest.fn().mockReturnThis(),
         returning: jest.fn().mockResolvedValue([{ id: 2, mobileNumber: "1234567890" }]),
      }));
 
      // Mock JWT token generation
      jwt.sign.mockReturnValue("mocked_token");
 
      // Call the verifyOtp function
      await verifyOtpController.verifyOtp(req, res);
 
      // Assertions for the response
      expect(res.status).toHaveBeenCalledWith(constant.CODE.SUCCESS);
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            message: "otp verified successfully",  // This matches the response from the controller
            result: expect.objectContaining({
               otpDetail: expect.objectContaining({ id: 1, isVerify: true, otpType: 'login' }),  // Matches the updated OTP details
            }),
         }),
      );
   }); 

   test('should handle exceptions and return INTERNAL_SERVER_ERROR', async () => {
      adminInputValidation.mockResolvedValue(null);
      knex.mockImplementation(() => {
         throw new Error('Database error');
      });

      await verifyOtpController.verifyOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(constant.CODE.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            message: 'Database error',
         }),
      );
   });
});
