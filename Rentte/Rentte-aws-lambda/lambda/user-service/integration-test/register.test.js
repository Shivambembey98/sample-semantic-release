const registerController = require('../user/controller/authController'); // Adjust path
const knex = require('../db/db');
const constant = require("../config/constant");
const logger = require('../config/winston');
const { sendResponse } = require("../config/helper");
const { inputValidation } = require("../validators/productValidator");
jest.mock('../db/db');
jest.mock('../config/winston');
jest.mock('../validators/productValidator');
jest.mock("../config/helper");

describe('register', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            body: {
                email: 'test@example.com',
                password: 'password123',
                mobileNumber: '1234567890',
                firstName: 'John',
                lastName: 'Doe',
                gender: 'Male',
                profession: 'Engineer',
                dob: '2000-01-01',
                countryCode: '+1',
                userType: 'customer',
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

    test('should return INPUT_VALIDATION if request body is invalid', async () => {
        inputValidation.mockResolvedValue('Internal Server Error');
        await registerController.register(req, res);
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.INTERNAL_ERROR,
            res,
            constant.CODE.INTERNAL_SERVER_ERROR,
            {},
            0
        );
    });

    test('should return ALREADY_EXIST if mobile number is already registered', async () => {
        inputValidation.mockResolvedValue(null); // No validation error
        knex.mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue({ mobileNumber: '1234567890' }),
        }));
        await registerController.register(req, res);
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.ALREADY_EXIST.replace("{{key}}", 'mobile number'),
            res,
            constant.CODE.BAD_REQUEST,
            {},
            0
        );
    });

    test('should return INTERNAL_SERVER_ERROR on unexpected exceptions', async () => {
        inputValidation.mockResolvedValue(null); // No validation error
        knex.mockImplementationOnce(() => {
            throw new Error('Internal Server Error');
        });
        await registerController.register(req, res);
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.INTERNAL_ERROR,
            res,
            constant.CODE.INTERNAL_SERVER_ERROR,
            {},
            0
        );
    });
});
