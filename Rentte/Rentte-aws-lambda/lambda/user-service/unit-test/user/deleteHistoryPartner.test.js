const productController = require('../../user/controller/productController');
const constant = require('../../config/constant');
const knex = require('../../db/db');
const logger = require("../../config/winston");
const { inputValidation } = require("../../validators/productValidator");
const { sendResponse } = require("../../config/helper");

jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock("../../validators/productValidator");
jest.mock("../../config/helper");

describe("deleteHistoryPartner", () => {
   let req; 
   let res;

   beforeEach(() => {
      req = {
         body: { historyid: 123 },
         ip: '127.0.0.1',
         headers: {},
      };
      res = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn(),
      };
      knex.mockReset();
      inputValidation.mockReset();
      sendResponse.mockReset();
      jest.spyOn(logger, 'info').mockImplementation(() => {});
      jest.spyOn(logger, 'error').mockImplementation(() => {});
   });

   test('should successfully delete history partner', async () => {
      inputValidation.mockResolvedValue(null);
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockResolvedValue(1), // Simulate successful update
      }));
      await productController.deleteHistoryPartner(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {},
         1
      );
   });

   test('should return INPUT_VALIDATION if input validation fails', async () => {
      inputValidation.mockResolvedValue('Validation error');
      await productController.deleteHistoryPartner(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         'Validation error',
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0
      );
   });

   test('should return BAD_REQUEST if no history is deleted', async () => {
      inputValidation.mockResolvedValue(null);
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockResolvedValue(0), // Simulate no records updated
      }));
      await productController.deleteHistoryPartner(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.BAD_REQUEST,
         res,
         constant.CODE.BAD_REQUEST,
         {},
         0
      );
   });

   test('should handle exceptions and return INTERNAL_SERVER_ERROR', async () => {
      knex.mockImplementationOnce(() => {
         throw new Error('Internal Server Error');
      });
      await productController.deleteHistoryPartner(req, res);
      expect(sendResponse).toHaveBeenCalledWith(constant.MESSAGE.INTERNAL_ERROR,
         res,constant.CODE.INTERNAL_SERVER_ERROR,{},0);
   });

   test('should return INPUT_VALIDATION if historyid is missing', async () => {
      req.body = {}; // Missing historyid
      inputValidation.mockResolvedValue('Validation error');
      await productController.deleteHistoryPartner(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         'Validation error',
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0
      );
   });

   test('should return INTERNAL_SERVER_ERROR if update fails', async () => {
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockRejectedValue(new Error('Internal Server Error')),
      }));
      await productController.deleteHistoryPartner(req, res);
      expect(sendResponse).toHaveBeenCalledWith(constant.MESSAGE.INTERNAL_ERROR,
         res,constant.CODE.INTERNAL_SERVER_ERROR,{},0);
   });
});
