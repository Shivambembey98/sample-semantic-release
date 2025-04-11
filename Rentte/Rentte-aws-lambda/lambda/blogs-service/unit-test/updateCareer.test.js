const AWS = require('aws-sdk');
const careerController = require('../blog/controller/blogController'); // Adjust path as necessary
const constant = require('../config/constant');
const knex = require('../db/db');
const { sendResponse } = require('../config/helper');
jest.mock('../db/db');
jest.mock('../config/helper');

jest.mock('aws-sdk', () => ({
   S3: jest.fn().mockImplementation(() => ({
      upload: jest.fn().mockReturnThis(),
      promise: jest.fn().mockResolvedValue({ Key: 'careers/path/to/updated/file.html' }),
      deleteObject: jest.fn().mockReturnThis(),
      promise: jest.fn().mockResolvedValue({}),
   })),
}));

describe("updateCareer", () => {
   let req, res;

   beforeEach(() => {
      req = {
         body: {
            id: 1,
            title: "Updated Career Title",
            content: "<h1>Updated Career Content</h1>",
         },
         ip: '127.0.0.1',
      };
      res = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn(),
      };
      knex.mockReset();
      jest.spyOn(console, 'log').mockImplementation(() => {});
   });

   test("should return NOT_FOUND if the career does not exist", async () => {
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null), // Simulate no existing career found
      }));

      await careerController.updateCareer(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         "Career not found",
         res,
         constant.CODE.NOT_FOUND,
         {},
         0
      );
   });

   test("should handle S3 upload failure and return INTERNAL_SERVER_ERROR", async () => {
      const existingCareer = {
         id: 1,
         title: "Old Career Title",
         contenturl: "careers/path/to/old/file.html",
      };

      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(existingCareer),
      }));

      AWS.S3.mockImplementationOnce(() => ({
         upload: jest.fn().mockReturnThis(),
         promise: jest.fn().mockRejectedValue(new Error("S3 upload error")), // Simulate S3 upload failure
      }));

      await careerController.updateCareer(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         "S3 upload error",
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });

   test("should handle general exception and return INTERNAL_SERVER_ERROR", async () => {
      knex.mockImplementationOnce(() => {
         throw new Error("General error"); // Simulate a general exception
      });
      await careerController.updateCareer(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         "General error",
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });
});
