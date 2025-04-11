const ratingController = require('../../user/controller/ratingController'); // Adjust path as necessary
const constant = require('../../config/constant');
const knex = require('../../db/db');
const logger = require('../../config/winston');
const { sendResponse } = require('../../config/helper');

jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock('../../config/helper');

describe("deleteRating", () => {
   let req, res;

   beforeEach(() => {
      req = {
         user: { id: 1 },
         ip: '127.0.0.1',
         query: { ratingId: 123 },
         body: {},
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

   test('should return INPUT_VALIDATION if ratingId is missing', async () => {
      req.query = {}; // Simulate missing ratingId
      sendResponse.mockImplementation((message, res, statusCode, data, success) => {
         res.status(statusCode).json({ message, success, result: data });
      });

      await ratingController.deleteRating(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         "rating id is not found",
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0
      );
   });

   test('should return NOT_FOUND if rating does not exist', async () => {
      knex.mockImplementation(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null), // Mock no rating found
      }));

      sendResponse.mockImplementation((message, res, statusCode, data, success) => {
         res.status(statusCode).json({ message, success, result: data });
      });

      await ratingController.deleteRating(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.NOT_FOUND.replace("{{key}}", "rating"),
         res,
         constant.CODE.NOT_FOUND,
         {},
         0
      );
   });

   test('should successfully delete a rating', async () => {
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 123, isdelete: false }), // Mock rating found
      }));
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockResolvedValue(1), // Mock successful deletion
      }));

      sendResponse.mockImplementation((message, res, statusCode, data, success) => {
         res.status(statusCode).json({ message, success, result: data });
      });

      await ratingController.deleteRating(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {},
         1
      );
   });

   test('should return INTERNAL_SERVER_ERROR on database failure', async () => {
      knex.mockImplementationOnce(() => {
         throw new Error('Internal Server Error'); // Simulate DB failure
      });

      sendResponse.mockImplementation((message, res, statusCode, data, success) => {
         res.status(statusCode).json({ message, success, result: data });
      });

      await ratingController.deleteRating(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });
});
