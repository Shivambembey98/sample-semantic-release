const productController = require('../../user/controller/productController');
const constant = require('../../config/constant');
const knex = require('../../db/db');
const { sendResponse } = require("../../config/helper");
const logger = require('../../config/winston');

jest.mock('../../db/db');
jest.mock("../../config/helper");
jest.mock('../../config/winston');

describe("partnerHistoryList", () => {
  let req;
  let res;

  beforeEach(() => {
    req = {
      user: { id: 1 },  // Mock user with an ID
      query: { page: 1, limit: 10 },  // Mock query parameters
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

  test('should return INTERNAL_SERVER_ERROR if database query fails', async () => {
    knex.mockImplementationOnce(() => {
      throw new Error('Internal Server Error');
    });

    await productController.partnerHistoryList(req, res);

    expect(sendResponse).toHaveBeenCalledWith(
      'Internal Server Error',
      res,
      constant.CODE.INTERNAL_SERVER_ERROR,
      {},
      0
    );
  });

  test('should return INTERNAL_SERVER_ERROR if counting records fails', async () => {
    // Mock the knex behavior for the select query (partnerRentalHistory select query)
    knex.mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValue([]),  // Mock the result of the select query
        leftJoin: jest.fn().mockReturnThis(),     // Mock the leftJoin method for chaining
        where: jest.fn().mockReturnThis(),        // Mock the where method for chaining
        limit: jest.fn().mockReturnThis(),        // Mock the limit method for chaining
        offset: jest.fn().mockReturnThis(),       // Mock the offset method for chaining
    }));

    // Mock the knex behavior for the count query (partnerRentalHistory count query)
    knex.mockImplementationOnce(() => ({
        count: jest.fn().mockImplementation(() => {
            throw new Error('Internal Server Error'); // Simulate an error during the count query
        }),
        where: jest.fn().mockReturnThis(),  // Mock the where method for chaining
    }));

    // Call the controller method
    await productController.partnerHistoryList(req, res);

    // Assert that the error response is returned as expected
    expect(sendResponse).toHaveBeenCalledWith(
        'Internal Server Error', // The error message passed from the catch block
        res,
        constant.CODE.INTERNAL_SERVER_ERROR,
        {}, // Empty response data
        0 // Response code: 0 (indicating failure)
    );
});

  test('should return BAD_REQUEST if no user id is provided', async () => {
    req.user = {}; // Missing user ID
 
    await productController.partnerHistoryList(req, res);
 
    expect(sendResponse).toHaveBeenCalledWith(
       'User ID is required',
       res,
       constant.CODE.BAD_REQUEST,
       {},
       0
    );
 }); 
});
