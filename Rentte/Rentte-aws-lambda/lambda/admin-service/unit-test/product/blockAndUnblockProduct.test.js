const productController = require('../../admin/controller/productController');
const knex = require('../../db/db');
const { sendResponse } = require('../../config/helper');
const constant = require('../../config/constant');
const logger = require('../../config/winston');

jest.mock('../../db/db');
jest.mock('../../config/helper', () => ({
   sendResponse: jest.fn(),
   commonLogger: jest.fn()
}));
jest.mock('../../config/winston');

describe('blockAndUnblockProduct', () => {
   let req;
   let res;

   beforeEach(() => {
      req = {
         body: {
            productId: 1,
            isBlock: true
         },
         ip: '127.0.0.1',
         headers: {}
      };

      res = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn()
      };

      // Reset all mocks before each test
      jest.clearAllMocks();
   });

   test('should return not found if product does not exist', async () => {
      // Mock the knex query builder chain
      const mockKnexChain = {
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null)
      };
      
      // Mock the knex function to return the chain
      knex.mockImplementation(() => mockKnexChain);

      await productController.blockAndUnblockProduct(req, res);

      expect(knex).toHaveBeenCalledWith('products'); // Verify table name
      expect(mockKnexChain.where).toHaveBeenCalledWith({ id: 1 }); // Verify where clause
      expect(mockKnexChain.first).toHaveBeenCalled(); // Verify first() was called

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'productId'),
         res,
         constant.CODE.NOT_FOUND,
         {},
         0
      );
   });

   test('should successfully block a product', async () => {
      // Mock for checking if product exists
      const mockFirstChain = {
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 1 })
      };

      // Mock for update operation
      const mockUpdateChain = {
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockResolvedValue(1)
      };

      // Mock knex to return different chains for different calls
      knex.mockImplementationOnce(() => mockFirstChain)
          .mockImplementationOnce(() => mockUpdateChain);

      await productController.blockAndUnblockProduct(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {},
         1
      );
   });

   test('should successfully unblock a product', async () => {
      req.body.isBlock = false;

      // Mock for checking if product exists
      const mockFirstChain = {
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 1 })
      };

      // Mock for update operation
      const mockUpdateChain = {
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockResolvedValue(1)
      };

      knex.mockImplementationOnce(() => mockFirstChain)
          .mockImplementationOnce(() => mockUpdateChain);

      await productController.blockAndUnblockProduct(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {},
         1
      );
   });

   test('should handle database error during update', async () => {
      // Mock for checking if product exists
      const mockFirstChain = {
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 1 })
      };

      // Mock for update operation with error
      const mockUpdateChain = {
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockRejectedValue(new Error('Database error'))
      };

      knex.mockImplementationOnce(() => mockFirstChain)
          .mockImplementationOnce(() => mockUpdateChain);

      await productController.blockAndUnblockProduct(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Database error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });
});

