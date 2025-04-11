const loginController = require('../user/controller/authController'); // Adjust path
const knex = require('../db/db');
const constant = require("../config/constant");
const logger = require('../config/winston');
const { sendResponse } = require("../config/helper"); // Assuming sendResponse is imported from helpers
const jwt = require('jsonwebtoken');
const { decryptData } = require('../helper/validator');

jest.mock('../db/db');
jest.mock('../config/winston');
jest.mock('../helper/validator');
jest.mock("../config/helper");
jest.mock('jsonwebtoken');

describe('login', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            body: { email: 'test@example.com', password: 'password123' },
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

    test('should return NOT_EXIST if the user does not exist', async () => {
        knex.mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue(null),
        }));

        await loginController.login(req, res);
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.EMAIL_NOT_REGISTERED,
            res,
            constant.CODE.NOT_FOUND,
            {},
            0
        );
    });

    // test('should return INCORRECT_TEXT if the password is incorrect', async () => {
    //     const mockUser = {
    //         email: 'test@example.com',
    //         password: 'encryptedPassword',
    //     };

    //     knex.mockImplementationOnce(() => ({
    //         where: jest.fn().mockReturnThis(),
    //         first: jest.fn().mockResolvedValue(mockUser),
    //     }));

    //     decryptData.mockReturnValue('wrongPassword');

    //     await loginController.login(req, res);

    //     expect(sendResponse).toHaveBeenCalledWith(
    //         constant.MESSAGE.INCORRECT_PASS,
    //         res,
    //         constant.CODE.AUTH,
    //         {},
    //         0
    //     );
    // });

    // test('should successfully log in the user and return a token', async () => {
    //     const mockUser = {
    //         id: 1,
    //         email: 'test@example.com',
    //         password: 'encryptedPassword',
    //         firstName: 'Test',
    //         lastName: 'User',
    //     };

    //     knex.mockImplementationOnce(() => ({
    //         where: jest.fn().mockReturnThis(),
    //         first: jest.fn().mockResolvedValue(mockUser),
    //     }));

    //     decryptData.mockReturnValue('password123');

    //     const token = 'mockToken';
    //     jwt.sign.mockReturnValue(token);

    //     await loginController.login(req, res);

    //     const tokenPayload = {
    //         id: mockUser.id,
    //         email: mockUser.email,
    //         firstName: mockUser.firstName,
    //         lastName: mockUser.lastName,
    //     };

    //     expect(sendResponse).toHaveBeenCalledWith(
    //         constant.MESSAGE.SUCCESS,
    //         res,
    //         constant.CODE.SUCCESS,
    //         {
    //             token: `Bearer ${token}`,
    //             user: tokenPayload,
    //         },
    //         1
    //     );
    // });
    test("should return email not found if payload have not email", async () => {
        const mockUser = {
            email: 'test@example.com',
            password: 'encryptedPassword',
        };
        knex.mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue(mockUser),
        }));

        const req = {
            body: { password: 'XXXXXXXXXXX' },
            ip: '127.0.0.1',
            headers: {},
        };

        await loginController.login(req, res);
        expect(sendResponse).toHaveBeenCalledWith(
          constant.MESSAGE.REQUIRED_FIELDS.replace("{{key}}",'email'), res,
         constant.CODE.INPUT_VALIDATION, {}, 0
        );
    })
    test("should return password not found if payload have not password", async () => {
        const mockUser = {
            email: 'test@example.com',
            password: 'encryptedPassword',
        };
        knex.mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue(mockUser),
        }));

        const req = {
            body: { email: "vipin@yopmail.com" },
            ip: '127.0.0.1',
            headers: {},
        };

        await loginController.login(req, res);
        expect(sendResponse).toHaveBeenCalledWith(
          constant.MESSAGE.REQUIRED_FIELDS.replace("{{key}}",'password'), res,
         constant.CODE.INPUT_VALIDATION, {}, 0
        );
    })

    test('should return INTERNAL_SERVER_ERROR on unexpected exceptions', async () => {
        knex.mockImplementationOnce(() => {
            throw new Error('Internal Server Error');
        });

        await loginController.login(req, res);

        expect(sendResponse).toHaveBeenCalledWith(
            'Internal Server Error',
            res,
            constant.CODE.INTERNAL_SERVER_ERROR,
            {},
            0
        );
    });
});
