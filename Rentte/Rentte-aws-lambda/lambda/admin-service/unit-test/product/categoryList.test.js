const categoryController = require('../../admin/controller/productController');
const knex = require('../../db/db');
const logger = require('../../config/winston');
const { sendResponse } = require('../../config/helper');
const constant = require('../../config/constant');

jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock('../../config/helper');

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

      knex.mockImplementationOnce(() => ({
         select: jest.fn().mockReturnThis(),
         where: jest.fn().mockReturnThis(),
         orderBy: jest.fn().mockReturnThis(),
         limit: jest.fn().mockReturnThis(),
         offset: jest.fn().mockResolvedValue(categoriesMock), // Mock query result
      }));

      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         count: jest.fn().mockResolvedValue(totalCountMock), // Mock total count
      }));

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
      req.query.isSubCategoryRequest = true; // Simulating a request without pagination
    
      const categoriesMock = [
         { id: 1, categoryName: 'category1', description: 'desc1', created_at: '2024-11-01', updated_at: '2024-11-02' },
         { id: 2, categoryName: 'category2', description: 'desc2', created_at: '2024-11-03', updated_at: '2024-11-04' },
      ];
    
      // Mock knex for the main query (categories)
      const knexMainQueryMock = {
         select: jest.fn().mockReturnThis(),
         where: jest.fn().mockReturnThis(),
         orderBy: jest.fn().mockResolvedValue(categoriesMock), // Mock resolved value for the categories query
      };
    
      // Mock knex for the total count query
      const knexCountQueryMock = {
         where: jest.fn().mockReturnThis(),
         count: jest.fn().mockResolvedValue([{ count: 2 }]), // Mock resolved value for count query
      };
    
      // Apply mock implementations based on usage
      knex.mockImplementationOnce(() => knexMainQueryMock); // First call for categories query
      knex.mockImplementationOnce(() => knexCountQueryMock); // Second call for count query
    
      await categoryController.categoryList(req, res);
    
      // Verify the response
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {
            categories: categoriesMock,
            pagination: { // Include pagination since it is being returned by the controller
               page: 1,
               limit: 10,
               totalCount: 2,
               totalPages: 1,
            },
         },
         1,
      );
    
      // Validate knex mock calls for categories query
      expect(knex).toHaveBeenCalledWith('category');
      expect(knexMainQueryMock.select).toHaveBeenCalledWith('id', 'categoryName', 'description', 'created_at', 'updated_at');
      expect(knexMainQueryMock.where).toHaveBeenCalledWith('isDelete', false);
      expect(knexMainQueryMock.orderBy).toHaveBeenCalledWith('created_at', 'desc');
    
      // Validate knex mock calls for count query
      expect(knex).toHaveBeenCalledWith('category');
      expect(knexCountQueryMock.where).toHaveBeenCalledWith('isDelete', false);
      expect(knexCountQueryMock.count).toHaveBeenCalledWith('id as count');
   });
          

   test('should handle database query failure gracefully', async () => {
      knex.mockImplementation(() => {
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

      knex.mockImplementationOnce(() => ({
         select: jest.fn().mockReturnThis(),
         where: jest.fn().mockReturnThis(),
         orderBy: jest.fn().mockReturnThis(),
         limit: jest.fn().mockReturnThis(),
         offset: jest.fn().mockResolvedValue(categoriesMock), // Empty result
      }));

      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         count: jest.fn().mockResolvedValue(totalCountMock), // Total count as 0
      }));

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
