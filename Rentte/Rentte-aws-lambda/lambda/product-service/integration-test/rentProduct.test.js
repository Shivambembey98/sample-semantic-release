const productController = require('../product/controller/productController');
const knex = require('../db/db');
const { sendResponse } = require("../config/helper");
const constant = require('../config/constant');
const logger = require('../config/winston');

jest.mock('../db/db');
jest.mock("../config/helper");
jest.mock('../config/winston');

describe('rentProduct', () => {
   let req, res;

   beforeEach(() => {
      req = {
         body: {},
         ip: '127.0.0.1',
         headers: {},
      };
      res = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn().mockReturnThis(),
      };
   });

   test('should return error if productId is not provided', async () => {
      req.body = {}; // No productId

      await productController.rentProduct(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'product id not found',
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0
      );
   });

   test('should rent the product successfully', async () => {
      req.body = { productId: 1 };

      knex.mockReturnValueOnce({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null),
      });

      knex.mockReturnValueOnce({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockResolvedValue(1),
      });

      await productController.rentProduct(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Success',
         res,
         constant.CODE.SUCCESS,
         {},
         1
      );
   });

   test('should return internal server error when there is an unexpected error', async () => {
      req.body = { productId: 1 };

      knex.mockReturnValueOnce({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockRejectedValue(new Error('Internal Server Error')),
      });

      await productController.rentProduct(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });
});
