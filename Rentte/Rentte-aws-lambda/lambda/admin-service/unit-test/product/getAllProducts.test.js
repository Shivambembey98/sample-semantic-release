const productController = require('../../admin/controller/productController');
const knex = require('../../db/db');
const constant = require('../../config/constant');
const logger = require('../../config/winston');
const { sendResponse } = require('../../config/helper');

jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock('../../config/helper');

describe('getAllProducts', () => {
   let req;
   let res;

   beforeEach(() => {
      req = {
         query: {
            page: '1',
            limit: '10',
         },
         ip: '127.0.0.1',
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

   test('should return all products with pagination', async () => {
      const mockProducts = [
         {
            id: 1,
            productname: 'Product 1',
            brandname: 'Brand A',
            description: 'Description A',
            productImages: 'image1.jpg',
            amount: 5,
            unitprice: 100,
            rentalType: 'daily',
            rentalperiod: '7 days',
            quantity: 10,
            price: 500,
            created_at: '2023-01-01',
            category: {
               id: 1,
               name: 'Category A',
               description: 'Category A Description',
            },
            subcategory: {
               id: 1,
               name: 'Subcategory A',
               description: 'Subcategory A Description',
            },
         },
      ];

      const mockCount = [{ count: '1' }];

      knex.mockImplementationOnce(() => ({
         select: jest.fn().mockReturnThis(),
         leftJoin: jest.fn().mockReturnThis(),
         where: jest.fn().mockReturnThis(),
         limit: jest.fn().mockReturnThis(),
         offset: jest.fn().mockResolvedValue(mockProducts),
      }));

      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         count: jest.fn().mockResolvedValue(mockCount),
      }));

      await productController.getAllProducts(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {
            products: mockProducts,
            pagination: {
               page: 1,
               limit: 10,
               totalCount: "1",
               totalPages: 1,
            },
         },
         1,
      );
   });

   test('should handle unexpected errors gracefully', async () => {
      knex.mockImplementationOnce(() => {
         throw new Error('Unexpected Error');
      });

      await productController.getAllProducts(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Unexpected Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0,
      );
   });
});
