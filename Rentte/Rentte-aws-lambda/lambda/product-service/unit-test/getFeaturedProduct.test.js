const productController = require('../product/controller/productController'); // Adjust the path if needed
const knex = require('../db/db');
const logger = require("../config/winston");
const constant = require('../config/constant');
const { sendResponse } = require("../config/helper");
jest.mock('../db/db');
jest.mock('../config/winston');
jest.mock('../config/helper');

describe('getFeaturedProduct', () => {
    let req, res;

    beforeEach(() => {
        req = {
            ip: '127.0.0.1',
            query: { userid: 1 }, // Assuming userid is passed as query param
            headers: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Reset mocks to ensure no interference between tests
        knex.mockReset();
        logger.info.mockReset();
        logger.error.mockReset();
        sendResponse.mockReset();
    });

    test('should successfully retrieve featured products', async () => {
        // Mocking successful knex query to return a list of products
        const mockProducts = {
            rows: [
                { id: 1, productName: 'Product 1' },
                { id: 2, productName: 'Product 2' },
            ],
        };
        knex.raw.mockResolvedValue(mockProducts);

        // Call the controller
        await productController.getFeaturedProduct(req, res);

        // Assertions
        expect(knex.raw).toHaveBeenCalledWith(expect.any(String));
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            { products: mockProducts.rows },
            1
        );
    });

    test('should handle database error and return INTERNAL_SERVER_ERROR', async () => {
        // Mocking an error during the database query
        const mockError = new Error('Internal Server Error');
        knex.raw.mockRejectedValue(mockError);

        // Call the controller
        await productController.getFeaturedProduct(req, res);

        // Assertions
        expect(sendResponse).toHaveBeenCalledWith(
            mockError.message,
            res,
            constant.CODE.INTERNAL_SERVER_ERROR,
            {},
            0
        );
    });     
});
