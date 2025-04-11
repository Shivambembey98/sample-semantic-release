const knex = require('../../db/db');
const constant = require('../../config/constant');
const { sendResponse } = require('../../config/helper');
const faqController = require('../../admin/controller/faqController');
const logger = require('../../config/winston');

jest.mock('../../db/db');
jest.mock('../../config/helper');
jest.mock('../../config/winston');

describe('editFaqCategory', () => {
    let req;
    let res;
 
    beforeEach(() => {
       req = {
          body: {
             name: 'Updated Category Name',
             id: '1',  // Added id in the body
             description: 'Updated Description'
          },
          file: {
             key: 'updated-icon-url',
          },
       };
 
       res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
       };

       knex.mockReset();
       sendResponse.mockReset();
    });
 
    test('should return BAD_REQUEST if category id is not provided', async () => {
       req.body.id = undefined;
 
       await faqController.editFaqCategory(req, res);
 
       expect(sendResponse).toHaveBeenCalledWith(
          constant.MESSAGE.REQUIRED_FIELDS.replace('{{key}}', 'category id'),
          res,
          constant.CODE.BAD_REQUEST,
          {},
          0,
       );
    });

    test('should return BAD_REQUEST if icon image is not provided', async () => {
       req.file.key = null;
 
       await faqController.editFaqCategory(req, res);
 
       expect(sendResponse).toHaveBeenCalledWith(
          constant.MESSAGE.REQUIRED_FIELDS.replace('{{key}}', 'icon image'),
          res,
          constant.CODE.BAD_REQUEST,
          {},
          0,
       );
    });
 
    test('should return BAD_REQUEST if category is not found', async () => {
       knex.mockImplementationOnce(() => ({
          where: jest.fn().mockReturnThis(),
          first: jest.fn().mockResolvedValue(null), // Simulate no category found
       }));
       
       await faqController.editFaqCategory(req, res);
       
       expect(sendResponse).toHaveBeenCalledWith(
          constant.MESSAGE.NOT_FOUND.replace('{{key}}', 'faq category not found'),
          res,
          constant.CODE.BAD_REQUEST,
          {},
          0,
       );
    });
 
    test('should update category successfully', async () => {
        const mockWhere = jest.fn().mockReturnThis();
        const mockFirst = jest.fn().mockResolvedValue({ id: 1, name: 'Old Name' });
        const mockUpdate = jest.fn().mockReturnThis();  // Return this for chaining
        const mockWhereAfterUpdate = jest.fn().mockResolvedValue(1);  // Final resolution

        // Setup the mock chain
        knex.mockReturnValue({
            where: mockWhere,
            first: mockFirst,
            update: mockUpdate,
        });

        // Add where method to the update result
        mockUpdate.mockReturnValue({
            where: mockWhereAfterUpdate
        });

        await faqController.editFaqCategory(req, res);

        // Verify the initial where clause
        expect(mockWhere).toHaveBeenCalledWith({ id: '1' });
        expect(mockFirst).toHaveBeenCalled();

        // Verify the update
        expect(mockUpdate).toHaveBeenCalledWith({
            name: 'Updated Category Name',
            icon: 'updated-icon-url',
            description: 'Updated Description'
        });

        // Verify the where clause after update
        expect(mockWhereAfterUpdate).toHaveBeenCalledWith({ id: '1' });

        // Verify the final response
        expect(sendResponse).toHaveBeenCalledWith(
            constant.MESSAGE.SUCCESS,
            res,
            constant.CODE.SUCCESS,
            {},
            1
        );
    });
 
    test('should handle unexpected errors gracefully', async () => {
       knex.mockImplementationOnce(() => {
          throw new Error('Unexpected Error');
       });
       
       await faqController.editFaqCategory(req, res);
       
       expect(sendResponse).toHaveBeenCalledWith(
          'Unexpected Error',
          res,
          constant.CODE.INTERNAL_SERVER_ERROR,
          {},
          0,
       );
    });
 });
