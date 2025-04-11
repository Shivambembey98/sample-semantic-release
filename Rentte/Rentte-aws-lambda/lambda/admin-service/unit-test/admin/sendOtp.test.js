const authController = require('../../admin/controller/authController'); // Adjust path as necessary
const constant = require('../../config/constant');
const knex = require('../../db/db');
const logger = require("../../config/winston");
const { sendResponse } = require("../../config/helper");
const { adminInputValidation } = require("../../validators/adminValidator");
const AWS = require('aws-sdk'); // Assuming SNS is from aws-sdk

jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock("../../validators/adminValidator");
jest.mock('aws-sdk', () => {
   const SNS = jest.fn().mockImplementation(() => ({
      publish: jest.fn().mockReturnValue({
         promise: jest.fn().mockResolvedValue({}), // Mock the promise method
      }),
   }));
   return {
      SNS,
      config: {
         update: jest.fn(), // Mock config.update to prevent errors
      },
   };
}); 

describe("sendOtp", () => {
   let req; let res; let snsMock;

   beforeEach(() => {
      req = {
         ip: '127.0.0.1',
         body: { countryCode: "+1", mobile: "1234567890" },
         headers: {},
      };
      res = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn(),
      };
      knex.mockReset();
      adminInputValidation.mockReset();
      jest.spyOn(logger, 'info').mockImplementation(() => {});
      jest.spyOn(logger, 'error').mockImplementation(() => {});

      snsMock = new AWS.SNS(); // Initialize SNS mock
   });

   test('should return INPUT_VALIDATION if input validation fails', async () => {
      adminInputValidation.mockResolvedValue('Validation error');
      
      await authController.sendOtp(req, res);
      
      expect(res.status).toHaveBeenCalledWith(constant.CODE.INPUT_VALIDATION); 
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            message: "Validation error", // Error message from validation
         }),
      );
   });

   test('should handle database insertion error and return INTERNAL_SERVER_ERROR', async () => {
      adminInputValidation.mockResolvedValue(null);
      knex.mockImplementationOnce(() => {
         throw new Error('Database insertion error');
      });

      await authController.sendOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(constant.CODE.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            message: 'Database insertion error',
         }),
      );
   });
   
   test('should handle unexpected exceptions and return INTERNAL_SERVER_ERROR', async () => {
      adminInputValidation.mockResolvedValue(null);    
      knex.mockImplementationOnce(() => {
         return {
            insert: jest.fn().mockReturnValue({
               returning: jest.fn().mockRejectedValue(new Error('Unexpected error')),
            }),
         };
      });

      snsMock.publish.mockResolvedValueOnce({}); // Simulate successful SNS publish

      await authController.sendOtp(req, res);

      expect(res.status).toHaveBeenCalledWith(constant.CODE.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            message: 'Unexpected error', // Check for the error message
         }),
      );
   });
});
