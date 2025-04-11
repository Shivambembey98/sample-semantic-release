const productController = require('../product/controller/productController');
const constant = require('../config/constant');
const knex = require('../db/db');
const logger = require("../config/winston");
const { sendResponse } = require('../config/helper');

jest.mock('../db/db');
jest.mock('../config/winston');
jest.mock("../validators/productValidator");
jest.mock("../config/helper");

describe('productViewCount', () => {
   let req; let res;
   beforeEach(() => {
      req = {
         ip: '127.0.0.1',
         body: { productId: 123 },
         headers: {},
      };
      res = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn(),
      };
      knex.mockReset();
      jest.spyOn(logger, 'info').mockImplementation(() => {});
      jest.spyOn(logger, 'error').mockImplementation(() => {});
      jest.clearAllMocks(); // Clear all mocks before each test
   });

   test('should successfully increment the view count', async () => {
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         increment: jest.fn().mockResolvedValue(1),
      }));
      await productController.productViewCount(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.VIEW_COUNT,
         res,
         constant.CODE.SUCCESS,
         {},
         1
      );
   });

   test('should return NOT_FOUND if productId is not provided', async () => {
      req.body = {};
      await productController.productViewCount(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.NOT_FOUND.replace("{{key}}", "product id"),
         res,
         constant.CODE.NOT_FOUND,
         {},
         0
      );
   });

   test('should return BAD_REQUEST if view count update fails', async () => {
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         increment: jest.fn().mockResolvedValue(0),
      }));
      await productController.productViewCount(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.BAD_REQUEST,
         res,
         constant.CODE.BAD_REQUEST,
         {},
         0
      );
   });

   test('should handle exceptions and return INTERNAL_SERVER_ERROR', async () => {
      knex.mockImplementation(() => {
         throw new Error('Internal Server Error');
      });
      await productController.productViewCount(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         'Internal Server Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });
});
