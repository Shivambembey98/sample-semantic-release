const categoryController = require('../admin/controller/productController');
const knex = require('../db/db');
const logger = require('../config/winston');
const { sendResponse } = require('../config/helper');
const constant = require('../config/constant');

jest.mock('../db/db');
jest.mock('../config/winston');
jest.mock('../config/helper');

describe('categoryList', () => {
   let req;
   let res;

   beforeEach(() => {
      req = {
         query: {
            page: '1',
            isSubCategoryRequest: undefined, // Default value for tests
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
   });

   test('should successfully list categories with pagination', async () => {
      const categoriesMock = [
         { id: 1, categoryName: 'category1', description: 'desc1', created_at: '2024-11-01', updated_at: '2024-11-02' },
         { id: 2, categoryName: 'category2', description: 'desc2', created_at: '2024-11-03', updated_at: '2024-11-04' },
      ];
      const totalCountMock = [{ count: 15 }];

      knex.mockReturnValueOnce({
         select: jest.fn().mockReturnThis(),
         where: jest.fn().mockReturnThis(),
         orderBy: jest.fn().mockReturnThis(),
         limit: jest.fn().mockReturnThis(),
         offset: jest.fn().mockResolvedValue(categoriesMock),
      });

      knex.mockReturnValueOnce({
         where: jest.fn().mockReturnThis(),
         count: jest.fn().mockResolvedValue(totalCountMock),
      });

      await categoryController.categoryList(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {
            categories: categoriesMock,
            pagination: {
               page: 1,
               limit: 10,
               totalCount: 15,
               totalPages: 2,
            },
         },
         1,
      );
   });

   test('should successfully list all categories when isSubCategoryRequest is true', async () => {
      req.query.isSubCategoryRequest = true;

      const categoriesMock = [
         { id: 1, categoryName: 'category1', description: 'desc1', created_at: '2024-11-01', updated_at: '2024-11-02' },
         { id: 2, categoryName: 'category2', description: 'desc2', created_at: '2024-11-03', updated_at: '2024-11-04' },
      ];

      knex.mockReturnValueOnce({
         select: jest.fn().mockReturnThis(),
         where: jest.fn().mockReturnThis(),
         orderBy: jest.fn().mockResolvedValue(categoriesMock),
      });

      knex.mockReturnValueOnce({
         where: jest.fn().mockReturnThis(),
         count: jest.fn().mockResolvedValue([{ count: 2 }]),
      });

      await categoryController.categoryList(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {
            categories: categoriesMock,
            pagination: {
               page: 1,
               limit: 10,
               totalCount: 2,
               totalPages: 1,
            },
         },
         1,
      );

      expect(knex).toHaveBeenCalledWith('category');
      expect(knex.mock.calls[0][0]).toBe('category');
   });

   test('should handle database query failure gracefully', async () => {
      knex.mockImplementationOnce(() => {
         throw new Error('Database Query Failed');
      });

      await categoryController.categoryList(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Database Query Failed',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0,
      );
   });

   test('should handle invalid page parameter gracefully', async () => {
      req.query.page = 'invalidPage'; // Simulate invalid page query

      const categoriesMock = [];
      const totalCountMock = [{ count: 0 }];

      knex.mockReturnValueOnce({
         select: jest.fn().mockReturnThis(),
         where: jest.fn().mockReturnThis(),
         orderBy: jest.fn().mockReturnThis(),
         limit: jest.fn().mockReturnThis(),
         offset: jest.fn().mockResolvedValue(categoriesMock),
      });

      knex.mockReturnValueOnce({
         where: jest.fn().mockReturnThis(),
         count: jest.fn().mockResolvedValue(totalCountMock),
      });

      await categoryController.categoryList(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {
            categories: categoriesMock,
            pagination: {
               page: 1,
               limit: 10,
               totalCount: 0,
               totalPages: 0,
            },
         },
         1,
      );
   });
});
