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

describe("createBlog", () => {
    let req; let res;
    beforeEach(() => {
       req = {
          user: { id: 1 },
          ip: '127.0.0.1',
          body: { title: "Test Blog", content: "<h1>Test Content</h1>" },
          files: [{ key: 'image1.jpg' }],
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
 
    test('should successfully create a blog', async () => {
       knex.mockImplementationOnce(() => ({
          insert: jest.fn().mockReturnThis(),
          returning: jest.fn().mockResolvedValue([1]),
       }));
       await blogController.createBlog(req, res);
       expect(sendResponse).toHaveBeenCalledWith(constant.MESSAGE.SUCCESS, 
          res, constant.CODE.SUCCESS, { blog: 1 }, 1);
    });
 
    test('should handle S3 upload failure and return INTERNAL_SERVER_ERROR', async () => {
       AWS.S3.mockImplementationOnce(() => ({
          upload: jest.fn().mockReturnThis(),
          promise: jest.fn().mockRejectedValue(new Error('S3 upload error'))
       }));
       await blogController.createBlog(req, res);
       expect(sendResponse).toHaveBeenCalledWith(constant.MESSAGE.INTERNAL_ERROR,
          res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
    });
 
    test('should handle database insert failure and return INTERNAL_SERVER_ERROR', async () => {
       knex.mockImplementationOnce(() => ({
          insert: jest.fn().mockReturnThis(),
          returning: jest.fn().mockRejectedValue(new Error('Database error')),
       }));
       await blogController.createBlog(req, res);
       expect(sendResponse).toHaveBeenCalledWith(constant.MESSAGE.INTERNAL_ERROR,
          res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
    });
 
    test('should return INTERNAL_SERVER_ERROR if general exception occurs', async () => {
        knex.mockImplementationOnce(() => {
            throw new Error('Internal Server Error');
         });
       await blogController.createBlog(req, res);
       expect(sendResponse).toHaveBeenCalledWith(constant.MESSAGE.INTERNAL_ERROR,
          res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
    });
 });
