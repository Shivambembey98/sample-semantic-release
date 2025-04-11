const changePasswordController = require('../../admin/controller/authController');
const knex = require('../../db/db');
const constant = require('../../config/constant');
const logger = require('../../config/winston');
const { sendResponse } = require('../../config/helper');
const { decryptData, encryptdata } = require('../../helper/validator');
const { adminInputValidation } = require('../../validators/adminValidator');
const authController = require('../../admin/controller/authController');

jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock('../../config/helper');
jest.mock('../../helper/validator');
jest.mock('../../validators/adminValidator');

describe('changePassword', () => {
   let req;
   let res;

   beforeEach(() => {
      req = {
         body: {
            otpId: 1,
            confirmPassword: 'newSecurePassword123',
            mobile: '1234567890',
         },
         user: { id: 1 },
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
      encryptdata.mockReset();
   });

   test('should return INPUT_VALIDATION if validation fails', async () => {
      adminInputValidation.mockResolvedValue('Validation Error');

      await authController.changePassword(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Validation Error',
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0,
      );
   });

   test('should return NOT_VERIFIED if OTP is not verified', async () => {
      adminInputValidation.mockResolvedValue(null); // No validation error
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null), // OTP not verified
      }));

      await authController.changePassword(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.NOT_VERIFIED.replace('{{key}}', 'otp'),
         res,
         constant.CODE.BAD_REQUEST,
         {},
         0,
      );
   });

   test('should return PASSWORD_NOT_MATCH if passwords are the same', async () => {
      adminInputValidation.mockResolvedValue(null); // No validation error
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 1, isVerify: true }), // OTP verified
      }));
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ password: 'encryptedOldPassword' }), // User details fetched
      }));

      decryptData.mockReturnValue('newSecurePassword123'); // Simulate password match

      await authController.changePassword(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.PASSWORD_NOT_MATCH,
         res,
         constant.CODE.BAD_REQUEST,
         {},
         0,
      );
   });

   test('should return BAD_REQUEST if password update fails', async () => {
      adminInputValidation.mockResolvedValue(null); // No validation error
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 1, isVerify: true }), // OTP verified
      }));
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ password: 'encryptedOldPassword' }), // User details fetched
      }));

      decryptData.mockReturnValue('differentPassword123'); // Passwords don't match
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockResolvedValue(0), // Simulate failed update
      }));

      await authController.changePassword(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'fail to update password',
         res,
         constant.CODE.BAD_REQUEST,
         {},
         0,
      );
   });

   test('should successfully change the password', async () => {
      adminInputValidation.mockResolvedValue(null); // No validation error
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 1, isVerify: true }), // OTP verified
      }));
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ password: 'encryptedOldPassword' }), // User details fetched
      }));

      decryptData.mockReturnValue('differentPassword123'); // Passwords don't match
      encryptdata.mockReturnValue('encryptedNewPassword'); // Encrypt new password
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockResolvedValue(1), // Simulate successful update
      }));

      await authController.changePassword(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.PASSWORD_UPDATE,
         res,
         constant.CODE.SUCCESS,
         {},
         1,
      );
   });

   test('should handle unexpected errors gracefully', async () => {
      adminInputValidation.mockResolvedValue(null); // No validation error
      knex.mockImplementationOnce(() => {
         throw new Error('Unexpected Error');
      });

      await authController.changePassword(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Unexpected Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0,
      );
   });
});
