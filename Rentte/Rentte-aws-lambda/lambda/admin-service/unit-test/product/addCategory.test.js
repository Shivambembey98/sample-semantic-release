const categoryController = require('../../admin/controller/productController');
const knex = require('../../db/db');
const constant = require('../../config/constant');
const logger = require('../../config/winston');
const { sendResponse } = require('../../config/helper');
const { productValidator } = require('../../validators/productValidator');

jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock('../../config/helper');
jest.mock('../../validators/productValidator');

describe('addCategory', () => {
   let req;
   let res;

   beforeEach(() => {
      req = {
         body: {
            categoryName: 'TestCategory',
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
      productValidator.mockReset();
   });

   test('should return INPUT_VALIDATION if validation fails', async () => {
      productValidator.mockResolvedValue('Validation Error');

      await categoryController.addCategory(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Validation Error',
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0,
      );
   });

   test('should return ALREADY_EXIST if category already exists', async () => {
      productValidator.mockResolvedValue(null); // No validation error
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ categoryName: 'testcategory' }), // Category exists
      }));

      await categoryController.addCategory(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.ALREADY_EXIST.replace('{{key}}', 'category'),
         res,
         constant.CODE.ALREADY_EXIST,
         {},
         0,
      );
   });

   test('should successfully add a category', async () => {
      productValidator.mockResolvedValue(null); // No validation error
    
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null), // No existing category
      }));
    
      knex.mockImplementationOnce(() => ({
         insert: jest.fn().mockReturnThis(), // Mock insert chaining
         returning: jest.fn().mockResolvedValue([1]), // Successfully inserted category
      }));
    
      await categoryController.addCategory(req, res);
    
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         { id: 1 },
         1,
      );
   });    

   test('should handle database insertion failure gracefully', async () => {
      productValidator.mockResolvedValue(null); // No validation error
    
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null), // No existing category
      }));
    
      knex.mockImplementationOnce(() => ({
         insert: jest.fn().mockImplementation(() => {
            throw new Error('Database Error'); // Simulate database error
         }),
      }));
    
      await categoryController.addCategory(req, res);
    
      expect(sendResponse).toHaveBeenCalledWith(
         'Database Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0,
      );
   });     

   test('should handle unexpected errors gracefully', async () => {
      productValidator.mockResolvedValue(null); // No validation error
      knex.mockImplementationOnce(() => {
         throw new Error('Unexpected Error');
      });

      await categoryController.addCategory(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Unexpected Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0,
      );
   });
});
