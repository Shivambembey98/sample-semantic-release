const categoryController = require('../../admin/controller/productController');
const knex = require('../../db/db');
const constant = require('../../config/constant');
const logger = require('../../config/winston');
const { sendResponse } = require('../../config/helper');
const { productValidator } = require('../../validators/productValidator');

jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock('../../config/helper');
jest.mock('../../validators/productValidator');

describe('deleteBanner', () => {
   let req;
   let res;

   beforeEach(() => {
      req = {
         body: {
            id: 1,
         },
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
      productValidator.mockReset();
   });

   test('should return INPUT_VALIDATION if id is missing', async () => {
      req.body.id = undefined;

      await categoryController.deleteBanner(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'The id field is mandatory.',
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0,
      );
   });

   test('should return NOT_FOUND if banner does not exist', async () => {
      productValidator.mockResolvedValue(null); // No validation error
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null), // No banner found
      }));

      await categoryController.deleteBanner(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'banner'),
         res,
         constant.CODE.NOT_FOUND,
         {},
         0,
      );
   });

   test('should successfully delete a banner', async () => {
      productValidator.mockResolvedValue(null); // No validation error

      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 1, bannername: 'testBanner' }), // Banner exists
      }));

      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockResolvedValue(1), // Successfully updated (marked as deleted)
      }));

      await categoryController.deleteBanner(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         { id: 1 },
         1,
      );
   });

   test('should handle unexpected errors gracefully', async () => {
      productValidator.mockResolvedValue(null); // No validation error
      knex.mockImplementationOnce(() => {
         throw new Error('Unexpected Error');
      });

      await categoryController.deleteBanner(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Unexpected Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0,
      );
   });
});
