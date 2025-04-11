const loginController = require('../../admin/controller/authController');
const knex = require('../../db/db');
const constant = require('../../config/constant');
const logger = require('../../config/winston');
const { sendResponse } = require('../../config/helper');
const jwt = require('jsonwebtoken');
const { decryptData } = require('../../helper/validator');
const { adminInputValidation } = require('../../validators/adminValidator');

jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock('../../config/helper');
jest.mock('../../helper/validator');
jest.mock('../../validators/adminValidator');
jest.mock('jsonwebtoken');

describe('login', () => {
   let req;
   let res;

   beforeEach(() => {
      req = {
         body: {
            email: 'admin@example.com',
            password: 'securePassword123',
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
      adminInputValidation.mockReset();
      decryptData.mockReset();
      jwt.sign.mockReset();
   });

   test('should return INPUT_VALIDATION if validation fails', async () => {
      adminInputValidation.mockResolvedValue('Validation Error');

      await loginController.login(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Validation Error',
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0,
      );
   });

   test('should return NOT_EXIST if email is not registered', async () => {
      adminInputValidation.mockResolvedValue(null); // No validation error
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null), // User not found
      }));

      await loginController.login(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.EMAIL_NOT_REGISTERED,
         res,
         constant.CODE.SUCCESS,
         {},
         constant.CODE.NOT_EXIST,
      );
   });

   test('should return INCORRECT_PASS if password is incorrect', async () => {
      adminInputValidation.mockResolvedValue(null); // No validation error
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ password: 'encryptedPassword' }), // User found
      }));

      decryptData.mockReturnValue('wrongPassword'); // Simulate incorrect password

      await loginController.login(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INCORRECT_PASS,
         res,
         constant.CODE.SUCCESS,
         {},
         0,
      );
   });

   test('should log in successfully and return a token', async () => {
      adminInputValidation.mockResolvedValue(null); // No validation error
      const mockUser = {
         id: 1,
         email: 'admin@example.com',
         password: 'encryptedPassword',
      };
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(mockUser), // User found
      }));

      decryptData.mockReturnValue('securePassword123'); // Correct password
      jwt.sign.mockReturnValue('mockToken'); // Simulate token generation

      await loginController.login(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {
            token: 'Bearer mockToken',
            user: mockUser,
         },
         1,
      );
   });

   test('should handle unexpected errors gracefully', async () => {
      adminInputValidation.mockResolvedValue(null); // No validation error
      knex.mockImplementationOnce(() => {
         throw new Error('Unexpected Error');
      });

      await loginController.login(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Unexpected Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0,
      );
   });
});
