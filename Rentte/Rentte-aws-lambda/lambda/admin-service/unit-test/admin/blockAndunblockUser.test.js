const userController = require('../../admin/controller/userController');
const knex = require('../../db/db');
const constant = require('../../config/constant');
const logger = require('../../config/winston');
const { sendResponse } = require('../../config/helper');

jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock('../../config/helper');

describe('blockAndUnblockUser', () => {
   let req;
   let res;

   beforeEach(() => {
      req = {
         body: {
            userId: 1,
            isBlock: true, // or false for unblocking
         },
         ip: '127.0.0.1',
         headers: {},
      };

      res = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn(),
      };

      jest.spyOn(logger, 'info').mockImplementation(() => {});
      jest.spyOn(logger, 'error').mockImplementation(() => {});

      knex.mockReset();
      sendResponse.mockReset();
   });

   test('should successfully block or unblock user', async () => {
      // Simulate an existing user
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 1, status: true }), // User exists
      }));

      // Simulate successful update of user status
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         update: jest.fn().mockResolvedValue(1), // Successful update
      }));

      await userController.blockAndUnblockUser(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         constant.MESSAGE.SUCCESS,
         res,
         constant.CODE.SUCCESS,
         {},
         1,
      );
   });

   test('should handle unexpected errors gracefully', async () => {
      // Simulate an unexpected error
      knex.mockImplementationOnce(() => {
         throw new Error('Unexpected Error');
      });

      await userController.blockAndUnblockUser(req, res);

      expect(sendResponse).toHaveBeenCalledWith(
         'Unexpected Error',
         res,
         constant.CODE.INTERNAL_SERVER_ERROR,
         {},
         0,
      );
   });
});
