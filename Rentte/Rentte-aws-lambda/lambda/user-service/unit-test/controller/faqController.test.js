const faqController = require('../../user/controller/faqController');
const knex = require('../../db/db');
const { sendResponse, commonLogger } = require('../../config/helper');
const logger = require('../../config/winston');
const constant = require('../../config/constant');

jest.mock('../../db/db');
jest.mock('../../config/helper');
jest.mock('../../config/winston');

describe('FAQ Controller', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            query: {},
            body: {},
            ip: '127.0.0.1',
            headers: {},
            user: { id: 1 }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('getAllFaqCategory', () => {
        it('should return faq categories with pagination', async () => {
            const mockCategories = [
                { id: 1, name: 'Category 1' },
                { id: 2, name: 'Category 2' }
            ];

            const mockCountResult = [{ count: '2' }];

            knex.mockReturnValue({
                where: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockResolvedValue(mockCategories),
                count: jest.fn().mockResolvedValue(mockCountResult)
            });

            await faqController.getAllFaqCategory(req, res);

            expect(knex).toHaveBeenCalledWith('faqcategories');
            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.SUCCESS,
                res,
                constant.CODE.SUCCESS,
                {
                    faqCategories: mockCategories,
                    pagination: {
                        page: 1,
                        limit: 10,
                        totalCount: '2',
                        totalPages: 1
                    }
                },
                1
            );
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            knex.mockImplementation(() => {
                throw error;
            });

            await faqController.getAllFaqCategory(req, res);

            expect(logger.error).toHaveBeenCalled();
            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.INTERNAL_ERROR,
                res,
                constant.CODE.INTERNAL_SERVER_ERROR,
                {},
                0
            );
        });

        it('should handle pagination parameters', async () => {
            req.query.page = '2';
            const mockCategories = [{ id: 3, name: 'Category 3' }];
            const mockCountResult = [{ count: '5' }];

            knex.mockReturnValue({
                where: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockResolvedValue(mockCategories),
                count: jest.fn().mockResolvedValue(mockCountResult)
            });

            await faqController.getAllFaqCategory(req, res);

            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.SUCCESS,
                res,
                constant.CODE.SUCCESS,
                {
                    faqCategories: mockCategories,
                    pagination: {
                        page: 2,
                        limit: 10,
                        totalCount: '5',
                        totalPages: 1
                    }
                },
                1
            );
        });
    });

    describe('getAllFaq', () => {
        it('should return faqs with search and pagination', async () => {
            req.query = {
                search: 'test',
                page: '1'
            };

            const mockFaqs = [
                { id: 1, questiontype: 'test question' }
            ];
            const mockCountResult = [{ count: '1' }];

            const mockQuery = {
                andWhere: jest.fn().mockReturnThis(),
                clone: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                offset: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockResolvedValue(mockFaqs),
                count: jest.fn().mockResolvedValue(mockCountResult)
            };

            knex.mockReturnValue(mockQuery);

            await faqController.getAllFaq(req, res);

            expect(mockQuery.andWhere).toHaveBeenCalledWith(
                'questiontype',
                'ILIKE',
                '%test%'
            );
            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.SUCCESS,
                res,
                constant.CODE.SUCCESS,
                {
                    faqlist: mockFaqs,
                    pagination: {
                        page: 1,
                        limit: 10,
                        totalCount: '1',
                        totalPages: 1
                    }
                },
                1
            );
        });

        it('should filter by faqcategoryid', async () => {
            req.query = {
                faqcategoryid: '1'
            };

            const mockFaqs = [
                { id: 1, faqcategoryid: '1' }
            ];
            const mockCountResult = [{ count: '1' }];

            const mockQuery = {
                andWhere: jest.fn().mockReturnThis(),
                clone: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                offset: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockResolvedValue(mockFaqs),
                count: jest.fn().mockResolvedValue(mockCountResult)
            };

            knex.mockReturnValue(mockQuery);

            await faqController.getAllFaq(req, res);

            expect(mockQuery.andWhere).toHaveBeenCalledWith({ faqcategoryid: '1' });
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            knex.mockImplementation(() => {
                throw error;
            });

            await faqController.getAllFaq(req, res);

            expect(logger.error).toHaveBeenCalled();
            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.INTERNAL_ERROR,
                res,
                constant.CODE.INTERNAL_SERVER_ERROR,
                {},
                0
            );
        });
    });

    describe('getFaqDetails', () => {
        it('should return faq details when id is provided', async () => {
            req.query = { id: '1' };
            const mockFaq = { id: '1', questiontype: 'test' };

            knex.mockReturnValue({
                where: jest.fn().mockReturnThis(),
                first: jest.fn().mockResolvedValue(mockFaq)
            });

            await faqController.getFaqDetails(req, res);

            expect(knex).toHaveBeenCalledWith('faq');
            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.SUCCESS,
                res,
                constant.CODE.SUCCESS,
                { faqDetails: mockFaq },
                1
            );
        });

        it('should return error when id is not provided', async () => {
            req.query = {};

            await faqController.getFaqDetails(req, res);

            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'faq id'),
                res,
                constant.CODE.BAD_REQUEST,
                {},
                0
            );
        });

        it('should handle database errors', async () => {
            req.query = { id: '1' };
            const error = new Error('Database error');
            knex.mockImplementation(() => {
                throw error;
            });

            await faqController.getFaqDetails(req, res);

            expect(logger.error).toHaveBeenCalled();
            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.INTERNAL_ERROR,
                res,
                constant.CODE.INTERNAL_SERVER_ERROR,
                {},
                0
            );
        });
    });

    describe('getFaqByCategory', () => {
        it('should return faqs when category id is provided', async () => {
            req.query = { faqcategoryid: '1' };
            const mockFaqs = [
                { id: '1', faqcategoryid: '1' },
                { id: '2', faqcategoryid: '1' }
            ];

            knex.mockReturnValue({
                where: jest.fn().mockResolvedValue(mockFaqs)
            });

            await faqController.getFaqByCategory(req, res);

            expect(knex).toHaveBeenCalledWith('faq');
            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.SUCCESS,
                res,
                constant.CODE.SUCCESS,
                { faqList: mockFaqs },
                1
            );
        });

        it('should return error when category id is not provided', async () => {
            req.query = {};

            await faqController.getFaqByCategory(req, res);

            expect(sendResponse).toHaveBeenCalledWith(
                constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'faq id'),
                res,
                constant.CODE.BAD_REQUEST,
                {},
                0
            );
        });

        it('should handle database errors', async () => {
            req.query = { faqcategoryid: '1' };
            const error = new Error('Database error');
            knex.mockImplementation(() => {
                throw error;
            });

            await faqController.getFaqByCategory(req, res);

            expect(logger.error).toHaveBeenCalled();
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