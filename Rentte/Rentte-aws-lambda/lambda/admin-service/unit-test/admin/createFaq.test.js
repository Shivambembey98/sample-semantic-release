const knex = require('../../db/db');
const constant = require('../../config/constant');
const { sendResponse } = require('../../config/helper');
const faqController = require('../../admin/controller/faqController');
jest.mock('../../db/db');
jest.mock('../../config/helper');
jest.mock('../../config/winston');

describe('createFaq', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            body: {
                faqcategoryid: '1',
                questiontype: 'text',
                questionanswer: 'Sample Answer',
            },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        knex.mockReset();
        sendResponse.mockReset();
    });

    test('should return BAD_REQUEST if faqcategoryid is not provided', async () => {
        req.body.faqcategoryid = undefined;
        await faqController.createFaq(req, res);
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.REQUIRED_FIELDS.replace('{{key}}', 'faq category id'),
            res,
            constant.CODE.BAD_REQUEST,
            {},
            0,
        );
    });

    test('should return BAD_REQUEST if questiontype is not provided', async () => {
        req.body.questiontype = undefined;

        await faqController.createFaq(req, res);
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.REQUIRED_FIELDS.replace('{{key}}', 'questiontype'),
            res,
            constant.CODE.BAD_REQUEST,
            {},
            0,
        );
    });

    test('should return BAD_REQUEST if questionanswer is not provided', async () => {
        req.body.questionanswer = undefined;

        await faqController.createFaq(req, res);

        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.REQUIRED_FIELDS.replace('{{key}}', 'questionanswer'),
            res,
            constant.CODE.BAD_REQUEST,
            {},
            0,
        );
    });

    test('should return NOT_FOUND if category does not exist', async () => {
        knex.mockImplementationOnce(() => ({
            where: jest.fn().mockReturnThis(),
            first: jest.fn().mockResolvedValue(null), // Simulate category not found
        }));

        await faqController.createFaq(req, res);

        expect(knex).toHaveBeenCalledWith('faqcategories');
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'faq category not found'),
            res,
            constant.CODE.BAD_REQUEST,
            {},
            0,
        );
    });

    test('should create FAQ successfully', async () => {
        const mockWhere = jest.fn().mockReturnThis();
        const mockFirst = jest.fn().mockResolvedValue({ id: 1, name: 'Sample Category' }); // Simulate category found
        const mockInsert = jest.fn().mockResolvedValue([1]); // Simulate successful insert

        knex.mockImplementation((table) => {
            if (table === 'faqcategories') {
                return { where: mockWhere, first: mockFirst };
            }
            if (table === 'faq') {
                return { insert: mockInsert };
            }
        });

        await faqController.createFaq(req, res);

        expect(mockWhere).toHaveBeenCalledWith({ id: '1' });
        expect(mockFirst).toHaveBeenCalledTimes(1);
        expect(mockInsert).toHaveBeenCalledWith({
            faqcategoryid: '1',
            questiontype: 'text',
            questionanswer: JSON.stringify('Sample Answer'),
            categorytype: 'Sample Category'
        });
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

        await faqController.createFaq(req, res);

        expect(sendResponse).toHaveBeenCalledWith(
            'Unexpected Error',
            res,
            constant.CODE.INTERNAL_SERVER_ERROR,
            {},
            0,
        );
    });
});
