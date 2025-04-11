const productController = require('../product/controller/productController');
const constant = require('../config/constant');
const knex = require('../db/db');
const logger = require("../config/winston");
const { inputValidation } = require("../validators/productValidator");
const { sendResponse } = require("../config/helper");

jest.mock('../db/db');
jest.mock('../config/winston');
jest.mock("../validators/productValidator");
jest.mock("../config/helper");

describe('createProduct', () => {
   let req; 
   let res;

   beforeEach(() => {
      req = {
         ip: '127.0.0.1',
         user: { id: 1 },
         body: {
            categoryId: 10,
            subCategoryId: 20,
            amount: '1000',
            productImages: [],
         },
         files: [{ key: 'image1.jpg' }, { key: 'image2.jpg' }],
         headers: {},
      };
      res = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn(),
      };
      knex.mockReset();
      inputValidation.mockReset();
      sendResponse.mockReset();
      jest.spyOn(logger, 'info').mockImplementation(() => {});
      jest.spyOn(logger, 'error').mockImplementation(() => {});
   });

   test('should successfully create a product', async () => {
    inputValidation.mockResolvedValue(null);
    
    // Mock user check
    knex.mockImplementationOnce(() => ({
       where: jest.fn().mockReturnThis(),
       andWhere: jest.fn().mockReturnThis(),
       first: jest.fn().mockResolvedValue({ id: 1, userType: 'partner' }),
    }));
    
    // Mock category check
    knex.mockImplementationOnce(() => ({
       where: jest.fn().mockReturnThis(),
       first: jest.fn().mockResolvedValue({ id: 10 }),
    }));
    
    // Mock subcategory check
    knex.mockImplementationOnce(() => ({
       where: jest.fn().mockReturnThis(),
       first: jest.fn().mockResolvedValue({ id: 20 }),
    }));
    
    // Mock product creation with `returning`
    knex.mockImplementationOnce(() => ({
       insert: jest.fn().mockReturnThis(),
       returning: jest.fn().mockResolvedValue([1]), // Mock returning the new product ID
    }));
 
    await productController.creeateProduct(req, res);
    expect(sendResponse).toHaveBeenCalledWith(
       constant.MESSAGE.SUCCESS,
       res,
       constant.CODE.SUCCESS,
       { id: 1 },
       1
    );
 });
 

   test('should return INPUT_VALIDATION if input validation fails', async () => {
      inputValidation.mockResolvedValue('Validation error');
      await productController.creeateProduct(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         'Validation error',
         res,
         constant.CODE.INPUT_VALIDATION,
         {},
         0
      );
   });

   test('should return NOT_FOUND if the user is not an admin or partner', async () => {
      inputValidation.mockResolvedValue(null);
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         andWhere: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null), // User not found
      }));

      await productController.creeateProduct(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.NOT_FOUND.replace("{{key}}", "partner"),
         res,
         constant.CODE.NOT_FOUND,
         {},
         0
      );
   });

   test('should return NOT_FOUND if the category does not exist', async () => {
      inputValidation.mockResolvedValue(null);
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         andWhere: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 1, userType: 'partner' }),
      })); // Mock user check
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null), // Category not found
      }));

      await productController.creeateProduct(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.NOT_FOUND.replace("{{key}}", "category"),
         res,
         constant.CODE.NOT_FOUND,
         {},
         0
      );
   });

   test('should return NOT_FOUND if the subcategory does not exist', async () => {
      inputValidation.mockResolvedValue(null);
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         andWhere: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 1, userType: 'partner' }),
      })); // Mock user check
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 10 }),
      })); // Mock category check
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null), // Subcategory not found
      }));

      await productController.creeateProduct(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.NOT_FOUND.replace("{{key}}", "subCategory"),
         res,
         constant.CODE.NOT_FOUND,
         {},
         0
      );
   });

   test('should handle exceptions and return INTERNAL_SERVER_ERROR', async () => {
      inputValidation.mockResolvedValue(null);
      knex.mockImplementation(() => {
         throw new Error('Internal Server Error');
      });

      await productController.creeateProduct(req, res);
      expect(sendResponse).toHaveBeenCalledWith(
         'Internal Server Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0
      );
   });
});
