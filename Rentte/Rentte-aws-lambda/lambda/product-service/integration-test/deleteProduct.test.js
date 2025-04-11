const productController = require('../product/controller/productController');
const constant = require('../config/constant');
const knex = require('../db/db');
const logger = require("../config/winston");
const { sendResponse } = require('../config/helper');

jest.mock('../db/db');
jest.mock('../config/winston');
jest.mock("../config/helper"); // Mock sendResponse if it's in a separate file

describe("deleteProduct", () => {
   let req, res;

   beforeEach(() => {
      req = {
         user: { id: 1 },
         ip: '127.0.0.1',
         query: { productId: 123 },
         body: {},
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

   test('should return INPUT_VALIDATION if productId is missing', async () => {
      req.query = {}; // No productId provided
      await productController.deleteProduct(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         "product id not found",
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0
      );
   });

   test('should return NOT_FOUND if product does not exist', async () => {
      knex.mockImplementation(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null), // No product found
      }));
      await productController.deleteProduct(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.NOT_FOUND.replace("{{key}}", "category"),
         res,
         constant.CODE.NOT_FOUND,
         {},
         0
      );
   });

   test('should successfully delete a product', async () => {
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 123, isdelete: false }), // Product found
      }));
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockResolvedValue(1), // Successfully updated to mark as deleted
      }));
      await productController.deleteProduct(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {},
         1
      );
   });

   test('should return INTERNAL_SERVER_ERROR on database failure', async () => {
      knex.mockImplementation(() => {
         throw new Error('Internal Server Error');
      });
      await productController.deleteProduct(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         'Internal Server Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });
});
