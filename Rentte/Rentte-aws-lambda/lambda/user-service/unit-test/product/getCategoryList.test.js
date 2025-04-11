const categoryController = require('../../user/controller/productController'); // Adjust path as necessary
const constant = require('../../config/constant');
const knex = require('../../db/db');
const logger = require("../../config/winston");
const { sendResponse } = require("../../config/helper");

jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock("../../config/helper");

describe("getCategoryList", () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            ip: '127.0.0.1',
            body: {},
            headers: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        knex.mockReset();
        sendResponse.mockReset();
        jest.spyOn(logger, 'info').mockImplementation(() => {});
        jest.spyOn(logger, 'error').mockImplementation(() => {});
    });

    test("should return the list of categories with subcategories", async () => {
        const mockCategories = [
            {
                categoryId: 1,
                categoryName: "Electronics",
                categoryDescription: "All electronic items",
                categoryCreatedAt: "2024-10-01",
                categoryUpdatedAt: "2024-10-10",
                subcategories: [
                    {
                        id: 101,
                        subCategoryName: "Mobiles",
                        created_at: "2024-10-05",
                        updated_at: "2024-10-06",
                        description: "Smartphones and accessories",
                        subcategoryimage: "mobile.jpg",
                    },
                ],
            },
        ];
    
        // Mock knex query builder methods to return chained results
        knex.mockImplementation(() => ({
            select: jest.fn().mockReturnThis(),
            rightJoin: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            groupBy: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockResolvedValue(mockCategories), // Return mock categories with subcategories
        }));
    
        // Call the category controller
        await categoryController.getCategoryList(req, res);
    
        // Assert the response
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            { categories: mockCategories },
            1
        );
    });
    

    test("should return an empty list if no categories are found", async () => {
        const mockCategories = []; // Empty list to simulate no categories found
    
        // Mock knex to simulate chained queries
        knex.mockImplementation(() => ({
            select: jest.fn().mockReturnThis(),
            rightJoin: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            groupBy: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockResolvedValue(mockCategories), // Returns an empty list
        }));
    
        // Call the controller
        await categoryController.getCategoryList(req, res);
    
        // Assert the response
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            { categories: mockCategories },
            1
        );
    });
    

    test("should handle database query errors gracefully", async () => {
        knex.mockImplementationOnce(() => {
            throw new Error('Internal Server Error');
        });
        await categoryController.getCategoryList(req, res);
        expect(sendResponse).toHaveBeenCalledWith(constant.MESSAGE.INTERNAL_ERROR,res, 
            constant.CODE.INTERNAL_SERVER_ERROR,{},0);
    });

    test("should handle missing or invalid subcategories gracefully", async () => {
        // Mock the database response with valid category data but no subcategories
        const mockCategories = [
            {
                categoryId: 1,
                categoryName: "Electronics",
                categoryDescription: "All electronic items",
                categoryCreatedAt: "2024-10-01",
                categoryUpdatedAt: "2024-10-10",
                subcategories: [], // No subcategories
            },
        ];
    
        // Mock knex to simulate chained queries
        knex.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            rightJoin: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            groupBy: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockResolvedValue(mockCategories),
        }));
    
        // Call the controller
        await categoryController.getCategoryList(req, res);
    
        // Assert the response
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            { categories: mockCategories },
            1
        );
    });    

    test("should return INTERNAL_SERVER_ERROR on unexpected exceptions", async () => {
        knex.mockImplementationOnce(() => {
            throw new Error('Internal Server Error');
        });
        await categoryController.getCategoryList(req, res);
        expect(sendResponse).toHaveBeenCalledWith(constant.MESSAGE.INTERNAL_ERROR,res, 
            constant.CODE.INTERNAL_SERVER_ERROR,{},0);
    });
});
