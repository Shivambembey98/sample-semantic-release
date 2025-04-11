const categoryController = require('../../admin/controller/productController');
const knex = require('../../db/db');
const logger = require('../../config/winston');
const { sendResponse } = require('../../config/helper');
const constant = require('../../config/constant');

jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock('../../config/helper');

describe('deleteCategory', () => {
   let req;
   let res;

   beforeEach(() => {
      req = {
         body: {
            id: 1, // Default category ID for tests
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

   test('should successfully delete category', async () => {
      const categoryMock = { id: 1, categoryName: 'category1', description: 'desc1', isDelete: false };

      // Mock knex to simulate finding the category
      knex.mockReturnValueOnce({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(categoryMock), // Simulate category found
      });

      // Mock knex to simulate updating the category
      knex.mockReturnValueOnce({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockResolvedValue(1), // Simulate successful update
      });

      await categoryController.deleteCategory(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {},
         1,
      );
      expect(knex).toHaveBeenCalledWith('category');
      expect(knex.mock.calls[0][0]).toBe('category');
      expect(knex.mock.calls[1][0]).toBe('category');
   });

   test('should handle category not found error', async () => {
      // Mock knex to simulate category not found
      knex.mockReturnValueOnce({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null), // Simulate category not found
      });

      await categoryController.deleteCategory(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.NOT_FOUND.replace("{{key}}", "category"),
         res,
         constant.CODE.NOT_FOUND,
         {},
         0,
      );
   });

   test('should handle validation error for missing category ID', async () => {
      req.body.id = undefined; // Simulate missing ID
    
      // The validation error message returned by the controller
      const validationErrorMock = 'The id field is mandatory.';
        
      // Mock the sendResponse to simulate validation failure
      sendResponse.mockImplementationOnce((message, res, code, data, count) => {
         return res.status(code).json({ message, data, count });
      });
    
      // Simulate the validation error
      const requestValidation = { message: validationErrorMock };
    
      // Call the deleteCategory method
      await categoryController.deleteCategory(req, res);
    
      // Verify the response is sent with the correct validation error
      expect(sendResponse).toHaveBeenCalledWith(
         validationErrorMock, // Updated error message
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0,
      );
   });    

   test('should handle database error gracefully', async () => {
      // Simulate a database error
      knex.mockImplementationOnce(() => {
         throw new Error('Database Query Failed');
      });

      await categoryController.deleteCategory(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Database Query Failed',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0,
      );
   });
});
