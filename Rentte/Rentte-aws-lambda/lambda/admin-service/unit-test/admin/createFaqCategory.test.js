const knex = require('../../db/db');
const constant = require('../../config/constant');
const { sendResponse } = require('../../config/helper');
const createFaqCategoryController = require('../../admin/controller/faqController');

jest.mock('../../db/db');
jest.mock('../../config/helper');
jest.mock('../../config/winston');

describe('createFaqCategory', () => {
   let req;
   let res;

   beforeEach(() => {
      req = {
         body: {
            name: 'General Questions',
            description: 'General FAQ category', // Added description
         },
         file: {
            key: 'icon-image-url',
         },
      };

      res = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn(),
      };
      knex.mockReset();
      sendResponse.mockReset();
   });

   test('should return BAD_REQUEST if category name is not provided', async () => {
      req.body.name = null;

      await createFaqCategoryController.createFaqCategory(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.REQUIRED_FIELDS.replace('{{key}}', 'category name'),
         res,
         constant.CODE.BAD_REQUEST,
         {},
         0,
      );
   });

   test('should return BAD_REQUEST if icon image is not provided', async () => {
      req.file.key = null;
      await createFaqCategoryController.createFaqCategory(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.REQUIRED_FIELDS.replace('{{key}}', 'icon image'),
         res,
         constant.CODE.BAD_REQUEST,
         {},
         0,
      );
   });

   test('should return BAD_REQUEST if description is not provided', async () => {
      req.body.description = null;
      await createFaqCategoryController.createFaqCategory(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.REQUIRED_FIELDS.replace('{{key}}', 'description'),
         res,
         constant.CODE.BAD_REQUEST,
         {},
         0,
      );
   });

   test('should insert new FAQ category successfully', async () => {
      const mockInsert = jest.fn().mockResolvedValue([1]);
      knex.mockReturnValue({
         insert: mockInsert
      });

      await createFaqCategoryController.createFaqCategory(req, res);

      expect(knex).toHaveBeenCalledWith('faqcategories');
      expect(mockInsert).toHaveBeenCalledWith({ 
         name: 'General Questions',
         icon: 'icon-image-url',
         description: 'General FAQ category'
      });
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {},
         1,
      );
   });

   test('should handle unexpected errors gracefully', async () => {
      knex.mockImplementationOnce(() => {
         throw new Error('Unexpected Error');
      });
      await createFaqCategoryController.createFaqCategory(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         'Unexpected Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0,
      );
   });
});
