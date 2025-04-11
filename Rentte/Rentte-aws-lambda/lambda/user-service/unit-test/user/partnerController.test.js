const partnerController = require('../../user/controller/partnerController');
const knex = require('../../db/db');
const { sendResponse, commonLogger } = require('../../config/helper');
const logger = require('../../config/winston');
const constant = require('../../config/constant');
const { LOGGER_MESSAGES } = require('../../helper/loggerMessage');
const { LIST_ALL_PARTNER, DASHBOARD_PARTNER } = LOGGER_MESSAGES;

jest.mock('../../db/db');
jest.mock('../../config/helper');
jest.mock('../../config/winston');

describe('partnerController', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            query: {
                page: '1',
                limit: '10',
                search: ''
            },
            user: {
                id: 1
            },
            ip: '127.0.0.1',
            headers: {},
            body: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        jest.clearAllMocks();
    });

    describe('listAllPartner', () => {
        it('should successfully list all partners', async () => {
            const mockPartners = [
                { id: 1, name: 'Partner 1' },
                { id: 2, name: 'Partner 2' }
            ];
            const mockCount = [{ count: 2 }];

            knex.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                offset: jest.fn().mockResolvedValue(mockPartners),
                count: jest.fn().mockResolvedValue(mockCount)
            });

            await partnerController.listAllPartner(req, res);

            expect(logger.info).toHaveBeenCalledWith(
                'Partner login',
                expect.objectContaining({
                    operation: LIST_ALL_PARTNER().OPERATION,
                    client: {
                        ip: req.ip,
                        requestBody: req.body,
                    },
                })
            );

            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.SUCCESS,
                res,
                constant.CODE.SUCCESS,
                {
                    partners: mockPartners,
                    pagination: {
                        page: 1,
                        limit: 10,
                        totalCount: 2,
                        totalPages: 1
                    }
                },
                1
            );
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            knex.mockImplementation(() => {
                throw error;
            });

            await partnerController.listAllPartner(req, res);

            expect(logger.error).toHaveBeenCalledWith(
                'Exception error',
                expect.objectContaining({
                    error: error.message,
                    stack: error.stack,
                    operation: LIST_ALL_PARTNER().OPERATION,
                })
            );

            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.INTERNAL_ERROR,
                res,
                constant.CODE.INTERNAL_SERVER_ERROR,
                {},
                0
            );
        });

        it('should handle pagination parameters', async () => {
            // Set up request query parameters
            req.query = {
                page: '2',
                limit: '5',
                search: ''
            };

            const mockPartners = [{ id: 6, name: 'Partner 6' }];
            const mockCount = [{ count: 6 }];

            // Create mock functions
            const whereMock = jest.fn().mockReturnThis();
            const selectMock = jest.fn().mockReturnThis();
            const limitMock = jest.fn().mockReturnThis();
            const orderByMock = jest.fn().mockReturnThis();
            const offsetMock = jest.fn().mockResolvedValue(mockPartners);

            // Set up the knex mock chain
            knex.mockReturnValue({
                select: selectMock,
                where: whereMock,
                limit: limitMock,
                orderBy: orderByMock,
                offset: offsetMock,
                count: jest.fn().mockResolvedValue(mockCount)
            });

            await partnerController.listAllPartner(req, res);

            // Verify that the correct limit was used in the query
            expect(knex).toHaveBeenCalled();
            expect(limitMock).toHaveBeenCalledWith(5);
            expect(offsetMock).toHaveBeenCalledWith(5);

            // Verify the response format
            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.SUCCESS,
                res,
                constant.CODE.SUCCESS,
                {
                    partners: mockPartners,
                    pagination: {
                        page: 2,
                        limit: 5,
                        totalCount: 6,
                        totalPages: 2
                    }
                },
                1
            );
        });
    });

    describe('dashboardPartner', () => {
        it('should successfully return dashboard statistics', async () => {
            const mockTotalProducts = { count: 10 };
            const mockRentedProducts = { count: 5 };

            knex.mockReturnValue({
                where: jest.fn().mockReturnThis(),
                count: jest.fn().mockReturnThis(),
                first: jest.fn()
                    .mockResolvedValueOnce(mockTotalProducts)
                    .mockResolvedValueOnce(mockRentedProducts)
            });

            await partnerController.dashboardPartner(req, res);

            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.SUCCESS,
                res,
                constant.CODE.SUCCESS,
                {
                    totalActiveProduct: 10,
                    totalProductOnRent: 5
                },
                1
            );
        });

        it('should handle database errors in dashboard', async () => {
            const error = new Error('Database error');
            knex.mockImplementation(() => {
                throw error;
            });

            await partnerController.dashboardPartner(req, res);

            expect(logger.error).toHaveBeenCalledWith(
                'Exception error',
                expect.objectContaining({
                    error: error.message,
                    stack: error.stack,
                    operation: DASHBOARD_PARTNER().OPERATION,
                })
            );

            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.INTERNAL_ERROR,
                res,
                constant.CODE.INTERNAL_SERVER_ERROR,
                {},
                0
            );
        });

        it('should handle missing user id', async () => {
            delete req.user.id;

            await partnerController.dashboardPartner(req, res);

            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.INTERNAL_ERROR,
                res,
                constant.CODE.INTERNAL_SERVER_ERROR,
                {},
                0
            );
        });

        it('should query correct products for dashboard', async () => {
            const whereMock = jest.fn().mockReturnThis();
            const countMock = jest.fn().mockReturnThis();
            const firstMock = jest.fn().mockResolvedValue({ count: 0 });

            knex.mockReturnValue({
                where: whereMock,
                count: countMock,
                first: firstMock
            });

            await partnerController.dashboardPartner(req, res);

            expect(whereMock).toHaveBeenCalledWith({ 
                userid: req.user.id,
                isdelete: null 
            });
            expect(whereMock).toHaveBeenCalledWith({ 
                userid: req.user.id,
                isRented: true,
                isdelete: null 
            });
        });
    });
});

