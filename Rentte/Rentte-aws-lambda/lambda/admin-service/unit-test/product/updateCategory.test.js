const categoryController = require('../../admin/controller/productController');
const { productValidator } = require('../../validators/productValidator');
const knex = require('../../db/db');
const { sendResponse } = require('../../config/helper');
const constant = require('../../config/constant');
const logger = require('../../config/winston');

jest.mock('../../db/db');
jest.mock('../../validators/productValidator');
jest.mock('../../config/helper', () => ({
   sendResponse: jest.fn(),
   commonLogger: jest.fn()
}));
jest.mock('../../config/winston');

describe('updateCategory', () => {
   let req;
   let res;

   beforeEach(() => {
      req = {
         body: {
            id: 1,
            categoryName: 'Updated Category',
            description: 'Updated Description',
            isDelete: false
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
      knex.mockReset();
      productValidator.mockReset();
      sendResponse.mockReset();
   });

   test('should return validation error if validation fails', async () => {
      productValidator.mockResolvedValue('Validation Error');

      await categoryController.updateCategory(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Validation Error',
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0
      );
   });

   test('should return not found if category does not exist', async () => {
      productValidator.mockResolvedValue(null);
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null)
      }));

      await categoryController.updateCategory(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'category'),
         res,
         constant.CODE.NOT_FOUND,
         {},
         0
      );
   });

   test('should successfully update category', async () => {
      productValidator.mockResolvedValue(null);
      
      // Mock for checking if category exists
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 1 })
      }));

      // Mock for update operation
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockResolvedValue(1)
      }));

      await categoryController.updateCategory(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {},
         1
      );
   });

   test('should handle database error during update', async () => {
      productValidator.mockResolvedValue(null);
      
      // Mock for checking if category exists
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 1 })
      }));

      // Mock database error during update
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockImplementation(() => {
            throw new Error('Database error');
         })
      }));

      await categoryController.updateCategory(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Database error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });

   test('should handle missing required fields', async () => {
      req.body = { id: 1 }; // Missing categoryName and description
      productValidator.mockResolvedValue('Required fields missing');

      await categoryController.updateCategory(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Required fields missing',
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0
      );
   });
});
