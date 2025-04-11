const knex = require('../db/db');
const { sendResponse } = require('../config/helper');
const constant = require('../config/constant');
const listProductController = require('../product/controller/productController');
const logger = require('../config/winston');


jest.mock('../db/db');
jest.mock('../config/helper');
jest.mock('../config/winston');

describe('listProduct API', () => {
   let req, res;

   beforeEach(() => {
      req = {
         query: {},
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

   test('should return error if neither lat/long nor state/country are provided', async () => {
      await listProductController.listProduct(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Either lat/long or state/country is required',
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0
      );
   });

   test('should handle database errors gracefully', async () => {
      req.query = { page: 1, state: 'California' };

      // Mock database query to throw an error
      knex.mockImplementation(() => {
         throw new Error('Internal Server Error');
      });
      await listProductController.listProduct(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });
});
