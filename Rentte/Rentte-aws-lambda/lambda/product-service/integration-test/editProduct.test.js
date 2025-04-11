const knex = require('../db/db');
const { sendResponse } = require('../config/helper');
const constant = require('../config/constant');
const editProductController = require('../product/controller/productController');
const logger = require('../config/winston');

jest.mock('../db/db');
jest.mock('../config/helper');
jest.mock('../config/winston');

describe('editProduct API', () => {
   let req, res;

   beforeEach(() => {
      req = {
         query: {},
         body: { productName: 'Test Product', description: 'Product Description' },
         user: { id: 1 },
         ip: '127.0.0.1',
         headers: {},
         files: [],
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
      req.query.productId = null;

      await editProductController.editProduct(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.NOT_FOUND.replace("{{key}}", "product id"),
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0
      );
   });

   test('should return error if user is not found', async () => {
      req.user.id = null;
      knex.mockResolvedValueOnce(null); // User not found

      await editProductController.editProduct(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.NOT_FOUND.replace("{{key}}", "user"),
         res,
         constant.CODE.NOT_FOUND,
         {},
         0
      );
   });

   test('should handle database errors gracefully during product update', async () => {
      req.query.productId = 1;
      knex.mockResolvedValueOnce([{ id: 1, userType: 'partner' }]);
      knex.mockRejectedValueOnce(new Error('Database error'));  // Simulate DB error

      await editProductController.editProduct(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });

   test('should handle missing files gracefully', async () => {
      req.query.productId = 1;
      knex.mockResolvedValueOnce([{ id: 1, userType: 'partner' }]);
      knex.mockResolvedValueOnce([]);  // Successful update without images

      await editProductController.editProduct(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });
});
