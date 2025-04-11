const knex = require('../db/db');
const { sendResponse } = require('../config/helper');
const constant = require('../config/constant');
const getBannerListController = require('../product/controller/productController');
const logger = require('../config/winston');

jest.mock('../db/db');
jest.mock('../config/helper');
jest.mock('../config/winston');

describe('getBannerList API', () => {
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
      sendResponse.mockReset()
   });

   test('should handle database errors gracefully', async () => {
      // Mock database query to throw an error
      knex.mockImplementation(() => {
        throw new Error('Internal Server Error');
     });

      await getBannerListController.getBannerList(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });
});
