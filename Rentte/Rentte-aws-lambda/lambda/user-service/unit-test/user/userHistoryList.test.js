const productController = require('../../user/controller/productController');
const constant = require('../../config/constant');
const knex = require('../../db/db');
const logger = require("../../config/winston");
const { sendResponse } = require("../../config/helper");

jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock("../../config/helper");

describe("userHistoryList", () => {
   let req; 
   let res;

   beforeEach(() => {
      req = {
         user: { id: 1 }, // User ID for fetching history
         query: { page: 1, limit: 10 }, // Default pagination query params
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

   test('should return INTERNAL_SERVER_ERROR if an error occurs while fetching history', async () => {
      knex.mockImplementationOnce(() => {
         throw new Error('Internal Server Error');
      });

      await productController.userHistoryList(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         'Internal Server Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });

   test('should return INPUT_VALIDATION if page or limit are invalid', async () => {
      req.query = { page: 'invalid', limit: 10 }; // Invalid page
      await productController.userHistoryList(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         'Invalid query parameters',
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0
      );
   });

   test('should return INTERNAL_SERVER_ERROR if knex count query fails', async () => {
      knex.mockImplementationOnce(() => ({
         select: jest.fn().mockResolvedValue([{
            product: { description: 'Product 1', categoryId: 1, availabilityStatus: 'Available' },
            partnerRentalHistory: { id: 1, productid: 1, userid: 1 }
         }]),
         leftJoin: jest.fn().mockReturnThis(),
         where: jest.fn().mockReturnThis(),
         limit: jest.fn().mockReturnThis(),
         offset: jest.fn().mockReturnThis(),
      }));
      knex.mockImplementationOnce(() => ({
         count: jest.fn().mockRejectedValue(new Error('Internal Server Error')),
      }));

      await productController.userHistoryList(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         'Internal Server Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });
});
