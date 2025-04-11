const productController = require('../../user/controller/productController'); // Adjust path as necessary
const constant = require('../../config/constant');
const knex = require('../../db/db');
const logger = require("../../config/winston");
const { inputValidation } = require("../../validators/productValidator");
const { sendResponse } = require("../../config/helper"); // Assuming sendResponse is imported from helpers
jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock("../../validators/productValidator");
jest.mock("../../config/helper"); // Mock sendResponse if it's in a separate file

describe("createHistoryPartner", () => {
   let req; let res;
   
   beforeEach(() => {
      req = {
         user: { id: 1 },
         body: { partnerId: 123, rentalDetails: "Details about the rental" },
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

   test('should successfully create history partner', async () => {
      inputValidation.mockResolvedValue(null);
      knex.mockImplementationOnce(() => ({
         insert: jest.fn().mockReturnThis(),
         returning: jest.fn().mockResolvedValue([1]),
      }));
      await productController.createHistoryPartner(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.CREATE_HISTORY,
         res,
         constant.CODE.SUCCESS,
         {},
         1
      );
   });

   test('should return INPUT_VALIDATION if input validation fails', async () => {
      inputValidation.mockResolvedValue('Validation error');
      await productController.createHistoryPartner(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         'Validation error',
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0
      );
   });

   test('should return BAD_REQUEST if no history is created', async () => {
      inputValidation.mockResolvedValue(null);
      knex.mockImplementationOnce(() => ({
         insert: jest.fn().mockReturnThis(),
         returning: jest.fn().mockResolvedValue([]), // No records returned from the insert
      }));
      await productController.createHistoryPartner(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.BAD_REQUEST,
         res,
         constant.CODE.BAD_REQUEST,
         {},
         0
      );
   });

   test('should handle exceptions and return INTERNAL_SERVER_ERROR', async () => {
      inputValidation.mockResolvedValue(null);
      knex.mockImplementationOnce(() => {
         throw new Error('Internal Server Error');
      });
      await productController.createHistoryPartner(req, res);
      expect(sendResponse).toHaveBeenCalledWith(constant.MESSAGE.INTERNAL_ERROR,
         res,constant.CODE.INTERNAL_SERVER_ERROR,{},0);
   });

   test('should return INPUT_VALIDATION if partnerId is missing', async () => {
      req.body = { rentalDetails: "Details about the rental" };
      inputValidation.mockResolvedValue('Validation error');
      await productController.createHistoryPartner(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         'Validation error',
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0
      );
   });

   test('should return INTERNAL_SERVER_ERROR if insert fails', async () => {
      inputValidation.mockResolvedValue(null);
      knex.mockImplementationOnce(() => ({
         insert: jest.fn().mockReturnThis(),
         returning: jest.fn().mockRejectedValue(new Error('Internal Server Error')),
      }));
      await productController.createHistoryPartner(req, res);
      expect(sendResponse).toHaveBeenCalledWith(constant.MESSAGE.INTERNAL_ERROR,
         res,constant.CODE.INTERNAL_SERVER_ERROR,{},0);
   });
});
