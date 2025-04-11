const blogController = require('../blog/controller/blogController'); // Adjust path as necessary
const constant = require('../config/constant');
const knex = require('../db/db');
const logger = require("../config/winston");
const { sendResponse } = require('../config/helper');
jest.mock('../db/db');
jest.mock('../config/winston');
jest.mock("../config/helper"); // Mock sendResponse if it's in a separate file

describe("deleteBlog", () => {
   let req; let res;
   
   beforeEach(() => {
      req = {
         user: { id: 1 },
         ip: '127.0.0.1',
         body: { id: 1 }, // Blog ID to delete
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

   test('should return NOT_FOUND if blog does not exist', async () => {
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null), // Simulate blog not found
      }));

      await blogController.deleteBlog(req, res);
      expect(sendResponse).toHaveBeenCalledWith("Blog not found",
         res, constant.CODE.NOT_FOUND, {}, 0);
   });

   test('should handle database failure and return INTERNAL_SERVER_ERROR', async () => {
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 1, title: 'Test Blog' }),
         update: jest.fn().mockRejectedValue(new Error('Internal Server Error')),
      }));
      await blogController.deleteBlog(req, res);
      expect(sendResponse).toHaveBeenCalledWith(constant.MESSAGE.INTERNAL_ERROR,
         res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
   });

   test('should return INTERNAL_SERVER_ERROR if general exception occurs', async () => {
      knex.mockImplementationOnce(() => {
         throw new Error('Internal Server Error');
      });
      await blogController.deleteBlog(req, res);
      expect(sendResponse).toHaveBeenCalledWith(constant.MESSAGE.INTERNAL_ERROR,
         res, constant.CODE.INTERNAL_SERVER_ERROR, {}, 0);
   });
});
