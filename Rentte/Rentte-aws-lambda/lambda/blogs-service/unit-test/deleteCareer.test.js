const careerController = require('../blog/controller/blogController'); // Adjust the path as necessary
const constant = require('../config/constant');
const knex = require('../db/db');
const { sendResponse } = require('../config/helper');
jest.mock('../db/db');
jest.mock('../config/helper');

describe("deleteCareer", () => {
   let req, res;

   beforeEach(() => {
      req = {
         body: { id: 1 }, // Career ID to delete
      };
      res = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn(),
      };
      knex.mockReset();
   });

   test("should successfully delete a career", async () => {
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 1, title: "Career Title" }), // Simulate career found
      }));
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockResolvedValue(1), // Simulate update success
      }));
      await careerController.deleteCareer(req, res);
      expect(knex).toHaveBeenCalledWith("careers");
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {},
         1
      );
   });

   test("should return NOT_FOUND if career does not exist", async () => {
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null), // Simulate career not found
      }));

      await careerController.deleteCareer(req, res);

      expect(knex).toHaveBeenCalledWith("careers");
      expect(sendResponse).toHaveBeenCalledWith(
         "Career not found",
         res,
         constant.CODE.NOT_FOUND,
         {},
         0
      );
   });

   test("should handle errors during database operations and return INTERNAL_SERVER_ERROR", async () => {
      knex.mockImplementationOnce(() => {
         throw new Error("Internal Server Error");
      });
      await careerController.deleteCareer(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });
});
