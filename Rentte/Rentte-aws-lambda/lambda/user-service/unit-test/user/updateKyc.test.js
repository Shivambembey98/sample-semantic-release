const authController = require('../../user/controller/authController'); // Adjust path as necessary
const constant = require('../../config/constant');
const knex = require('../../db/db');
const logger = require("../../config/winston");
const { sendResponse } = require('../../config/helper');
jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock("../../config/helper");

describe('updateKyc', () => {
   let req; let res;
   beforeEach(() => {
      req = {
         user: { id: 1 },
         ip: '127.0.0.1',
         body: { panCardNumber: 'ABCDE1234F', aadhaarNumber: '123456789012', otherKycInfo: 'some info' },
         files: null, // No files initially
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

   test('should return BAD_REQUEST if KYC update fails', async () => {
      req.files = {
         aadhaarImage: [{ key: 'aadhaar123.jpg', mimetype: 'image/jpeg' }],
         panCardImage: [{ key: 'pan123.jpg', mimetype: 'image/jpeg' }],
      };

      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockResolvedValue(0),
      }));

      await authController.updateKyc(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Request failed',
         res,
         constant.CODE.BAD_REQUEST,
         {},
         0
      );
   });

   test('should return INTERNAL_SERVER_ERROR if an exception is thrown', async () => {
      const errorMessage = "Database error";

      knex.mockImplementation(() => ({
         where: jest.fn().mockImplementation(() => { throw new Error(errorMessage); }),
      }));

      await authController.updateKyc(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });

   test('should successfully update KYC with files', async () => {
      req.files = {
         aadhaarImage: [{ key: 'aadhaar123.jpg', mimetype: 'image/jpeg' }],
         panCardImage: [{ key: 'pan123.jpg', mimetype: 'image/jpeg' }],
      };

      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockResolvedValue(1),
      }));

      await authController.updateKyc(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {},
         1
      );
   });
});
