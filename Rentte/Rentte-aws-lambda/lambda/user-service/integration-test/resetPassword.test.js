const authController = require('../user/controller/authController');
const constant = require('../config/constant');
const knex = require('../db/db');
const jwt = require("jsonwebtoken");
const { sendResponse } = require("../config/helper");
const { decryptData, encryptdata } = require('../helper/validator');
const logger = require('../config/winston');

jest.mock('../db/db');
jest.mock('jsonwebtoken');
jest.mock("../config/helper");
jest.mock("../validators/productValidator");
jest.mock("../helper/validator");
jest.mock('../config/winston');

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
      jest.spyOn(logger, 'info').mockImplementation(() => {});
      jest.spyOn(logger, 'error').mockImplementation(() => {});
  
      knex.mockReset();
      sendResponse.mockReset();
   });

   test('should return INPUT_VALIDATION error if validation fails', async () => {
      req.body = {};  // Missing both token and confirmPassword
      await authController.resetPassword(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         "The token field is mandatory.",
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0
      );
   });

   test('should return PASSWORD_NOT_MATCH if the new password matches the old one', async () => {
      decryptData.mockImplementationOnce(() => 'newpassword123');
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ password: 'newpassword123' }),
      }));

      jwt.verify = jest.fn().mockReturnValue({ id: 1 });

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
      // Mock user details and token verification
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ password: 'encryptedPassword' }),
      }));
   
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockResolvedValue(1),
      }));
   
      jwt.verify.mockImplementation(() => ({ id: 1 }));
      decryptData.mockReturnValue('oldpassword123');
      encryptdata.mockReturnValue('newEncryptedPassword');
      await authController.resetPassword(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.PASSWORD_UPDATE,
         res,
         constant.CODE.SUCCESS,
         {},
         1
      );
   });
   

   test('should handle database update failure and return BAD_REQUEST', async () => {
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ password: 'oldpassword123' }),
         update: jest.fn().mockResolvedValue(0),
      }));

      await authController.resetPassword(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });

   test('should return INTERNAL_SERVER_ERROR if an exception is thrown', async () => {
      knex.mockImplementation(() => ({
         where: jest.fn().mockImplementation(() => {
            throw new Error('Internal Server Error');
         }),
      }));

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

