const productController = require('../../admin/controller/productController');
const knex = require('../../db/db');
const logger = require('../../config/winston');
const { sendResponse } = require('../../config/helper');
const constant = require('../../config/constant');
const { productValidator } = require('../../validators/productValidator');

jest.mock('../../validators/productValidator');
jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock('../../config/helper');

describe('updateBanner', () => {
   let req;
   let res;

   beforeEach(() => {
      req = {
         body: {
            id: 1, // banner ID
            title: 'Updated Banner', // updated banner title
         },
         ip: '127.0.0.1',
         headers: {},
         file: {
            key: 'updatedBannerImage.jpg', // Simulate a file upload
         },
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

   test('should successfully update the banner and return the banner ID', async () => {
      // Mock the existing banner in the database
      const bannerMock = {
         id: 1,
         title: 'Old Banner',
         bannerimage: 'oldBannerImage.jpg',
      };
    
      // Mock the request body to include all necessary fields
      req.body = {
         id: 1,
         title: 'Updated Banner', // Assuming 'title' is a required field
         bannername: 'Updated Banner Name', // Ensure bannername is included
      };
    
      // Mock req.file to simulate file upload
      req.file = {
         key: 'newBannerImage.jpg', // Simulate an uploaded file's key
      };
    
      // Properly mock knex to return a query builder
      const mockKnexWhere = jest.fn().mockReturnThis(); // Mock for `where` method
      const mockKnexFirst = jest.fn().mockResolvedValue(bannerMock); // Mock for `first` method
      const mockKnexUpdate = jest.fn().mockResolvedValue(1); // Mock successful update
    
      knex.mockImplementation(() => ({
         where: mockKnexWhere,
         first: mockKnexFirst,
         update: mockKnexUpdate,
      }));
    
      // Mock productValidator to return null (indicating no validation error)
      productValidator.mockResolvedValue(null);
    
      // Mock sendResponse to track the response sent
      sendResponse.mockResolvedValue();
    
      // Call the controller method
      await productController.updateBanner(req, res);
    
      // Verify that the query methods were called with the correct arguments
      expect(mockKnexWhere).toHaveBeenCalledWith({ id: req.body.id });
      expect(mockKnexUpdate).toHaveBeenCalledWith({
         id: 1,
         title: 'Updated Banner',
         bannername: 'Updated Banner Name',
         bannerimage: 'newBannerImage.jpg', // This matches the mocked req.file key
      });
    
      // Check if sendResponse was called with the correct parameters
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         { id: 1 },
         1,
      );
   });    

   test('should return NOT_FOUND if the banner does not exist', async () => {
      // Mock knex to simulate no banner found (returns null)
      knex.mockReturnValueOnce({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null), // Banner not found
      });

      // Call the controller method
      await productController.updateBanner(req, res);

      // Check if sendResponse was called with NOT_FOUND message
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'banner'),
         res,
         constant.CODE.NOT_FOUND,
         {},
         0,
      );
   });

   test('should handle database query failure gracefully', async () => {
      // Mock productValidator to simulate successful validation
      productValidator.mockResolvedValue(null);
    
      // Mock knex to throw an error simulating a database failure
      const dbError = new Error('Database Query Failed');
      const mockKnexWhere = jest.fn().mockImplementation(() => ({
         first: jest.fn().mockRejectedValue(dbError), // Simulates the query failure
      }));
      knex.mockImplementation(() => ({
         where: mockKnexWhere,
      }));
    
      // Call the controller method
      await productController.updateBanner(req, res);
    
      // Check if sendResponse was called with the error message indicating a database failure
      expect(sendResponse).toHaveBeenCalledWith(
         'Database Query Failed', // Error message from the simulated database failure
         res,
         constant.CODE.INTERNAL_SERVER_ERROR, // Status code for internal server error
         {},
         0,
      );
   });        

   test('should handle database query failure gracefully', async () => {
      // Simulate a database query failure by throwing an error during the update process
      knex.mockImplementationOnce(() => {
         // Simulate the failure in the correct database operation
         throw new Error('Database Query Failed');
      });
    
      // Call the controller method
      await productController.updateBanner(req, res);
    
      // Check if sendResponse was called with the error message indicating a database failure
      expect(sendResponse).toHaveBeenCalledWith(
         'Database Query Failed', // Ensure the error message matches
         res,
         constant.CODE.INTERNAL_SERVER_ERROR, // Status code for internal server error
         {},
         0,
      );
   });    

   test('should handle missing id in request body gracefully', async () => {
      // Simulate missing id in the request body
      req.body.id = undefined;
    
      // Mock productValidator to return a validation error
      const validationError = 'The bannername field is mandatory.';
      productValidator.mockResolvedValue(validationError);
    
      // Call the controller method
      await productController.updateBanner(req, res);
    
      // Check if sendResponse was called with the expected validation error message
      expect(sendResponse).toHaveBeenCalledWith(
         validationError,
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0,
      );
    
      // Verify no database queries were made
      expect(knex).not.toHaveBeenCalled();
   });      
});
