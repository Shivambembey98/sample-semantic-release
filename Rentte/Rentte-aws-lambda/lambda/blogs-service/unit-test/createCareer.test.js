const AWS = require('aws-sdk');
const blogController = require('../blog/controller/blogController'); // Adjust path as necessary
const constant = require('../config/constant');
const knex = require('../db/db');
const logger = require("../config/winston");
const { sendResponse } = require('../config/helper');
jest.mock('../db/db');
jest.mock('../config/winston');
jest.mock("../config/helper"); // Mock sendResponse if it's in a separate file

jest.mock('aws-sdk', () => ({
   S3: jest.fn().mockImplementation(() => ({
      upload: jest.fn().mockReturnThis(),
      promise: jest.fn().mockResolvedValue({ Key: 'path/to/uploaded/file' })
   }))
}));

describe("createCareer", () => {
    let req, res;
 
    beforeEach(() => {
       req = {
          user: { id: 1 },
          ip: '127.0.0.1',
          body: {
             title: "Software Engineer",
             content: "<h1>Career Opportunity</h1>",
             jobfield: "Engineering",
             experience: "3-5 years",
          },
          headers: {},
       };
       res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
       };
       knex.mockReset();
       jest.spyOn(logger, 'info').mockImplementation(() => {});
       jest.spyOn(logger, 'error').mockImplementation(() => {});
    });
 
    test('should successfully create a career', async () => {
       knex.mockImplementationOnce(() => ({
          insert: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValue([1]), // Simulate successful insert with ID
       }));
       await blogController.createCareer(req, res);
       expect(sendResponse).toHaveBeenCalledWith(constant.MESSAGE.SUCCESS,
          res, constant.CODE.SUCCESS, { career: 1 }, 1);
    });
    test('should handle S3 upload failure and return INTERNAL_SERVER_ERROR', async () => {
       AWS.S3.mockImplementationOnce(() => ({
          upload: jest.fn().mockReturnThis(),
          promise: jest.fn().mockRejectedValue(new Error('S3 upload error')), // Simulate S3 upload failure
       }));
       await blogController.createCareer(req, res);
       expect(sendResponse).toHaveBeenCalledWith("S3 upload error",
          res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
    });
    test('should handle database insert failure and return INTERNAL_SERVER_ERROR', async () => {
       knex.mockImplementationOnce(() => ({
          insert: jest.fn().mockReturnThis(),
          returning: jest.fn().mockRejectedValue(new Error('Database error')), // Simulate database insert failure
       }));
       await blogController.createCareer(req, res);
       expect(sendResponse).toHaveBeenCalledWith("Database error",
          res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
    });
    test('should return INTERNAL_SERVER_ERROR if general exception occurs', async () => {
       knex.mockImplementationOnce(() => {
          throw new Error('General Error'); // Simulate a general exception
       });
       await blogController.createCareer(req, res);
       expect(sendResponse).toHaveBeenCalledWith("General Error",
          res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
    });
 });