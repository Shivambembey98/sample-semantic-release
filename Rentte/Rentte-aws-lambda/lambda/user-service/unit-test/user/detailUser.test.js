const detailUserController = require('../../user/controller/authController'); // Adjust path
const knex = require('../../db/db');
const constant = require("../../config/constant");
const logger = require('../../config/winston');
const { sendResponse } = require("../../config/helper");

jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock("../../config/helper");

describe('detailUser', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            user: { id: 1 }, // Simulating an authenticated user
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

    test('should return NOT_FOUND if the user does not exist', async () => {
        knex.mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue(null),
        }));

        await detailUserController.detailUser(req, res);

        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.NOT_FOUND.replace("{{key}}", "user"),
            res,
            constant.CODE.NOT_FOUND,
            {},
            0
        );
    });

    test('should return SUCCESS with user details if the user exists', async () => {
        const mockUser = {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'test@example.com',
        };

        knex.mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue(mockUser),
        }));

        await detailUserController.detailUser(req, res);

        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            { user: mockUser },
            1
        );
    });

    test('should return INTERNAL_SERVER_ERROR on unexpected exceptions', async () => {
        knex.mockImplementationOnce(() => {
            throw new Error('Internal Server Error');
        });
        await detailUserController.detailUser(req, res);
        expect(sendResponse).toHaveBeenCalledWith(constant.MESSAGE.INTERNAL_ERROR,res, 
            constant.CODE.INTERNAL_SERVER_ERROR,{},0);
    });
});
