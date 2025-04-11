const { contactUs, sendEmailNotification, sendBulkEmail } = require('../email/controller/notification');
const { sendResponse } = require('../config/helper');
const { sendMail } = require('../helper/mailSmtp');
const AWS = require('aws-sdk');
const AWSMock = require('aws-sdk-mock');
const logger = require('../config/winston');
const constant = require('../config/constant');
const { processMessages, createBatches } = require('../config/sqsService');
const knex = require('../db/db');

jest.mock('../config/winston');
jest.mock('../helper/mailSmtp');
jest.mock('../config/helper', () => ({
    sendResponse: jest.fn(),
}));
jest.mock('../config/sqsService', () => ({
    processMessages: jest.fn(),
    createBatches: jest.fn().mockResolvedValue({}),
}));
jest.mock('../db/db', () => jest.fn());

describe('Notification Service Tests', () => {
    beforeAll(() => {
        AWSMock.setSDKInstance(AWS);
        jest.spyOn(logger, 'info').mockImplementation(() => {});
        jest.spyOn(logger, 'error').mockImplementation(() => {});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        AWSMock.restore();
    });

    describe('contactUs', () => {
        test('should send admin and user emails successfully', async () => {
            sendMail.mockResolvedValueOnce({}).mockResolvedValueOnce({});

            const req = {
                body: {
                    email: 'test@example.com',
                    message: 'This is a test message',
                },
                ip: '127.0.0.1',
                headers: {}
            };
            const res = {};

            await contactUs(req, res);

            expect(sendMail).toHaveBeenCalledTimes(2);
            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.SUCCESS,
                res,
                constant.CODE.SUCCESS,
                {},
                1
            );
        });

        test('should handle validation error', async () => {
            const req = {
                body: {},
                ip: '127.0.0.1',
                headers: {}
            };
            const res = {};

            await contactUs(req, res);

            expect(sendResponse).toHaveBeenCalledWith(
                expect.any(String),
                res,
                constant.CODE.INPUT_VALIDATION,
                {},
                0
            );
        });

        test('should handle exceptions contact us', async () => {
            sendMail.mockRejectedValue(new Error('SMTP Error'));

            const req = {
                body: {
                    email: 'test@example.com',
                    message: 'This is a test message',
                },
                ip: '127.0.0.1',
                headers: {}
            };
            const res = {};

            await contactUs(req, res);

            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.INTERNAL_ERROR,
                res,
                constant.CODE.INTERNAL_SERVER_ERROR,
                {},
                0
            );
        });
    });

    describe('sendEmailNotification', () => {
        jest.setTimeout(10000);

        test('should process messages and send emails', async () => {
            // Mock processMessages to return false (indicating successful processing)
            processMessages.mockResolvedValueOnce(false);

            const req = {};
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };

            await sendEmailNotification(req, res);

            expect(processMessages).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Emails sent successfully" });
        });

        test('should handle empty queue', async () => {
            // Mock processMessages to return false (indicating no messages)
            processMessages.mockImplementationOnce(() => {
                throw new Error('No messages in queue');
            });

            const req = {};
            const res = {};

            await sendEmailNotification(req, res);

            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.INTERNAL_ERROR,
                res,
                constant.CODE.INTERNAL_SERVER_ERROR,
                {},
                0
            );
        });

        test('should handle exceptions send email notification', async () => {
            processMessages.mockRejectedValueOnce(new Error('Mock SQS Error'));

            const req = {};
            const res = {};

            await sendEmailNotification(req, res);

            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.INTERNAL_ERROR,
                res,
                constant.CODE.INTERNAL_SERVER_ERROR,
                {},
                0
            );
        });
    });

    describe('sendBulkEmail', () => {
        beforeEach(() => {
            // Mock knex queries
            const mockKnex = jest.fn().mockReturnThis();
            mockKnex.select = jest.fn().mockReturnThis();
            mockKnex.where = jest.fn().mockReturnThis();
            mockKnex.whereIn = jest.fn().mockReturnThis();
            mockKnex.andWhere = jest.fn().mockReturnThis();
            mockKnex.whereNotNull = jest.fn().mockResolvedValue([]);
        });

        test('should send bulk email to partners successfully', async () => {
            const mockEmails = [
                { email: 'partner1@example.com' },
                { email: 'partner2@example.com' }
            ];

            // Mock knex for partner query
            knex.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                whereNotNull: jest.fn().mockResolvedValue(mockEmails)
            });

            const req = {
                body: {
                    subject: 'Test Subject',
                    message: 'Test Body',
                    userType: 'partner'
                },
                ip: '127.0.0.1',
                headers: {}
            };
            const res = {};

            await sendBulkEmail(req, res);

            const expectedEmails = mockEmails.map(user => user.email);
            expect(createBatches).toHaveBeenCalledWith(
                expectedEmails,
                req.body.subject,
                { message: req.body.message, userType: 'partner' }
            );

            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.SUCCESS,
                res,
                constant.CODE.SUCCESS,
                {},
                1
            );
        });

        test('should send bulk email to users successfully', async () => {
            const mockEmails = [
                { email: 'user1@example.com' },
                { email: 'user2@example.com' }
            ];

            // Mock knex for user query
            knex.mockReturnValue({
                select: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                whereNotNull: jest.fn().mockResolvedValue(mockEmails)
            });

            const req = {
                body: {
                    subject: 'Test Subject',
                    message: 'Test Body',
                    userType: 'user'
                },
                ip: '127.0.0.1',
                headers: {}
            };
            const res = {};

            await sendBulkEmail(req, res);

            const expectedEmails = mockEmails.map(user => user.email);
            expect(createBatches).toHaveBeenCalledWith(
                expectedEmails,
                req.body.subject,
                { message: req.body.message, userType: 'user' }
            );

            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.SUCCESS,
                res,
                constant.CODE.SUCCESS,
                {},
                1
            );
        });

        test('should handle empty email list validation', async () => {
            const req = {
                body: {
                    emailList: [],
                    subject: 'Test Subject',
                    message: 'Test Body'
                },
                ip: '127.0.0.1',
                headers: {}
            };
            const res = {};

            await sendBulkEmail(req, res);

            expect(sendResponse).toHaveBeenCalledWith(
                'Email list is required',
                res,
                constant.CODE.BAD_REQUEST,
                {},
                0
            );
        });

        test('should handle unverified emails', async () => {
            const unverifiedEmails = [{ email: 'unverified@example.com' }];
            
            knex.mockReturnValue({
                whereIn: jest.fn().mockReturnThis(),
                andWhere: jest.fn().mockReturnThis(),
                select: jest.fn().mockResolvedValue(unverifiedEmails)
            });

            const req = {
                body: {
                    emailList: ['unverified@example.com'],
                    subject: 'Test Subject',
                    message: 'Test Body'
                },
                ip: '127.0.0.1',
                headers: {}
            };
            const res = {};

            await sendBulkEmail(req, res);

            expect(sendResponse).toHaveBeenCalledWith(
                'Email is not verified',
                res,
                constant.CODE.BAD_REQUEST,
                {},
                0
            );
        });

        test('should handle errors', async () => {
            const error = new Error('Test error');
            knex.mockImplementation(() => {
                throw error;
            });

            const req = {
                body: {
                    emailList: ['test@example.com'],
                    subject: 'Test Subject',
                    message: 'Test Body'
                },
                ip: '127.0.0.1',
                headers: {}
            };
            const res = {};

            await sendBulkEmail(req, res);

            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.INTERNAL_ERROR,
                res,
                constant.CODE.INTERNAL_SERVER_ERROR,
                {},
                0
            );
        });
    });
});
