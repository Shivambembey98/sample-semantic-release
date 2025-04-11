const ratingController = require('../../user/controller/ratingController'); // Adjust path as necessary
const constant = require('../../config/constant');
const knex = require('../../db/db');
const logger = require("../../config/winston");
const { sendResponse } = require('../../config/helper');

jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock("../../config/helper");

describe("ratingList", () => {
   let req, res;

   beforeEach(() => {
      req = {
         ip: '127.0.0.1',
         query: {},
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

   test('should return validation error if productId is not provided', async () => {
      req.query = { userId: 1 };

      await ratingController.ratingList(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         "Product id is required",
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0
      );
   });

   test('should return INTERNAL_SERVER_ERROR if database query fails', async () => {
      req.query = { productId: 123, userId: 1, page: 1 };

      knex.mockImplementationOnce(() => {
         throw new Error('Internal Server Error');
      });

      await ratingController.ratingList(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });

   test('should return INTERNAL_SERVER_ERROR if error occurs while counting ratings', async () => {
      req.query = { productId: 123, userId: 1, page: 1 };

      knex.mockImplementationOnce(() => ({
         select: jest.fn().mockReturnThis(),
         where: jest.fn().mockReturnThis(),
         leftJoin: jest.fn().mockReturnThis(),
         limit: jest.fn().mockReturnThis(),
         orderBy: jest.fn().mockReturnThis(),
         offset: jest.fn().mockResolvedValue([]),
      }));

      knex.mockImplementationOnce(() => {
         throw new Error('Internal Server Error');
      });

      await ratingController.ratingList(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });
});
