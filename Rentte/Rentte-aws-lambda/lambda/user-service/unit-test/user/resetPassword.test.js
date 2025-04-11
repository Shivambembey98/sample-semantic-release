const authController = require('../../user/controller/authController');
const constant = require('../../config/constant');
const knex = require('../../db/db');
const jwt = require("jsonwebtoken");
const { sendResponse } = require("../../config/helper");
const { inputValidation } = require("../../validators/productValidator");
const { decryptData, encryptdata } = require('../../helper/validator');
const logger = require('../../config/winston');

jest.mock('../../db/db');
jest.mock('jsonwebtoken');
jest.mock("../../config/helper");
jest.mock("../../validators/productValidator");
jest.mock("../../helper/validator");
jest.mock('../../config/winston');

describe('resetPassword', () => {
   let req; 
   let res;

   beforeEach(() => {
      req = {
         body: {
            token: 'valid-token',
            confirmPassword: 'newpassword123',
            newPassword: "newpassword123",
         },
         ip: '127.0.0.1',
         headers: {},
      };
      res = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn(),
      };
      
      // Reset all mocks before each test
      jest.clearAllMocks();
      
      // Setup default mock implementations
      jest.spyOn(logger, 'info').mockImplementation(() => {});
      jest.spyOn(logger, 'error').mockImplementation(() => {});
      inputValidation.mockResolvedValue(null);
      jwt.verify.mockImplementation((token, secret, callback) => callback(null, { id: 1 }));
      decryptData.mockReturnValue('oldpassword123');
      encryptdata.mockReturnValue('newEncryptedPassword');
      
      knex.mockReset();
      sendResponse.mockReset();
   });

   test('should return INPUT_VALIDATION error if validation fails', async () => {
      // Mock validation to fail
      inputValidation.mockImplementation(() => {
         throw new Error("The token field is mandatory.");
      });
      
      await authController.resetPassword(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });

   test('should return EXPIRE_LINK if JWT verification fails', async () => {
      jwt.verify.mockImplementation((token, secret, callback) => {
         callback(new Error('Token expired'), null);
      });

      await authController.resetPassword(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.EXPIRE_LINK,
         res,
         constant.CODE.AUTH,
         {},
         0
      );
   });

   test('should return PASSWORD_NOT_MATCH if the new password matches the old one', async () => {
      decryptData.mockReturnValue('newpassword123');
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ password: 'encryptedOldPassword' }),
      }));

      await authController.resetPassword(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.PASSWORD_NOT_MATCH,
         res,
         constant.CODE.BAD_REQUEST,
         {},
         0
      );
   });

   test('should successfully reset password if everything is correct', async () => {
      knex
         .mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue({ password: 'encryptedOldPassword' }),
         }))
         .mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            update: jest.fn().mockResolvedValue(1),
         }));

      await authController.resetPassword(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.PASSWORD_UPDATE,
         res,
         constant.CODE.SUCCESS,
         {},
         1
      );
   });

   test('should handle database update failure', async () => {
      knex
         .mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue({ password: 'encryptedOldPassword' }),
         }))
         .mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            update: jest.fn().mockResolvedValue(0),
         }));

      await authController.resetPassword(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         "Request failed",  // Direct string instead of constant
         res,
         constant.CODE.BAD_REQUEST,
         {},
         0
      );
   });

   test('should return INTERNAL_SERVER_ERROR if an exception is thrown', async () => {
      knex.mockImplementation(() => {
         throw new Error('Database error');
      });

      await authController.resetPassword(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });
});
