const productController = require('../product/controller/productController');
const knex = require('../db/db');
const { sendResponse } = require('../config/helper');
const constant = require('../config/constant');
const logger = require('../config/winston');

jest.mock('../db/db');
jest.mock('../config/helper');
jest.mock('../config/winston');

describe('productDetails API', () => {
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
   });

   test('should return error if productId is not provided', async () => {
      await productController.productDetails(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'product id'),
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0
      );
   });

   test('should return product details successfully without wishlist if userid is not provided', async () => {
      req.query = { productId: 1 };

      knex.mockReturnValueOnce({
         select: jest.fn().mockReturnThis(),
         leftJoin: jest.fn().mockReturnThis(),
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({
            id: 1,
            name: 'Test Product',
            categoryName: 'Category 1',
            subcategoryName: 'Subcategory 1',
         }),
      });

      await productController.productDetails(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         { detailsOfProduct: { id: 1, name: 'Test Product', categoryName: 'Category 1', subcategoryName: 'Subcategory 1', isWishlist: false } },
         1
      );
   });

   test('should return product details successfully with wishlist if userid is provided and product is in wishlist', async () => {
      req.query = { productId: 1, userid: 2 };

      knex.mockReturnValueOnce({
         select: jest.fn().mockReturnThis(),
         leftJoin: jest.fn().mockReturnThis(),
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({
            id: 1,
            name: 'Test Product',
            categoryName: 'Category 1',
            subcategoryName: 'Subcategory 1',
         }),
      });

      knex.mockReturnValueOnce({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({}),
      });

      await productController.productDetails(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         { detailsOfProduct: { id: 1, name: 'Test Product', categoryName: 'Category 1', subcategoryName: 'Subcategory 1', isWishlist: true } },
         1
      );
   });

   test('should return product details successfully with wishlist as false if product is not in wishlist', async () => {
      req.query = { productId: 1, userid: 2 };

      knex.mockReturnValueOnce({
         select: jest.fn().mockReturnThis(),
         leftJoin: jest.fn().mockReturnThis(),
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({
            id: 1,
            name: 'Test Product',
            categoryName: 'Category 1',
            subcategoryName: 'Subcategory 1',
         }),
      });

      knex.mockReturnValueOnce({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null),
      });

      await productController.productDetails(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         { detailsOfProduct: { id: 1, name: 'Test Product', categoryName: 'Category 1', subcategoryName: 'Subcategory 1', isWishlist: false } },
         1
      );
   });

   test('should return internal server error on unexpected error', async () => {
      req.query = { productId: 1 };

      knex.mockReturnValueOnce({
         select: jest.fn().mockReturnThis(),
         leftJoin: jest.fn().mockReturnThis(),
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockRejectedValue(new Error('Internal Server Error')),
      });

      await productController.productDetails(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });
});
