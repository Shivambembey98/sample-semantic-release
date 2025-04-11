const ratingController = require("../../user/controller/ratingController"); // Adjust path as necessary
const constant = require("../../config/constant");
const knex = require("../../db/db");
const logger = require("../../config/winston");
const { inputValidation } = require("../../validators/productValidator");
const { sendResponse } = require("../../config/helper");

jest.mock("../../db/db");
jest.mock("../../config/winston");
jest.mock("../../validators/productValidator");
jest.mock("../../config/helper");

describe("editRating", () => {
   let req, res;

   beforeEach(() => {
      req = {
         query: { ratingId: 1 },
         ip: "127.0.0.1",
         body: { rating: 5, comments: "Updated review!" },
         headers: {},
      };
      res = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn(),
      };
      knex.mockReset();
      inputValidation.mockReset();
      jest.spyOn(logger, "info").mockImplementation(() => {});
      jest.spyOn(logger, "error").mockImplementation(() => {});
   });

   test("should successfully edit a rating", async () => {
      inputValidation.mockResolvedValue(null); // Simulate no validation errors
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockResolvedValue(1), // Simulate one row updated
      }));

      sendResponse.mockImplementation((message, res, statusCode, data, success) => {
         res.status(statusCode).json({ message, success, result: data });
      });

      await ratingController.editRating(req, res);

      expect(res.status).toHaveBeenCalledWith(constant.CODE.SUCCESS);
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            message: constant.MESSAGE.SUCCESS,
         }),
      );
   });

   test("should return INPUT_VALIDATION if input validation fails", async () => {
      inputValidation.mockResolvedValue("Validation error");

      sendResponse.mockImplementation((message, res, statusCode, data, success) => {
         res.status(statusCode).json({ message, success, result: data });
      });

      await ratingController.editRating(req, res);

      expect(res.status).toHaveBeenCalledWith(constant.CODE.INPUT_VALIDATION);
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            message: "Validation error",
         }),
      );
   });

   test("should return INTERNAL_SERVER_ERROR if database update fails", async () => {
      inputValidation.mockResolvedValue(null);
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockRejectedValue(new Error("Internal Server Error")), // Simulate update failure
      }));

      sendResponse.mockImplementation((message, res, statusCode, data, success) => {
         res.status(statusCode).json({ message, success, result: data });
      });

      await ratingController.editRating(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });

   test("should return INPUT_VALIDATION if ratingId is missing in the query", async () => {
      req.query = {}; // No ratingId provided
      inputValidation.mockResolvedValue("Validation error");

      sendResponse.mockImplementation((message, res, statusCode, data, success) => {
         res.status(statusCode).json({ message, success, result: data });
      });

      await ratingController.editRating(req, res);

      expect(res.status).toHaveBeenCalledWith(constant.CODE.INPUT_VALIDATION);
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            message: "Validation error",
         }),
      );
   });

   test("should handle cases where the update does not affect any rows", async () => {
      inputValidation.mockResolvedValue(null);
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockResolvedValue(0), // No rows affected
      }));

      sendResponse.mockImplementation((message, res, statusCode, data, success) => {
         res.status(statusCode).json({ message, success, result: data });
      });

      await ratingController.editRating(req, res);

      expect(res.status).toHaveBeenCalledWith(constant.CODE.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            message: "No rows affected",
         }),
      );
   });
   
   test("should handle database exceptions and return INTERNAL_SERVER_ERROR", async () => {
      knex.mockImplementationOnce(() => {
         throw new Error("Database error"); // Simulate DB exception
      });

      sendResponse.mockImplementation((message, res, statusCode, data, success) => {
         res.status(statusCode).json({ message, success, result: data });
      });

      await ratingController.editRating(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.INTERNAL_ERROR,
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });
});
