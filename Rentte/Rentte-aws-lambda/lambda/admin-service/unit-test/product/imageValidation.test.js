const productController = require('../../admin/controller/productController');
const knex = require('../../db/db');
const { sendResponse } = require('../../config/helper');
const constant = require('../../config/constant');
const logger = require('../../config/winston');
const axios = require('axios');
const sharp = require('sharp');
const { s3Client } = require('../../utils/s3Client');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

// Mock all external dependencies
jest.mock('../../db/db');
jest.mock('../../config/helper');
jest.mock('../../config/winston');
jest.mock('axios');
jest.mock('sharp');
jest.mock('../../utils/s3Client');
jest.mock('@aws-sdk/client-s3');

describe('imageValidation', () => {
    let req;
    let res;
    const mockProductImages = ['image1.jpg', 'image2.jpg'];
    const mockWatermarkedKey = 'watermarked/test-key.jpg';

    beforeEach(() => {
        // Reset environment variables
        process.env.RENTTE_IMAGE_URL = 'http://test-url.com/';
        process.env.AWS_BUCKET_NAME = 'test-bucket';

        req = {
            body: {
                id: 1
            },
            ip: '127.0.0.1',
            headers: {}
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Mock sharp functionality
        const mockSharpInstance = {
            composite: jest.fn().mockReturnThis(),
            toBuffer: jest.fn().mockResolvedValue(Buffer.from('mock-image-data'))
        };
        sharp.mockReturnValue(mockSharpInstance);

        // Mock axios response
        axios.mockResolvedValue({
            data: Buffer.from('mock-image-data')
        });

        // Mock S3 client
        s3Client.send.mockResolvedValue({});

        // Reset all mocks
        jest.clearAllMocks();
    });

    test('should return not found if product does not exist', async () => {
        knex.mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue(null)
        }));

        await productController.imageValidation(req, res);

        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'product'),
            res,
            constant.CODE.NOT_FOUND,
            {},
            0
        );
    });

    test('should return not found if productImages is empty or not an array', async () => {
        knex.mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue({ id: 1, productImages: [] })
        }));

        await productController.imageValidation(req, res);

        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'productImages'),
            res,
            constant.CODE.NOT_FOUND,
            {},
            0
        );
    });

    test('should successfully process and watermark images', async () => {
        // Mock product retrieval
        knex.mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue({ id: 1, productImages: mockProductImages })
        }));

        // Mock product update
        knex.mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            update: jest.fn().mockResolvedValue(1)
        }));

        // Mock Date.now and Math.random for predictable watermarkedKey
        const originalDateNow = Date.now;
        const originalMathRandom = Math.random;
        Date.now = jest.fn(() => 1234567890);
        Math.random = jest.fn(() => 0.123456789);

        await productController.imageValidation(req, res);

        // Restore original functions
        Date.now = originalDateNow;
        Math.random = originalMathRandom;

        // Verify axios calls
        expect(axios).toHaveBeenCalledTimes(mockProductImages.length);
        
        // Verify sharp processing
        expect(sharp).toHaveBeenCalledTimes(mockProductImages.length);
        
        // Verify S3 uploads
        expect(s3Client.send).toHaveBeenCalledTimes(mockProductImages.length);
        
        // Verify database update
        expect(knex).toHaveBeenCalledWith('products');
        
        // Verify successful response
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            {},
            1
        );
    });

    test('should handle axios error', async () => {
        knex.mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue({ id: 1, productImages: mockProductImages })
        }));

        axios.mockRejectedValue(new Error('Network error'));

        await productController.imageValidation(req, res);

        expect(logger.error).toHaveBeenCalled();
        expect(sendResponse).toHaveBeenCalledWith(
            'Network error',
            res,
            constant.CODE.INTERNAL_SERVER_ERROR,
            {},
            0
        );
    });

    test('should handle sharp processing error', async () => {
        knex.mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue({ id: 1, productImages: mockProductImages })
        }));

        const mockSharpInstance = {
            composite: jest.fn().mockReturnThis(),
            toBuffer: jest.fn().mockRejectedValue(new Error('Image processing error'))
        };
        sharp.mockReturnValue(mockSharpInstance);

        await productController.imageValidation(req, res);

        expect(logger.error).toHaveBeenCalled();
        expect(sendResponse).toHaveBeenCalledWith(
            'Image processing error',
            res,
            constant.CODE.INTERNAL_SERVER_ERROR,
            {},
            0
        );
    });

    test('should handle S3 upload error', async () => {
        knex.mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue({ id: 1, productImages: mockProductImages })
        }));

        s3Client.send.mockRejectedValue(new Error('S3 upload failed'));

        await productController.imageValidation(req, res);

        expect(logger.error).toHaveBeenCalled();
        expect(sendResponse).toHaveBeenCalledWith(
            'S3 upload failed',
            res,
            constant.CODE.INTERNAL_SERVER_ERROR,
            {},
            0
        );
    });

    test('should handle database update error', async () => {
        knex.mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue({ id: 1, productImages: mockProductImages })
        }));

        knex.mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            update: jest.fn().mockRejectedValue(new Error('Database update failed'))
        }));

        await productController.imageValidation(req, res);

        expect(logger.error).toHaveBeenCalled();
        expect(sendResponse).toHaveBeenCalledWith(
            'Database update failed',
            res,
            constant.CODE.INTERNAL_SERVER_ERROR,
            {},
            0
        );
    });
});