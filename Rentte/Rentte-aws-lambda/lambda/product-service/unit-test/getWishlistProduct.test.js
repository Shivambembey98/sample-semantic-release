const wishlistController = require('../product/controller/productController');
const knex = require('../db/db');
const { sendResponse } = require('../config/helper');
const constant = require('../config/constant');
const logger = require('../config/winston');

jest.mock('../db/db');
jest.mock('../config/helper');
jest.mock('../config/winston');

describe('getWishListProduct API', () => {
   let req, res;

   beforeEach(() => {
      req = {
         user: { id: 1 },
         query: { page: 1, limit: 10 },
         ip: '127.0.0.1',
         headers: {},
      };
      res = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn().mockReturnThis(),
      };

      jest.clearAllMocks();
   });

   test('should handle database errors gracefully', async () => {
      knex.mockImplementation(() => {
         throw new Error('Internal Server Error');
      });
      await wishlistController.getWishListProduct(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });

   test('should handle missing user id gracefully', async () => {
      req.user.id = null; // Simulate missing user ID

      await wishlistController.getWishListProduct(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });
});
