const AWSMock = require('aws-sdk-mock');
const AWS = require('aws-sdk');
const { updateBlog } = require('../blog/controller/blogController'); // Adjust path
const { sendResponse } = require('../config/helper'); // Adjust path
const constant = require('../config/constant'); // Adjust path
const logger = require('../config/winston'); // Adjust path
const knex = require('../db/db'); // Adjust path

jest.mock('../db/db');
jest.mock('../config/winston');
jest.mock('../config/helper');

describe('updateBlog API', () => {
    beforeEach(() => {
        jest.spyOn(logger, 'info').mockImplementation(() => {});
        jest.spyOn(logger, 'error').mockImplementation(() => {});
     });

    afterEach(() => {
        AWSMock.restore();
        jest.clearAllMocks();
    });

    test('should handle errors during S3 upload', async () => {
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('S3', 'upload', (params, callback) => {
            callback(new Error('Mock S3 Upload Error'));
        });

        const req = {
            body: {
                blogid: 1,
                title: 'Updated Blog',
                content: '<p>Updated content</p>',
            },
            files: [{ key: 'updated-image.jpg' }],
            ip: '127.0.0.1',
        };
        const res = {};

        await updateBlog(req, res);
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.INTERNAL_ERROR,
            res,
            constant.CODE.INTERNAL_SERVER_ERROR,
            {},
            0
        );
    });

    test('should handle errors during S3 deleteObject', async () => {
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('S3', 'upload', (params, callback) => {
            callback(null, { Key: params.Key });
        });
        AWSMock.mock('S3', 'deleteObject', (params, callback) => {
            callback(new Error('Mock S3 Delete Object Error'));
        });

        const mockBlog = { id: 1, title: 'Updated Blog', contenturl: 'old_content.html', blogimage: ['old_image.jpg'] };
        knex.mockReturnValue({
            where: jest.fn().mockResolvedValue([mockBlog]),
            update: jest.fn().mockResolvedValue(1),
        });

        const req = {
            body: {
                blogid: 1,
                title: 'Updated Blog',
                content: '<p>Updated content</p>',
            },
            files: [{ key: 'updated-image.jpg' }],
            ip: '127.0.0.1',
        };
        const res = {};

        await updateBlog(req, res);
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.INTERNAL_ERROR,
            res,
            constant.CODE.INTERNAL_SERVER_ERROR,
            {},
            0
        );
    });

    test('should handle database update errors', async () => {
        AWSMock.setSDKInstance(AWS);
        AWSMock.mock('S3', 'upload', (params, callback) => {
            callback(null, { Key: params.Key });
        });

        knex.mockReturnValue({
            where: jest.fn().mockResolvedValue([{ id: 1, title: 'Existing Blog' }]),
            update: jest.fn().mockRejectedValue(new Error('Mock DB Error')),
        });

        const req = {
            body: {
                blogid: 1,
                title: 'Updated Blog',
                content: '<p>Updated content</p>',
            },
            files: [{ key: 'updated-image.jpg' }],
            ip: '127.0.0.1',
        };
        const res = {};

        await updateBlog(req, res);
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.INTERNAL_ERROR,
            res,
            constant.CODE.INTERNAL_SERVER_ERROR,
            {},
            0
        );
    });

    test('should handle missing required fields', async () => {
        const req = {
            body: {}, // Missing blogid, title, etc.
            files: [],
            ip: '127.0.0.1',
        };
        const res = {};

        await updateBlog(req, res);
        expect(sendResponse).toHaveBeenCalledWith(
            'blog id not found',
            res,
            constant.CODE.BAD_REQUEST,
            {},
            0
        );
    });
});
