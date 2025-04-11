const knex = require('../../db/db');
const constant = require('../../config/constant');
const { sendResponse } = require('../../config/helper');
const faqController = require('../../admin/controller/faqController');

jest.mock('../../db/db');
jest.mock('../../config/helper');
jest.mock('../../config/winston');

describe('deleteFaq', () => {
    let req, res;

    beforeEach(() => {
        req = { query: { id: '1' } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        jest.clearAllMocks();
    });

    test('should return an error if id is not provided', async () => {
        req.query.id = undefined;
        await faqController.deleteFaq(req, res);
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'faq id'),
            res,
            constant.CODE.BAD_REQUEST,
            {},
            0
        );
    });

    test('should return an error if FAQ is not found', async () => {
        const mockWhere = jest.fn().mockReturnThis();
        const mockFirst = jest.fn().mockResolvedValue(null);
        knex.mockImplementation((table) => {
            if (table === 'faq') {
                return { where: mockWhere, first: mockFirst };
            }
        });
        await faqController.deleteFaq(req, res);
        expect(mockWhere).toHaveBeenCalledWith({ id: '1' });
        expect(mockFirst).toHaveBeenCalledTimes(1);
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'faq not found'),
            res,
            constant.CODE.BAD_REQUEST,
            {},
            0
        );
    });
    test('should delete FAQ successfully', async () => {
        const mockWhere = jest.fn().mockReturnThis();
        const mockFirst = jest.fn().mockResolvedValue({ id: 1, status: true });
        const mockUpdate = jest.fn(() => ({ where: mockWhere }));
        knex.mockImplementation((table) => {
            if (table === 'faq') {
                return { where: mockWhere, first: mockFirst, update: mockUpdate };
            }
        });
        await faqController.deleteFaq(req, res);
        expect(mockWhere).toHaveBeenCalledWith({ id: '1' });
        expect(mockFirst).toHaveBeenCalledTimes(1);
        expect(mockUpdate).toHaveBeenCalledWith({ status: false });
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            {},
            1
        );
    });

    test('should handle unexpected errors gracefully', async () => {
        const mockWhere = jest.fn(() => {
            throw new Error('Database error');
        });
        knex.mockImplementation(() => ({ where: mockWhere }));
        await faqController.deleteFaq(req, res);
        expect(sendResponse).toHaveBeenCalledWith(
            'Database error',
            res,
            constant.CODE.INTERNAL_SERVER_ERROR,
            {},
            0
        );
    });
});
