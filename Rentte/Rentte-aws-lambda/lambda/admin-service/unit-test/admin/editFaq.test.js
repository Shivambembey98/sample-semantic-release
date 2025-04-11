const knex = require('../../db/db');
const constant = require('../../config/constant');
const { sendResponse } = require('../../config/helper');
const faqController = require('../../admin/controller/faqController');
jest.mock('../../db/db');
jest.mock('../../config/helper');
jest.mock('../../config/winston');

describe('editFaq', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            body: {
                faqid: '1',  // Changed from id to faqid to match controller
                faqcategoryid: '1',
                questiontype: 'updatedType',
                questionanswer: 'updatedAnswer',
            },
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    test('should return BAD_REQUEST if FAQ id is not provided', async () => {
        req.body.faqid = undefined;

        await faqController.editFaq(req, res);

        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'faq id'),
            res,
            constant.CODE.BAD_REQUEST,
            {},
            0,
        );
    });

    test('should return NOT_FOUND if FAQ does not exist', async () => {
        const mockFirst = jest.fn().mockResolvedValue(null);
        const mockWhere = jest.fn().mockReturnThis();

        knex.mockReturnValue({
            where: mockWhere,
            first: mockFirst,
        });

        await faqController.editFaq(req, res);

        expect(knex).toHaveBeenCalledWith('faq');
        expect(mockWhere).toHaveBeenCalledWith({ id: '1' });
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'faq not found'),
            res,
            constant.CODE.BAD_REQUEST,
            {},
            0,
        );
    });

    test('should update FAQ successfully when both fields are provided', async () => {
        const mockFirst = jest.fn().mockResolvedValue({ 
            id: '1', 
            questiontype: 'oldType', 
            questionanswer: 'oldAnswer' 
        });
        const mockWhere = jest.fn().mockReturnThis();
        const mockUpdate = jest.fn().mockResolvedValue(1);

        knex.mockReturnValue({
            where: mockWhere,
            first: mockFirst,
            update: mockUpdate,
        });

        await faqController.editFaq(req, res);

        expect(knex).toHaveBeenCalledWith('faq');
        expect(mockWhere).toHaveBeenCalledWith({ id: '1' });
        expect(mockUpdate).toHaveBeenCalledWith({
            questiontype: 'updatedType',
            questionanswer: 'updatedAnswer',
        });
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            {},
            1,
        );
    });

    test('should update FAQ successfully when only questiontype is provided', async () => {
        req.body.questionanswer = undefined;

        const mockFirst = jest.fn().mockResolvedValue({ 
            id: '1', 
            questiontype: 'oldType', 
            questionanswer: 'oldAnswer' 
        });
        const mockWhere = jest.fn().mockReturnThis();
        const mockUpdate = jest.fn().mockResolvedValue(1);

        knex.mockReturnValue({
            where: mockWhere,
            first: mockFirst,
            update: mockUpdate,
        });

        await faqController.editFaq(req, res);

        expect(knex).toHaveBeenCalledWith('faq');
        expect(mockWhere).toHaveBeenCalledWith({ id: '1' });
        expect(mockUpdate).toHaveBeenCalledWith({
            questiontype: 'updatedType',
        });
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            {},
            1,
        );
    });

    test('should update FAQ successfully when only questionanswer is provided', async () => {
        req.body.questiontype = undefined;

        const mockFirst = jest.fn().mockResolvedValue({ 
            id: '1', 
            questiontype: 'oldType', 
            questionanswer: 'oldAnswer' 
        });
        const mockWhere = jest.fn().mockReturnThis();
        const mockUpdate = jest.fn().mockResolvedValue(1);

        knex.mockReturnValue({
            where: mockWhere,
            first: mockFirst,
            update: mockUpdate,
        });

        await faqController.editFaq(req, res);

        expect(knex).toHaveBeenCalledWith('faq');
        expect(mockWhere).toHaveBeenCalledWith({ id: '1' });
        expect(mockUpdate).toHaveBeenCalledWith({
            questionanswer: 'updatedAnswer',
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
        await faqController.editFaq(req, res);
        expect(sendResponse).toHaveBeenCalledWith(
            'Unexpected Error',
            res,
            constant.CODE.INTERNAL_SERVER_ERROR,
            {},
            0,
        );
    });

    test('should handle database update failure', async () => {
        const mockFirst = jest.fn().mockResolvedValue({ 
            id: '1', 
            questiontype: 'oldType', 
            questionanswer: 'oldAnswer' 
        });
        const mockWhere = jest.fn().mockReturnThis();
        const mockUpdate = jest.fn().mockRejectedValue(new Error('Database update failed'));

        knex.mockReturnValue({
            where: mockWhere,
            first: mockFirst,
            update: mockUpdate,
        });

        await faqController.editFaq(req, res);

        expect(knex).toHaveBeenCalledWith('faq');
        expect(mockWhere).toHaveBeenCalledWith({ id: '1' });
        expect(sendResponse).toHaveBeenCalledWith(
            'Database update failed',  // This should match error.message
            res,
            constant.CODE.INTERNAL_SERVER_ERROR,
            {},
            0
        );
    });
});
