const knex = require('../db/db');
const { sendResponse } = require('../config/helper');
const constant = require('../config/constant');
const cancelRentProductController = require('../product/controller/productController');
const logger = require('../config/winston');

jest.mock('../db/db');
jest.mock('../config/helper');
jest.mock('../config/winston');

describe('cancelRentProduct API', () => {
   let req, res;

   beforeEach(() => {
      req = {
         body: { productId: 1 },
         ip: '127.0.0.1',
         headers: {},
      };
      res = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn().mockReturnThis(),
      };

      jest.spyOn(logger, 'info').mockImplementation(() => {});
      jest.spyOn(logger, 'error').mockImplementation(() => {});

      knex.mockReset();
      sendResponse.mockReset();
   });

   test('should return error when no productId is provided', async () => {
      req.body.productId = null;

      await cancelRentProductController.cancelRentProduct(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.NOT_FOUND.replace("{{key}}", "product id"),
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0
      );
   });

   test('should handle database errors gracefully during product update', async () => {
      req.body.productId = 1;
      knex.mockResolvedValueOnce([{ id: 1, isRented: true }]);
      knex.mockImplementation(() => {
         throw new Error('Internal Server Error');
      });
      await cancelRentProductController.cancelRentProduct(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });

   test('should handle a successful update even without any product data found', async () => {
      req.body.productId = 1;
      knex.mockResolvedValueOnce([{ id: 1, isRented: true }]);
      knex.mockResolvedValueOnce([]);  // Simulate successful update

      await cancelRentProductController.cancelRentProduct(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });
});
