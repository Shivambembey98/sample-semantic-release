const productController = require('../admin/controller/productController');
const knex = require('../db/db');
const constant = require('../config/constant');
const logger = require('../config/winston');
const { sendResponse } = require('../config/helper');
const { productValidator } = require('../validators/productValidator');

jest.mock('../db/db');
jest.mock('../config/winston');
jest.mock('../config/helper');
jest.mock('../validators/productValidator');

describe('postBanner', () => {
   let req;
   let res;

   beforeEach(() => {
      req = {
         body: {
            title: 'New Banner',
            description: 'Banner description',
         },
         file: {
            key: 'banner-image-key',
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
      const mockValidationError = 'Validation Error';
      productValidator.mockResolvedValue(mockValidationError);

      await productController.postBanner(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         mockValidationError,
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0,
      );
   });

   test('should successfully post a banner and return its ID', async () => {
      productValidator.mockResolvedValueOnce(null); // No validation error
        
      // Mock knex insert with chainable methods
      knex.mockImplementationOnce(() => ({
         insert: jest.fn().mockReturnThis(), // return the knex object itself for chaining
         returning: jest.fn().mockResolvedValueOnce([{ id: 1 }]), // mock returning to return the ID
      }));
        
      await productController.postBanner(req, res);
        
      // Check if validation and knex were called correctly
      expect(productValidator).toHaveBeenCalledWith(req.body, 'bannerUpload');
      expect(knex).toHaveBeenCalledWith('banner');
        
      // Adjusted to expect the nested `id` format
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         { id: { id: 1 } }, // Expecting nested id
         1,
      );
   });

   test('should handle database insertion failure gracefully', async () => {
      productValidator.mockResolvedValueOnce(null); // No validation error

      knex.mockImplementationOnce(() => ({
         insert: jest.fn().mockImplementation(() => {
            throw new Error('Database Error'); // Simulate database error
         }),
      }));

      await productController.postBanner(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Database Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0,
      );
   });

   test('should handle unexpected errors gracefully', async () => {
      productValidator.mockResolvedValueOnce(null); // No validation error

      knex.mockImplementationOnce(() => {
         throw new Error('Unexpected Error');
      });

      await productController.postBanner(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Unexpected Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0,
      );
   });

   test('should handle missing file upload error gracefully', async () => {
      req.file = undefined; // Simulate missing file

      await productController.postBanner(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         expect.any(String), // Error message
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0,
      );
   });
});
