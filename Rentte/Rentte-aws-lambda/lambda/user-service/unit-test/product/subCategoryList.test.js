const categoryController = require('../../user/controller/productController'); // Adjust path as necessary
const constant = require('../../config/constant');
const knex = require('../../db/db');
const logger = require("../../config/winston");
const { sendResponse } = require("../../config/helper");

jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock("../../config/helper");

describe("subCategoryList", () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            ip: '127.0.0.1',
            query: { categoryId: 1, page: 1 },
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

    test("should return paginated list of subcategories", async () => {
        const mockSubcategories = [
            {
                id: 1,
                subCategoryName: "Mobiles",
                created_at: "2024-10-01",
                updated_at: "2024-10-05",
                description: "Smartphones",
                subcategoryimage: "mobiles.jpg",
                category: {
                    id: 1,
                    categoryName: "Electronics",
                    created_at: "2024-01-01",
                    updated_at: "2024-01-01",
                },
            },
            {
                id: 2,
                subCategoryName: "Laptops",
                created_at: "2024-10-02",
                updated_at: "2024-10-06",
                description: "Laptop accessories",
                subcategoryimage: "laptops.jpg",
                category: {
                    id: 1,
                    categoryName: "Electronics",
                    created_at: "2024-01-01",
                    updated_at: "2024-01-01",
                },
            },
        ];
        const totalCount = 2;
        const page = 1;
        const limit = 10;
        const totalPages = Math.ceil(totalCount / limit);

        // Mock knex query methods to simulate the response
        knex.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            leftJoin: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            offset: jest.fn().mockResolvedValue(mockSubcategories),
        }));

        knex.mockImplementationOnce(() => ({
            count: jest.fn().mockResolvedValue([{ count: totalCount }]),
        }));

        await categoryController.subCategoryList(req, res);

        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            {
                subcategories: mockSubcategories,
                pagination: { page, limit, totalCount, totalPages },
            },
            1
        );
    });

    test("should return empty list if no subcategories found", async () => {
        const mockSubcategories = []; // Empty list to simulate no subcategories
        const totalCount = 0;

        // Mock knex query methods to simulate the response
        knex.mockImplementationOnce(() => ({
            select: jest.fn().mockReturnThis(),
            leftJoin: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            offset: jest.fn().mockResolvedValue(mockSubcategories),
        }));

        knex.mockImplementationOnce(() => ({
            count: jest.fn().mockResolvedValue([{ count: totalCount }]),
        }));

        await categoryController.subCategoryList(req, res);

        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            { subcategories: mockSubcategories, pagination: { page: 1, limit: 10, totalCount, totalPages: 0 } },
            1
        );
    });

    test("should handle missing or invalid categoryId gracefully", async () => {
        req.query = {};
        const mockError = new Error("Category id not found");
        await categoryController.subCategoryList(req, res);
        expect(sendResponse).toHaveBeenCalledWith(
            mockError.message,
            res,
            constant.CODE.INPUT_VALIDATION,
            {},
            0
        );
    });    
    test("should handle database query errors gracefully", async () => {
        knex.mockImplementationOnce(() => {
            throw new Error('Internal Server Error');
        });
        await categoryController.subCategoryList(req, res);
        expect(sendResponse).toHaveBeenCalledWith(constant.MESSAGE.INTERNAL_ERROR,res, 
            constant.CODE.INTERNAL_SERVER_ERROR,{},0);
    });   
    
});
