const { createCustomerQuery } = require('../user/controller/faqController'); // Adjust the path
const knex = require('../db/db');
const constant = require("../config/constant");
const logger = require('../config/winston');
const { sendResponse } = require("../config/helper");

jest.mock('../db/db');
jest.mock('../config/winston');
jest.mock('../config/helper');

describe('createCustomerQuery', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            user: { id: 1 }, // Assuming authenticated user id = 1
            body: {
                querytype: 'Technical',
                message: 'Need assistance with logging in',
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

    test('should return BAD_REQUEST if querytype and message are not provided', async () => {
        req.body.querytype = '';
        req.body.message = '';

        await createCustomerQuery(req, res);

        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.REQUIRED_FIELDS.replace('{{key}}', 'querytype, message'),
            res,
            constant.CODE.BAD_REQUEST,
            {},
            0
        );
    });

    test('should return SUCCESS if the query is successfully inserted', async () => {
        // Mock user data returned from DB
        const mockUser = { id: 1, email: 'test@example.com', firstName: 'John' };

        knex.mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue(mockUser),
        }));

        knex.mockImplementationOnce(() => ({
            insert: jest.fn().mockResolvedValue([{}]),
        }));

        await createCustomerQuery(req, res);

        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            {},
            1
        );
    });

    test('should return INTERNAL_SERVER_ERROR on unexpected errors', async () => {
        knex.mockImplementationOnce(() => {
            throw new Error('DB Error');
        });

        await createCustomerQuery(req, res);

        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.INTERNAL_ERROR,
            res,
            constant.CODE.INTERNAL_SERVER_ERROR,
            {},
            0
        );
    });

    test('should return BAD_REQUEST if the user does not exist in DB', async () => {
        knex.mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue(null), // Simulating that the user doesn't exist
        }));

        await createCustomerQuery(req, res);

        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.NOT_FOUND.replace("{{key}}", "user"),
            res,
            constant.CODE.BAD_REQUEST,
            {},
            0
        );
    });
});
