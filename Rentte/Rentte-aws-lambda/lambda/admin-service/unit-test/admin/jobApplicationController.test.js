const { getAllJobApplications } = require('../../admin/controller/jobApplicationController');
const knex = require('../../db/db');
const logger = require('../../config/winston');
const { sendResponse } = require('../../config/helper');
const constant = require('../../config/constant');

// Mock dependencies
jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock('../../config/helper');

describe('jobApplicationController', () => {
    // Mock request and response objects
    let req;
    let res;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Setup request mock
        req = {
            query: {},
            ip: '127.0.0.1',
            headers: { 'user-agent': 'test' },
            body: {}
        };

        // Setup response mock
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        // Setup sendResponse mock
        sendResponse.mockImplementation((message, res, code, data, success) => {
            return { message, code, data, success };
        });
    });

    describe('getAllJobApplications', () => {
        it('should successfully fetch job applications with default pagination', async () => {
            // Mock database responses
            const mockCountResult = [{ count: 15 }];
            const mockApplications = [
                { id: 1, name: 'John Doe' },
                { id: 2, name: 'Jane Smith' }
            ];

            knex.mockReturnValue({
                count: jest.fn().mockResolvedValue(mockCountResult),
                select: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockResolvedValue(mockApplications)
            });

            await getAllJobApplications(req, res);

            // Verify database queries
            expect(knex).toHaveBeenCalledWith('jobapplications');
            
            // Verify response
            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.SUCCESS,
                res,
                constant.CODE.SUCCESS,
                {
                    jobApplications: mockApplications,
                    pagination: {
                        page: 1,
                        limit: 10,
                        totalCount: 15,
                        totalPages: 2
                    }
                },
                1
            );
        });

        it('should handle custom page number from query params', async () => {
            req.query.page = '2';

            const mockCountResult = [{ count: 25 }];
            const mockApplications = [
                { id: 3, name: 'Alice Johnson' },
                { id: 4, name: 'Bob Wilson' }
            ];

            knex.mockReturnValue({
                count: jest.fn().mockResolvedValue(mockCountResult),
                select: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockResolvedValue(mockApplications)
            });

            await getAllJobApplications(req, res);

            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.SUCCESS,
                res,
                constant.CODE.SUCCESS,
                {
                    jobApplications: mockApplications,
                    pagination: {
                        page: 2,
                        limit: 10,
                        totalCount: 25,
                        totalPages: 3
                    }
                },
                1
            );
        });

        it('should handle database error gracefully', async () => {
            const mockError = new Error('Database connection failed');

            knex.mockReturnValue({
                count: jest.fn().mockRejectedValue(mockError)
            });

            await getAllJobApplications(req, res);

            // Verify error logging
            expect(logger.error).toHaveBeenCalledWith(
                'Exception error',
                expect.objectContaining({
                    error: mockError.message,
                    stack: mockError.stack,
                    client: {
                        ip: req.ip,
                        headers: req.headers,
                        requestBody: req.body
                    }
                })
            );

            // Verify error response
            expect(sendResponse).toHaveBeenCalledWith(
                mockError.message,
                res,
                constant.CODE.INTERNAL_SERVER_ERROR,
                {},
                0
            );
        });

        it('should handle empty result set', async () => {
            const mockCountResult = [{ count: 0 }];
            const mockApplications = [];

            knex.mockReturnValue({
                count: jest.fn().mockResolvedValue(mockCountResult),
                select: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockResolvedValue(mockApplications)
            });

            await getAllJobApplications(req, res);

            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.SUCCESS,
                res,
                constant.CODE.SUCCESS,
                {
                    jobApplications: [],
                    pagination: {
                        page: 1,
                        limit: 10,
                        totalCount: 0,
                        totalPages: 0
                    }
                },
                1
            );
        });

        it('should handle invalid page number gracefully', async () => {
            req.query.page = 'invalid';

            const mockCountResult = [{ count: 10 }];
            const mockApplications = [
                { id: 1, name: 'John Doe' }
            ];

            knex.mockReturnValue({
                count: jest.fn().mockResolvedValue(mockCountResult),
                select: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockResolvedValue(mockApplications)
            });

            await getAllJobApplications(req, res);

            // Should default to page 1
            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.SUCCESS,
                res,
                constant.CODE.SUCCESS,
                {
                    jobApplications: mockApplications,
                    pagination: {
                        page: 1,
                        limit: 10,
                        totalCount: 10,
                        totalPages: 1
                    }
                },
                1
            );
        });
    });
});