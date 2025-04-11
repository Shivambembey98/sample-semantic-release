const registerController = require('../../admin/controller/authController');
const knex = require('../../db/db');
const constant = require('../../config/constant');
const logger = require('../../config/winston');
const { sendResponse } = require('../../config/helper');
const { encryptdata } = require('../../helper/validator');
const { adminInputValidation } = require('../../validators/adminValidator');

jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock('../../config/helper');
jest.mock('../../helper/validator');
jest.mock('../../validators/adminValidator');

describe('register', () => {
   let req;
   let res;

   beforeEach(() => {
      req = {
         body: {
            email: 'admin@example.com',
            password: 'securePassword123',
            firstName: 'Admin',
            lastName: 'User',
            mobileNumber: '9876543210',
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
   });

   test('should return INPUT_VALIDATION if validation fails', async () => {
      adminInputValidation.mockResolvedValue('Validation Error');

      await registerController.register(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Validation Error',
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0,
      );
   });

   test('should return ALREADY_EXIST if email is already registered', async () => {
      adminInputValidation.mockResolvedValue(null); // No validation errors
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ email: 'admin@example.com' }), // Mock existing user
      }));

      await registerController.register(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.ALREADY_EXIST.replace('{{key}}', 'user'),
         res,
         constant.CODE.ALREADY_EXIST,
         {},
         0,
      );
   });

   test('should register new admin successfully', async () => {
      adminInputValidation.mockResolvedValue(null); // No validation errors
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null), // No existing user
      }));
      knex.mockImplementationOnce(() => ({
         insert: jest.fn().mockResolvedValue([1]), // Simulate insertion success
      }));

      encryptdata.mockReturnValue('encryptedPassword');

      await registerController.register(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {},
         1,
      );
   });

   test('should handle unexpected errors gracefully', async () => {
      adminInputValidation.mockResolvedValue(null); // No validation errors
      knex.mockImplementationOnce(() => {
         throw new Error('Unexpected Error');
      });

      await registerController.register(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Unexpected Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0,
      );
   });
});
