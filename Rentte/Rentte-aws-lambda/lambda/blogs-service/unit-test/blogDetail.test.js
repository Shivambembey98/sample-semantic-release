const { blogDetail } = require('../blog/controller/blogController');
const { sendResponse } = require('../config/helper')
const constant = require('../config/constant');
const knex = require('../db/db');

jest.mock('../db/db');
jest.mock('../config/winston');
jest.mock("../config/helper");


describe('blogDetail API', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test('should return an error if the blog is not found', async () => {
        knex.mockReturnValue({
            select: jest.fn().mockResolvedValue([]), // No blog found
            where: jest.fn().mockResolvedValue([]),
        });

        const req = {
            query: {
                blogid: 1,
            },
            ip: '127.0.0.1',
        };
        const res = {};
        await blogDetail(req, res);
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.INTERNAL_ERROR,
            res,
            constant.CODE.INTERNAL_SERVER_ERROR,
            {},
            0
        );
    });

    test('should handle missing blogid in the query', async () => {
        const req = {
            query: {}, // No blogid provided
            ip: '127.0.0.1',
        };
        const res = {};
        await blogDetail(req, res);
    
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'blog id'),
            res,
            constant.CODE.BAD_REQUEST,
            {},
            0
        );
    });
    
});
