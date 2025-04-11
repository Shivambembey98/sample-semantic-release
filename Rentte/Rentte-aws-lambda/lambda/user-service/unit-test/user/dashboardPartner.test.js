const dashboardPartnerController = require('../../user/controller/partnerController');  // Adjust path
const knex = require('../../db/db');
const constant = require("../../config/constant");
const logger = require('../../config/winston');
const { sendResponse } = require("../../config/helper");  // Assuming sendResponse is imported from helpers

jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock("../../config/helper");

describe('dashboardPartner', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            user: { id: 1 },  // Mock the user object with an ID
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

    test('should return the correct counts for active and rented products', async () => {
        // Mocking knex queries
        knex.mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            count: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue({ count: 15 }),
        })).mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            count: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue({ count: 5 }),
        }));

        await dashboardPartnerController.dashboardPartner(req, res);

        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            {
                totalActiveProduct: 15,
                totalProductOnRent: 5,
            },
            1
        );
    });

    test('should return 0 if there are no products', async () => {
        // Mocking the database responses for no products
        knex.mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            count: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue({ count: 0 }),
        })).mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            count: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue({ count: 0 }),
        }));

        await dashboardPartnerController.dashboardPartner(req, res);

        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            {
                totalActiveProduct: 0,
                totalProductOnRent: 0,
            },
            1
        );
    });
    
    test('should handle the case when no rented products are found', async () => {
        // Mocking the database responses
        knex.mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            count: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue({ count: 10 }),
        })).mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            count: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue({ count: 0 }),
        }));

        await dashboardPartnerController.dashboardPartner(req, res);

        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            {
                totalActiveProduct: 10,
                totalProductOnRent: 0,
            },
            1
        );
    });

    test('should return INTERNAL_SERVER_ERROR on unexpected exceptions', async () => {
        knex.mockImplementationOnce(() => {
            throw new Error('Internal Server Error');
        });
        await dashboardPartnerController.dashboardPartner(req, res);
        expect(sendResponse).toHaveBeenCalledWith(constant.MESSAGE.INTERNAL_ERROR,res, 
            constant.CODE.INTERNAL_SERVER_ERROR,{},0);
    });
});
