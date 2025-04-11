const categoryController = require('../admin/controller/productController');
const knex = require('../db/db');
const constant = require('../config/constant');
const logger = require('../config/winston');
const { sendResponse } = require('../config/helper');
const { productValidator } = require('../validators/productValidator');

jest.mock('../db/db');
jest.mock('../config/winston');
jest.mock('../config/helper');
jest.mock('../validators/productValidator');

describe('updateSubCategory', () => {
   let req;
   let res;

   beforeEach(() => {
      req = {
         body: {
            id: 1,
            subCategoryName: 'UpdatedSubCategory',
         },
         file: {
            key: 'updated-image-key',
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

      await categoryController.updateSubCategory(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Validation Error',
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0,
      );
   });

   test('should return NOT_FOUND if subcategory does not exist', async () => {
      productValidator.mockResolvedValue(null); // No validation error
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null), // Subcategory not found
      }));

      await categoryController.updateSubCategory(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'subcategory'),
         res,
         constant.CODE.NOT_FOUND,
         {},
         0,
      );
   });

   test('should successfully update a subcategory', async () => {
      productValidator.mockResolvedValue(null); // No validation error
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 1, subCategoryName: 'ExistingSubCategory' }), // Subcategory found
      }));
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockResolvedValue(1), // Successful update
      }));

      await categoryController.updateSubCategory(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {},
         1,
      );
   });

   test('should handle database update failure gracefully', async () => {
      productValidator.mockResolvedValue(null); // No validation error
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 1, subCategoryName: 'ExistingSubCategory' }), // Subcategory found
      }));
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockImplementation(() => {
            throw new Error('Database Error'); // Simulate database error
         }),
      }));

      await categoryController.updateSubCategory(req, res);

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
         throw new Error('Unexpected Error'); // Simulate unexpected error
      });

      await categoryController.updateSubCategory(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Unexpected Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0,
      );
   });
});
