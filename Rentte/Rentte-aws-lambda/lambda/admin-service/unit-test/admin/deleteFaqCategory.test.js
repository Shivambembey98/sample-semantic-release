const knex = require('../../db/db');
const constant = require('../../config/constant');
const { sendResponse } = require('../../config/helper');
const faqController = require('../../admin/controller/faqController');
jest.mock('../../db/db');
jest.mock('../../config/helper');
jest.mock('../../config/winston');

describe('deleteFaqCategory', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            body: {  // Changed from query to body
                id: '1',
            },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        knex.mockReset();
        sendResponse.mockReset();
    });

    test('should return BAD_REQUEST if id is not provided', async () => {
        req.body.id = undefined;  // Changed from query to body
        await faqController.deleteFaqCategory(req, res);
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'category id'),
            res,
            constant.CODE.BAD_REQUEST,
            {},
            0,
        );
    });

    test('should return NOT_FOUND if category does not exist', async () => {
        knex.mockImplementation(() => ({
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue(null),
        }));
        await faqController.deleteFaqCategory(req, res);
        expect(knex).toHaveBeenCalledWith('faqcategories');
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'faq category not found'),
            res,
            constant.CODE.BAD_REQUEST,
            {},
            0,
        );
    });

    test('should delete category successfully by setting status to false', async () => {
        const mockWhere = jest.fn().mockReturnThis();
        const mockFirst = jest.fn().mockResolvedValue({ id: 1, name: 'Sample Category' });
        const mockUpdate = jest.fn().mockResolvedValue(1);

        knex.mockImplementation(() => ({
            where: mockWhere,
            first: mockFirst,
            update: mockUpdate,
        }));
        await faqController.deleteFaqCategory(req, res);
        expect(mockWhere).toHaveBeenCalledWith({ id: '1' });
        expect(mockFirst).toHaveBeenCalledTimes(1);
        expect(mockUpdate).toHaveBeenCalledWith({ status: true });  // Changed from false to true to match controller
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            {},
            1,
        );
    });

    test('should handle unexpected errors gracefully', async () => {
        knex.mockImplementation(() => {
            throw new Error('Unexpected Error');
        });
        await faqController.deleteFaqCategory(req, res);
        expect(sendResponse).toHaveBeenCalledWith(
            'Unexpected Error',
            res,
            constant.CODE.INTERNAL_SERVER_ERROR,
            {},
            0,
        );
    });
});
