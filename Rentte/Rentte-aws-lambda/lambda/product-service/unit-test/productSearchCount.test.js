const productController = require('../product/controller/productController');
const constant = require('../config/constant');
const knex = require('../db/db');
const logger = require("../config/winston");
const { sendResponse } = require('../config/helper');

jest.mock('../db/db');
jest.mock('../config/winston');
jest.mock("../config/helper");
describe('productSearchCount', () => {
   let req, res;

   beforeEach(() => {
      req = {
         ip: '127.0.0.1',
         body: { productIdList: [1, 2, 3] },
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
   });

   test('should successfully increment the search count for product list', async () => {
      knex.mockImplementationOnce(() => ({
         whereIn: jest.fn().mockReturnThis(),
         increment: jest.fn().mockResolvedValue(1), // Successfully updated count
      }));
      await productController.productSearchCount(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.UPDATE_SERACH_COUNT,
         res,
         constant.CODE.SUCCESS,
         {},
         1
      );
   });

   test('should return BAD_REQUEST if productIdList is empty', async () => {
      req.body.productIdList = []; // Empty productIdList
      await productController.productSearchCount(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.ID_LIST_INVALID,
         res,
         constant.CODE.BAD_REQUEST,
         {},
         0
      );
   });

   test('should return BAD_REQUEST if no product search count was updated', async () => {
      knex.mockImplementationOnce(() => ({
         whereIn: jest.fn().mockReturnThis(),
         increment: jest.fn().mockResolvedValue(0), // No rows updated
      }));
      await productController.productSearchCount(req, res);

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
      await productController.productSearchCount(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         'Internal Server Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });
});
