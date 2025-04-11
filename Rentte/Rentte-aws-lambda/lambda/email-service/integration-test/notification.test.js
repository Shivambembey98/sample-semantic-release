const { contactUs, sendEmailNotification, sendBulkEmail } = require('../email/controller/notification');
const { sendResponse } = require('../config/helper');
const { SESClient } = require("@aws-sdk/client-ses");
const AWS = require('aws-sdk');
const AWSMock = require('aws-sdk-mock');
const logger = require('../config/winston');
const constant = require('../config/constant');
const { processMessages } = require('../config/sqsService');

// Mock the required modules
jest.mock('../config/winston');
jest.mock('../config/helper', () => ({
    sendResponse: jest.fn(),
}));
jest.mock('../config/sqsService', () => ({
    processMessages: jest.fn(),
}));

describe('Notification Service Tests', () => {
    beforeAll(() => {
        AWSMock.setSDKInstance(AWS);
        jest.spyOn(logger, 'info').mockImplementation(() => {});
        jest.spyOn(logger, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        AWSMock.restore();
        jest.clearAllMocks();
    });

    describe('sendEmailNotification', () => {
        // Increase timeout to 10 seconds
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
});
