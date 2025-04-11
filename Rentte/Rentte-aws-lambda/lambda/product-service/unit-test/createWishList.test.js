const productController = require('../product/controller/productController');
const constant = require('../config/constant');
const knex = require('../db/db');
const logger = require("../config/winston");
const { inputValidation } = require("../validators/productValidator");
const { sendResponse } = require('../config/helper');

jest.mock('../db/db');
jest.mock('../config/winston');
jest.mock("../validators/productValidator");
jest.mock("../config/helper"); // Mock sendResponse if it's in a separate file

describe('wishListProduct', () => {
   let req; let res;
   beforeEach(() => {
      req = {
         user: { id: 1 },
         ip: '127.0.0.1',
         body: { productId: 123 },
         headers: {},
      };
      res = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn(),
      };
      knex.mockReset();
      inputValidation.mockReset();
      jest.spyOn(logger, 'info').mockImplementation(() => {});
      jest.spyOn(logger, 'error').mockImplementation(() => {});
      jest.clearAllMocks(); // Clear all mocks before each test
   });

   test('should successfully add a product to the wishlist', async () => {
      inputValidation.mockResolvedValue(null);
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null),
      }));
      knex.mockImplementationOnce(() => ({
         insert: jest.fn().mockResolvedValue(1),
      }));
      await productController.wishListProduct(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {},
         1
      );
   });

   test('should toggle the wishlist status of an existing product', async () => {
      inputValidation.mockResolvedValue(null);
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ status: true }),
      }));
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockResolvedValue(1),
      }));
      await productController.wishListProduct(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {},
         1
      );
   });

   test('should return INPUT_VALIDATION if input validation fails', async () => {
      inputValidation.mockResolvedValue('Validation error');
      await productController.wishListProduct(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Validation error',
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0
      );
   });

   test('should handle exceptions and return INTERNAL_SERVER_ERROR', async () => {
      inputValidation.mockResolvedValue(null);
      knex.mockImplementation(() => {
         throw new Error('Internal Server Error');
      });
      await productController.wishListProduct(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Internal Server Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });
});
