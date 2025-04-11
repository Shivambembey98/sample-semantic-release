const jobApplicationController = require('../../user/controller/jobApplicationController');
const knex = require('../../db/db');
const { sendResponse, commonLogger } = require('../../config/helper');
const logger = require('../../config/winston');
const constant = require('../../config/constant');

jest.mock('../../db/db');
jest.mock('../../config/helper');
jest.mock('../../config/winston');

describe('jobApplicationController', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            body: {
                name: 'John Doe',
                email: 'john@example.com',
                phone: '1234567890',
                experience: '5 years',
                dob: '1990-01-01',
                jobtype: 'Full-time'
            },
            file: {
                key: 'resume123.pdf'
            },
            ip: '127.0.0.1',
            headers: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('applyJobs', () => {
        it('should successfully create a job application', async () => {
            knex.mockReturnValue({
                insert: jest.fn().mockResolvedValue([1])
            });

            await jobApplicationController.applyJobs(req, res);

            expect(knex).toHaveBeenCalledWith('jobapplications');
            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.SUCCESS,
                res,
                constant.CODE.SUCCESS,
                {},
                1
            );
        });

        it('should return error when name is missing', async () => {
            delete req.body.name;

            await jobApplicationController.applyJobs(req, res);

            expect(logger.error).toHaveBeenCalledWith(
                'Exception error',
                expect.objectContaining({
                    error: 'name is required',
                    client: {
                        ip: req.ip,
                        headers: req.headers,
                        requestBody: req.body,
                    },
                })
            );
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            knex.mockReturnValue({
                insert: jest.fn().mockRejectedValue(error)
            });

            await jobApplicationController.applyJobs(req, res);

            expect(logger.error).toHaveBeenCalledWith(
                'Exception error',
                expect.objectContaining({
                    error: error.message,
                    stack: error.stack,
                    client: {
                        ip: req.ip,
                        headers: req.headers,
                        requestBody: req.body,
                    },
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

        it('should handle missing resume file', async () => {
            delete req.file;

            await jobApplicationController.applyJobs(req, res);

            expect(logger.error).toHaveBeenCalled();
            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.INTERNAL_ERROR,
                res,
                constant.CODE.INTERNAL_SERVER_ERROR,
                {},
                0
            );
        });

        it('should validate required fields', async () => {
            const requiredFields = ['email', 'phone', 'experience', 'dob', 'jobtype'];

            for (const field of requiredFields) {
                const testReq = {
                    ...req,
                    body: { ...req.body }
                };
                delete testReq.body[field];

                await jobApplicationController.applyJobs(testReq, res);

                expect(logger.error).toHaveBeenCalledWith(
                    'Exception error',
                    expect.objectContaining({
                        error: expect.stringContaining('required'),
                        client: {
                            ip: testReq.ip,
                            headers: testReq.headers,
                            requestBody: testReq.body,
                        },
                    })
                );
            }
        });

        it('should insert correct job application data', async () => {
            const insertMock = jest.fn().mockResolvedValue([1]);
            knex.mockReturnValue({
                insert: insertMock
            });

            await jobApplicationController.applyJobs(req, res);

            expect(insertMock).toHaveBeenCalledWith({
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                experience: req.body.experience,
                dob: req.body.dob,
                jobtype: req.body.jobtype,
                resume: req.file.key
            });
        });
    });
});