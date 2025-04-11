const careerController = require('../blog/controller/blogController'); // Adjust the path as necessary
const constant = require('../config/constant');
const knex = require('../db/db');
const { sendResponse } = require('../config/helper');
jest.mock('../db/db');
jest.mock('../config/helper');

describe("careerDetail", () => {
    let req, res;
 
    beforeEach(() => {
       req = {
          query: { id: 1 }, // Sample career ID
       };
       res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
       };
       knex.mockReset();
    });
 
    test("should successfully retrieve career details", async () => {
       const careerData = {
          id: 1,
          title: "Career Title",
          contenturl: "careers/path/to/content.html",
          jobfield: "Engineering",
          experience: "5 years",
       };
 
       knex.mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(careerData), // Simulate career data fetch
       }));
 
       await careerController.careerDetail(req, res);
 
       expect(knex).toHaveBeenCalledWith("careers");
       expect(sendResponse).toHaveBeenCalledWith(
          constant.MESSAGE.SUCCESS,
          res,
          constant.CODE.SUCCESS,
          { career: careerData },
          1
       );
    });
 
    test("should return an empty response when career is not found", async () => {
       knex.mockImplementationOnce(() => ({
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(null), // Simulate no data found
       }));
 
       await careerController.careerDetail(req, res);
 
       expect(knex).toHaveBeenCalledWith("careers");
       expect(sendResponse).toHaveBeenCalledWith(
          constant.MESSAGE.SUCCESS,
          res,
          constant.CODE.SUCCESS,
          { career: null },
          1
       );
    });
 
    test("should handle errors and return INTERNAL_SERVER_ERROR", async () => {
       knex.mockImplementationOnce(() => {
          throw new Error("Internal Server Error");
       });
       await careerController.careerDetail(req, res);
       expect(sendResponse).toHaveBeenCalledWith(
          constant.MESSAGE.INTERNAL_ERROR,
          res,
          constant.CODE.INTERNAL_SERVER_ERROR,
          {},
          0
       );
    });
 });