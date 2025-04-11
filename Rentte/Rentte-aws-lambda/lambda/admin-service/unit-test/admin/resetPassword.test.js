const resetPasswordController = require('../../admin/controller/authController');
const knex = require('../../db/db');
const constant = require('../../config/constant');
const logger = require('../../config/winston');
const { sendResponse } = require('../../config/helper');
const { encryptdata, decryptData } = require('../../helper/validator');
const { adminInputValidation } = require('../../validators/adminValidator');
const jwt = require('jsonwebtoken');

jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock('../../config/helper');
jest.mock('../../helper/validator');
jest.mock('../../validators/adminValidator');
jest.mock('jsonwebtoken');

describe('resetPassword', () => {
   let req;
   let res;

   beforeEach(() => {
      req = {
         body: {
            token: 'mockToken',
            confirmPassword: 'newPassword123',
            newPassword: "newPassword123"
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
      jwt.verify.mockReset();
      encryptdata.mockReset();
      decryptData.mockReset();
   });

   test('should return INPUT_VALIDATION if validation fails', async () => {
      adminInputValidation.mockResolvedValue('Validation Error');

      await resetPasswordController.resetPassword(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Validation Error',
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0,
      );
   });

   test('should return EXPIRE_LINK if token is invalid or expired', async () => {
      adminInputValidation.mockResolvedValue(null); // No validation errors
      jwt.verify.mockImplementation((token, secret, callback) => {
         callback(new Error('Token expired'), null);
      });

      await resetPasswordController.resetPassword(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.EXPIRE_LINK,
         res,
         constant.CODE.SUCCESS,
         {},
         0,
      );
   });

   test('should return PASSWORD_NOT_MATCH if new password matches current password', async () => {
      adminInputValidation.mockResolvedValue(null); // No validation errors
      jwt.verify.mockImplementation((token, secret, callback) => {
         callback(null, { id: 1 }); // Valid token
      });
    
      // Simulating the user detail in the database
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({
            password: encryptdata('newPassword123'), // current password (encrypted)
         }),
      }));
        
      // Simulating the decrypted password being the same as the confirmPassword
      decryptData.mockReturnValue('newPassword123'); // Current password is the same as the new password
    
      // Simulating the reset password request
      await resetPasswordController.resetPassword(req, res);
    
      // Expecting the message defined in constant.MESSAGE.PASSWORD_NOT_MATCH
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.BAD_REQUEST, // Check that the correct message is sent
         res,
         constant.CODE.BAD_REQUEST, // Check for the correct status code
         {},
         0,
      );
   });       
       
   test('should return INTERNAL_SERVER_ERROR on unexpected exceptions', async () => {
      adminInputValidation.mockResolvedValue(null); // No validation errors
      jwt.verify.mockImplementation(() => {
         throw new Error('Unexpected Error');
      });

      await resetPasswordController.resetPassword(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Unexpected Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0,
      );
   });
});
