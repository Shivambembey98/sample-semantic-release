const authController = require('../../user/controller/authController'); // Adjust path as necessary
const constant = require('../../config/constant')
const knex = require('../../db/db'); // Replace with actual knex instance or mock it
const logger = require("../../config/winston"); // Replace with actual logger or mock it
const { sendResponse } = require('../../config/helper');
jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock("../../config/helper");

describe('legalPolicyAcceptance', () => {
   let req; let res;

   beforeEach(() => {
      req = {
         user: { id: 1 },
         ip: '127.0.0.1',
         body: { legalPolicyAcceptance: true },
         headers: {},
      };
      res = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn(),
      };
      knex.mockReset();
      jest.spyOn(logger, 'info').mockImplementation(() => {});
      jest.spyOn(logger, 'error').mockImplementation(() => {});
   });

   test('should return NOT_FOUND if legalPolicyAcceptance is not provided', async () => {
      req.body = {};
      await authController.legalPolicyAcceptance(req, res);
      expect(sendResponse).toHaveBeenCalledWith(constant.MESSAGE.NOT_FOUND.replace('{{key}}', 
         'status of legal policy acceptance'),
         res,constant.CODE.NOT_FOUND,
         {},0);
   });
   test('should return ALREADY_EXIST if policy already accepted', async () => {
      knex.mockImplementation(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue({ id: 1, legalPolicyAcceptance: true }),
      }));
      await authController.legalPolicyAcceptance(req, res);
       expect(sendResponse).toHaveBeenCalledWith(constant.MESSAGE.LEGAL_POLICY_ACCEPTANCE,res, 
            constant.CODE.ALREADY_EXIST,{},0);
   });
   test('should return SUCCESS if policy acceptance status is updated', async () => {
      knex.mockImplementation(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null),
         update: jest.fn().mockResolvedValue(1),
      }));
      await authController.legalPolicyAcceptance(req, res);
      expect(sendResponse).toHaveBeenCalledWith(constant.MESSAGE.SUCCESS,res, 
         constant.CODE.SUCCESS,{},1);
   });
   test('should handle database update failure and return BAD_REQUEST', async () => {
      knex.mockImplementation(() => ({
         where: jest.fn().mockReturnThis(),
         first: jest.fn().mockResolvedValue(null),
         update: jest.fn().mockResolvedValue(0),
      }));
      await authController.legalPolicyAcceptance(req, res);
      expect(sendResponse).toHaveBeenCalledWith(constant.MESSAGE.BAD_REQUEST,res, 
         constant.CODE.BAD_REQUEST,{},0);
   });
   test('should handle exceptions and return INTERNAL_SERVER_ERROR', async () => {
      knex.mockImplementationOnce(() => {
         throw new Error('Internal Server Error');
     });
      await authController.legalPolicyAcceptance(req, res);
      expect(sendResponse).toHaveBeenCalledWith(constant.MESSAGE.INTERNAL_ERROR,res, 
         constant.CODE.INTERNAL_SERVER_ERROR,{},0);
   });
});
