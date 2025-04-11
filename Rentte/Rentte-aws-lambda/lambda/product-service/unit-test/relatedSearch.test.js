const productController = require('../product/controller/productController');
const constant = require('../config/constant');
const knex = require('../db/db');
const logger = require("../config/winston");
const { sendResponse } = require('../config/helper');

jest.mock('../db/db');
jest.mock('../config/winston');
jest.mock("../config/helper"); // Mock sendResponse if it's in a separate file

describe('relatedSearch', () => {
   let req; let res;
   beforeEach(() => {
      req = {
         ip: '127.0.0.1',
         query: {
            state: 'California',
            country: 'USA',
            categoryId: 1,
            subCategoryId: 2,
            userid: 3,
         },
         headers: {},
      };
      res = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn(),
      };
      knex.raw.mockReset();
      jest.spyOn(logger, 'info').mockImplementation(() => {});
      jest.spyOn(logger, 'error').mockImplementation(() => {});
      jest.clearAllMocks(); // Ensure a clean state for mocks before each test
   });

   test('should successfully retrieve products based on query parameters', async () => {
      const mockProducts = {
         rows: [
            { id: 1, name: 'Product A' },
            { id: 2, name: 'Product B' },
         ],
      };
      knex.raw.mockResolvedValue(mockProducts);

      await productController.relatedSearch(req, res);

      expect(knex.raw).toHaveBeenCalledWith(expect.stringContaining(`"products"."state" = 'California'`));
      expect(knex.raw).toHaveBeenCalledWith(expect.stringContaining(`"products"."country" = 'USA'`));
      expect(knex.raw).toHaveBeenCalledWith(expect.stringContaining(`"products"."categoryId" = 1`));
      expect(knex.raw).toHaveBeenCalledWith(expect.stringContaining(`"products"."subCategoryId" = 2`));
      expect(knex.raw).toHaveBeenCalledWith(expect.stringContaining(`"wishlist"."userid" = 3`));
      
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         { products: mockProducts.rows },
         1
      );
   });

   test('should handle exceptions and return INTERNAL_SERVER_ERROR', async () => {
      knex.raw.mockRejectedValue(new Error('Internal Server Error'));

      await productController.relatedSearch(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Internal Server Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });
});
