const forgotPasswordController = require('../../admin/controller/authController');
const knex = require('../../db/db');
const constant = require('../../config/constant');
const logger = require('../../config/winston');
const { sendResponse } = require('../../config/helper');
const jwt = require('jsonwebtoken');
const { adminInputValidation } = require('../../validators/adminValidator');
const { sendMail } = require('../../helper/mail');

jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock('../../config/helper');
jest.mock('../../validators/adminValidator');
jest.mock('jsonwebtoken');
jest.mock('../../helper/mail');

describe('forgotPassword', () => {
   let req;
   let res;

   beforeEach(() => {
      req = {
         body: {
            email: 'admin@example.com',
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
      jwt.sign.mockReset();
      sendMail.mockReset();
   });

   test('should return INPUT_VALIDATION if validation fails', async () => {
      adminInputValidation.mockResolvedValue('Validation Error');

      await forgotPasswordController.forgotPassword(req, res);

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

      await forgotPasswordController.forgotPassword(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.EMAIL_NOT_REGISTERED,
         res,
         constant.CODE.SUCCESS,
         {},
         constant.CODE.NOT_EXIST,
      );
   });

   test('should send reset link successfully', async () => {
      adminInputValidation.mockResolvedValue(null); // No validation error
      const mockAdmin = {
         id: 1,
         email: 'admin@example.com',
         firstName: 'John',
         lastName: 'Doe',
      };
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(mockAdmin), // User found
      }));

      jwt.sign.mockReturnValue('mockResetToken'); // Simulate token generation

      sendMail.mockResolvedValue(true); // Simulate successful mail sending

      await forgotPasswordController.forgotPassword(req, res);

      expect(sendMail).toHaveBeenCalledWith(res, {
         name: 'John Doe',
         email: 'admin@example.com',
         subject: 'Password Reset Link',
         link: `${process.env.ADMIN_RESET_PASSWORD_URL}/mockResetToken`,
      });

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.EMAIL_SEND,
         res,
         constant.CODE.SUCCESS,
         { token: 'Bearer mockResetToken' },
         1,
      );
   });

   test('should handle sendMail failure gracefully', async () => {
      adminInputValidation.mockResolvedValue(null); // No validation error
      const mockAdmin = {
         id: 1,
         email: 'admin@example.com',
         firstName: 'John',
         lastName: 'Doe',
      };
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(mockAdmin), // User found
      }));

      jwt.sign.mockReturnValue('mockResetToken'); // Simulate token generation

      sendMail.mockRejectedValue(new Error('Mail Sending Failed')); // Simulate mail sending failure

      await forgotPasswordController.forgotPassword(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Mail Sending Failed',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0,
      );
   });

   test('should handle unexpected errors gracefully', async () => {
      adminInputValidation.mockResolvedValue(null); // No validation error
      knex.mockImplementationOnce(() => {
         throw new Error('Unexpected Error');
      });
      await forgotPasswordController.forgotPassword(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         'Unexpected Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0,
      );
   });
});
