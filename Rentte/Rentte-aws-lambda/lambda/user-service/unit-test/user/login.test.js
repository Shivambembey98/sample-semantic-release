const loginController = require('../../user/controller/authController');
const knex = require('../../db/db');
const constant = require("../../config/constant");
const logger = require('../../config/winston');
const { sendResponse } = require("../../config/helper");
const jwt = require('jsonwebtoken');
const { decryptData } = require('../../helper/validator');

jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock('../../helper/validator');
jest.mock("../../config/helper");
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

        jest.clearAllMocks();
    });

    test('should return INCORRECT_PASS if the password is incorrect', async () => {
        // Mock for first query - user exists
        const mockUser = {
            id: 1,
            email: 'test@example.com',
            password: 'encryptedPassword',
            isEmailVerify: true
        };

        // Setup knex mock to handle both queries
        const mockWhere = jest.fn().mockReturnThis();
        const mockFirst = jest.fn()
            // First query returns the user
            .mockResolvedValueOnce(mockUser)
            // Second query (email verify check) returns null (meaning email is verified)
            .mockResolvedValueOnce(null);

        knex.mockReturnValue({
            where: mockWhere,
            first: mockFirst
        });

        // Mock password decryption to return different password
        decryptData.mockReturnValueOnce('differentPassword');

        await loginController.login(req, res);

        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.INCORRECT_PASS,
            res,
            constant.CODE.AUTH,
            {},
            0
        );
    });

    test('should successfully log in the user and return a token', async () => {
        const mockUser = {
            id: 1,
            email: 'test@example.com',
            password: 'encryptedPassword',
            firstName: 'Test',
            lastName: 'User',
            isEmailVerify: true
        };

        // Setup knex mock to handle both queries
        const mockWhere = jest.fn().mockReturnThis();
        const mockFirst = jest.fn()
            // First query returns the user
            .mockResolvedValueOnce(mockUser)
            // Second query (email verify check) returns null (meaning email is verified)
            .mockResolvedValueOnce(null);

        knex.mockReturnValue({
            where: mockWhere,
            first: mockFirst
        });

        // Mock password decryption to return matching password
        decryptData.mockReturnValueOnce(req.body.password);
        jwt.sign.mockReturnValueOnce('mockToken');

        await loginController.login(req, res);

        const tokenPayload = {
            id: mockUser.id,
            email: mockUser.email,
            firstName: mockUser.firstName,
            lastName: mockUser.lastName,
        };

        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            {
                token: 'Bearer mockToken',
                user: tokenPayload,
            },
            1
        );
    });

    test('should return EMAIL_NOT_VERIFIED if email is not verified', async () => {
        const mockUser = {
            id: 1,
            email: 'test@example.com',
            password: 'encryptedPassword',
            isEmailVerify: false
        };

        // Setup knex mock to handle both queries
        const mockWhere = jest.fn().mockReturnThis();
        const mockFirst = jest.fn()
            // First query returns the user
            .mockResolvedValueOnce(mockUser)
            // Second query returns the user (meaning email is not verified)
            .mockResolvedValueOnce(mockUser);

        knex.mockReturnValue({
            where: mockWhere,
            first: mockFirst
        });

        await loginController.login(req, res);

        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.EMAIL_NOT_VERIFIED,
            res,
            constant.CODE.BAD_REQUEST,
            {},
            0
        );
    });
});
