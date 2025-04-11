const productController = require('../../user/controller/authController'); // Adjust path as necessary
const constant = require('../../config/constant');
const knex = require('../../db/db');
const jwt = require("jsonwebtoken");
const { sendResponse } = require("../../config/helper"); // Assuming sendResponse is imported from helpers
const { inputValidation } = require("../../validators/productValidator");
const { sendMail } = require("../../helper/mail");
const logger = require('../../config/winston');
jest.mock('../../db/db');
jest.mock('../../helper/mail');
jest.mock("../../validators/productValidator");
jest.mock("../../config/helper"); // Mock sendResponse if it's in a separate file
jest.mock("jsonwebtoken");
jest.mock('../../config/winston');

describe("forgotPassword", () => {
   let req; 
   let res;

   beforeEach(() => {
      req = {
         body: { email: "user@example.com" },
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

   test('should successfully send a reset password email', async () => {
      // Mocking successful input validation
      inputValidation.mockResolvedValue(null);
      
      // Mocking database query
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({
            id: 1,
            firstName: "John",
            lastName: "Doe",
            email: "user@example.com"
         }),
      }));
      
      // Mocking JWT token generation
      jwt.sign.mockReturnValue("mock-jwt-token");

      // Mocking sendMail to simulate email sending success
      sendMail.mockResolvedValue(true);

      // Call the API
      await productController.forgotPassword(req, res);

      // Assert that sendResponse was called with the expected success message
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.EMAIL_SEND,
         res,
         constant.CODE.SUCCESS,
         {},
         1
      );
   });

   test('should return INPUT_VALIDATION error if validation fails', async () => {
      const input = { invalid: true }; // Simulate invalid input
   
      // Mock the validation to return an error message
      inputValidation.mockResolvedValue('The email field is mandatory.');
   
      // Run the function with invalid input
      await productController.forgotPassword(input, res);
   
      // Assert sendResponse was called with the correct validation error
      expect(sendResponse).toHaveBeenCalledWith(
         'The email field is mandatory.',  // The message from the validation
         res,  // The response object
         constant.CODE.INPUT_VALIDATION,  // The status code for input validation
         {},  // The empty result object
         0    // Success flag set to 0 for validation errors
      );
   });
   
 
 
   test('should return EMAIL_NOT_REGISTERED if email is not in the database', async () => {
      // Mocking successful input validation
      inputValidation.mockResolvedValue(null);
   
      // Mocking database query where no user is found (userData is null)
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null), // Simulating no user found
      }));
   
      // Call the forgotPassword controller
      await productController.forgotPassword(req, res);
   
      // Assert that the email is not registered response is returned
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.EMAIL_NOT_REGISTERED,   // Expected message
         res,                                    // Response object
         constant.CODE.SUCCESS,                  // Status code (200)
         {},                                     // Empty object as response body
         constant.CODE.NOT_EXIST                 // Error code (constant for not found)
      );
   });   

   test('should return INTERNAL_SERVER_ERROR if jwt fails', async () => {
      inputValidation.mockResolvedValue(null);
      
      // Mocking database query
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({
            id: 1,
            firstName: "John",
            lastName: "Doe",
            email: "user@example.com"
         }),
      }));

      // Simulating JWT error
      jwt.sign.mockImplementationOnce(() => {
         throw new Error("Internal Server Error");
      });

      await productController.forgotPassword(req, res);

      // Assert that INTERNAL_SERVER_ERROR is returned when JWT fails
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });

   test('should return INTERNAL_SERVER_ERROR if sending email fails', async () => {
      inputValidation.mockResolvedValue(null);
      
      // Mocking database query
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({
            id: 1,
            firstName: "John",
            lastName: "Doe",
            email: "user@example.com"
         }),
      }));

      jwt.sign.mockReturnValue("mock-jwt-token");

      sendMail.mockRejectedValue(new Error("Internal Server Error"));

      await productController.forgotPassword(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         'Internal Server Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });

   test('should return INPUT_VALIDATION if email is missing in request', async () => {
    req.body = {};  // No email provided
    inputValidation.mockResolvedValue('The email field is mandatory.');  // Update the validation message
 
    await productController.forgotPassword(req, res);
 
    expect(sendResponse).toHaveBeenCalledWith(
       'The email field is mandatory.', // Updated expected error message
       res,
       constant.CODE.INPUT_VALIDATION,
       {},
       0
    );
 }); 
});
