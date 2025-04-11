const authController = require('../../user/controller/authController'); // Adjust path as necessary
const constant = require('../../config/constant');
const knex = require('../../db/db');
const logger = require("../../config/winston");
const { sendResponse } = require('../../config/helper');
jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock('../../config/helper');

describe('updateProfile', () => {
   let req; let res;

   beforeEach(() => {
      req = {
         user: { id: 1 },
         ip: '127.0.0.1',
         body: { mobileNumber: '1234567890' },
         file: null,
         headers: {},
      };
      res = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn(),
      };
      knex.mockReset();
      jest.spyOn(logger, 'info').mockImplementation(() => {});
      jest.spyOn(logger, 'error').mockImplementation(() => {});
   });

   test('should successfully update the profile and increment mobile update count', async () => {
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ mobileUpdateCount: 1, mobileNumber: '1234567890' }),
      }));
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockResolvedValue(1),
      }));
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         increment: jest.fn().mockResolvedValue(1),
      }));
      await authController.updateProfile(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.UPDATE_PROFILE,
         res,
         constant.CODE.SUCCESS,
         expect.objectContaining({}),
         1
      );
   });

   test('should return BAD_REQUEST if user has exceeded mobile number update limit', async () => {
      req.body.mobileNumber = '0987654321';
      knex.mockImplementation(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ mobileUpdateCount: 2, mobileNumber: '1234567890' }),
      }));
      await authController.updateProfile(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.MOBILE_UPDATE_TWICE,
         res,
         constant.CODE.BAD_REQUEST,
         {},
         0
      );
   });

   test('should return BAD_REQUEST if profile update fails', async () => {
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ mobileUpdateCount: 1, mobileNumber: '1234567890' }),
      }));
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockResolvedValue(0),
      }));
      await authController.updateProfile(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.BAD_REQUEST,
         res,
         constant.CODE.BAD_REQUEST,
         {},
         0
      );
   });

   test('should handle exceptions and return INTERNAL_SERVER_ERROR', async () => {
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockImplementation(() => { throw new Error('Internal Server Error'); }),
      }));
      await authController.updateProfile(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });

   test('should return BAD_REQUEST if mobile number format is invalid', async () => {
      req.body.mobileNumber = 'invalidNumber'; // non-numeric or incorrect format
      await authController.updateProfile(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         'Invalid mobile number format',
         res,
         constant.CODE.BAD_REQUEST,
         {},
         0
      );
   });

   test('should handle database connection failure and return INTERNAL_SERVER_ERROR', async () => {
      knex.mockImplementationOnce(() => {
         throw new Error('Internal Server Error');
      });
      await authController.updateProfile(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });
});
