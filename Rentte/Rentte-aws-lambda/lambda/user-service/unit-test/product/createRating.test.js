const ratingController = require('../../user/controller/ratingController'); // Adjust path as necessary
const constant = require('../../config/constant');
const knex = require('../../db/db');
const logger = require("../../config/winston");
const { inputValidation } = require("../../validators/productValidator")
jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock("../../validators/productValidator");

describe("createRating", () => {
   let req; let res;
   beforeEach(() => {
      req = {
         user: { id: 1 },
         ip: '127.0.0.1',
         body: { productId: 123, rating: 4, comments: "Great product!" },
         headers: {},
      };
      res = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn(),
      };
      knex.mockReset();
      inputValidation.mockReset();
      jest.spyOn(logger, 'info').mockImplementation(() => {});
      jest.spyOn(logger, 'error').mockImplementation(() => {});
   })

   test('should successfully create a rating', async () => {
      inputValidation.mockResolvedValue(null);
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null),
      }));
      knex.mockImplementationOnce(() => ({
         insert: jest.fn().mockReturnThis(),
         returning: jest.fn().mockResolvedValue([1]),
      }));
      await ratingController.createRating(req, res);
      expect(res.status).toHaveBeenCalledWith(constant.CODE.SUCCESS);
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            message: constant.MESSAGE.SUCCESS,
            result: { id: 1 },
         }),
      );
   });

   test('should return ALREADY_EXIST if rating already exists for the product', async () => {
      inputValidation.mockResolvedValue(null);
      knex.mockImplementation(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 1 }),
      }));
      await ratingController.createRating(req, res);
      expect(res.status).toHaveBeenCalledWith(constant.CODE.ALREADY_EXIST);
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            message: constant.MESSAGE.ALREADY_EXIST.replace("{{key}}", "rating"),
         }),
      );
   });
    
   test('should return INPUT_VALIDATION if input validation fails', async () => {
      inputValidation.mockResolvedValue('Validation error');
      await ratingController.createRating(req, res);
      expect(res.status).toHaveBeenCalledWith(constant.CODE.INPUT_VALIDATION);
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            message: 'Validation error',
         }),
      );
   });

   test('should handle exceptions and return INTERNAL_SERVER_ERROR', async () => {
      inputValidation.mockResolvedValue(null);
      knex.mockImplementation(() => {
         throw new Error('Database error');
      });
      await ratingController.createRating(req, res);
      expect(res.status).toHaveBeenCalledWith(constant.CODE.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            message: 'Database error',
         }),
      );
   });

   test('should return INPUT_VALIDATION if productId is missing', async () => {
      req.body = { rating: 4, comments: "Great product!" };
      inputValidation.mockResolvedValue('Validation error');
      await ratingController.createRating(req, res);
      expect(res.status).toHaveBeenCalledWith(constant.CODE.INPUT_VALIDATION);
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            message: 'Validation error',
         }),
      );
   });

   test('should return ALREADY_EXIST if rating already exists for the product', async () => {
      inputValidation.mockResolvedValue(null);
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 1 }),
      }));
      await ratingController.createRating(req, res);
      expect(res.status).toHaveBeenCalledWith(constant.CODE.ALREADY_EXIST);
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            message: constant.MESSAGE.ALREADY_EXIST.replace("{{key}}", "rating"),
         }),
      );
   });

   test('should return INTERNAL_SERVER_ERROR if database insert fails', async () => {
      inputValidation.mockResolvedValue(null);
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null),
      }));
      knex.mockImplementationOnce(() => ({
         insert: jest.fn().mockReturnThis(),
         returning: jest.fn().mockRejectedValue(new Error('Insert error')),
      }));
      await ratingController.createRating(req, res);
      expect(res.status).toHaveBeenCalledWith(constant.CODE.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            message: 'Insert error',
         }),
      );
   });
})
