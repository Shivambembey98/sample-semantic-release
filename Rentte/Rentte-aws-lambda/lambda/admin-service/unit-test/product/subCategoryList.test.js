const categoryController = require('../../admin/controller/productController');
const knex = require('../../db/db');
const constant = require('../../config/constant');
const logger = require('../../config/winston');
const { sendResponse } = require('../../config/helper');

jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock('../../config/helper');

describe('subCategoryList', () => {
   let req;
   let res;

   beforeEach(() => {
      req = {
         query: {
            page: 1,
         },
         ip: '127.0.0.1',
         headers: {},
         body: {},
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

   test('should return subcategory list with pagination', async () => {
      const mockSubcategories = [
         {
            id: 1,
            subCategoryName: 'SubCategory1',
            created_at: '2024-11-01T00:00:00.000Z',
            updated_at: '2024-11-10T00:00:00.000Z',
            description: 'Description1',
            subcategoryimage: 'image1.jpg',
            category: {
               id: 1,
               categoryName: 'Category1',
               created_at: '2024-11-01T00:00:00.000Z',
               updated_at: '2024-11-10T00:00:00.000Z',
            },
         },
      ];
      const mockTotalCount = [{ count: '1' }];

      knex.mockImplementationOnce(() => ({
         select: jest.fn().mockReturnThis(),
         leftJoin: jest.fn().mockReturnThis(),
         where: jest.fn().mockReturnThis(),
         limit: jest.fn().mockReturnThis(),
         orderBy: jest.fn().mockReturnThis(),
         offset: jest.fn().mockResolvedValue(mockSubcategories),
      }));

      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         count: jest.fn().mockResolvedValue(mockTotalCount),
      }));

      await categoryController.subCategoryList(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {
            subcategories: mockSubcategories,
            pagination: {
               page: 1,
               limit: 10,
               totalCount: "1",
               totalPages: 1,
            },
         },
         1,
      );
   });

   test('should return empty list if no subcategories exist', async () => {
      knex.mockImplementationOnce(() => ({
         select: jest.fn().mockReturnThis(),
         leftJoin: jest.fn().mockReturnThis(),
         where: jest.fn().mockReturnThis(),
         limit: jest.fn().mockReturnThis(),
         orderBy: jest.fn().mockReturnThis(),
         offset: jest.fn().mockResolvedValue([]), // No subcategories
      }));

      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         count: jest.fn().mockResolvedValue([{ count: '0' }]), // No total count
      }));

      await categoryController.subCategoryList(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {
            subcategories: [],
            pagination: {
               page: 1,
               limit: 10,
               totalCount: "0",
               totalPages: 0,
            },
         },
         1,
      );
   });

   test('should handle database errors gracefully', async () => {
      knex.mockImplementationOnce(() => {
         throw new Error('Database Error'); // Simulate database error
      });

      await categoryController.subCategoryList(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Database Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0,
      );
   });

   test('should handle unexpected errors gracefully', async () => {
      knex.mockImplementationOnce(() => {
         throw new Error('Unexpected Error'); // Simulate unexpected error
      });

      await categoryController.subCategoryList(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Unexpected Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0,
      );
   });
});
