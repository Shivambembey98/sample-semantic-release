const authController = require('../../user/controller/authController'); // Adjust path as necessary
const constant = require('../../config/constant');
const knex = require('../../db/db');
const logger = require("../../config/winston");
const { sendResponse } = require("../../config/helper"); // Assuming sendResponse is imported from helpers
jest.mock('../../db/db');
jest.mock('../../config/winston');
jest.mock("../../config/helper");


describe("listUser", () => {
   let req, res;

   beforeEach(() => {
      req = {
         ip: '127.0.0.1',
         query: { page: 1 },
         body: {}, 
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

   // Test Case 1: Should return paginated list of users
   test('should return paginated list of users', async () => {
      // Mocking req.query
      req.query.page = '1'; // Setting the page to 1
      req.query.search = ''; // No search query
   
      // Mocking the users returned by the first query
      const mockUsers = [
         {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            mobileNumber: '1234567890',
            countryCode: '+1',
            gender: 'male',
            profession: 'developer',
            dob: '1990-01-01',
            status: false,
            userType: 'user',
            created_at: '2024-01-01T10:00:00Z',
            updated_at: '2024-01-02T10:00:00Z',
         },
         {
            id: 2,
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane.doe@example.com',
            mobileNumber: '9876543210',
            countryCode: '+1',
            gender: 'female',
            profession: 'designer',
            dob: '1992-01-01',
            status: false,
            userType: 'user',
            created_at: '2024-01-02T10:00:00Z',
            updated_at: '2024-01-03T10:00:00Z',
         },
      ];
   
      const totalCount = 2; // Total number of users
   
      // Mock knex for the user list query
      knex.mockImplementationOnce(() => ({
         select: jest.fn().mockReturnThis(),
         where: jest.fn().mockReturnThis(),
         andWhere: jest.fn().mockReturnThis(),
         orderBy: jest.fn().mockReturnThis(),
         limit: jest.fn().mockReturnThis(),
         offset: jest.fn().mockResolvedValue(mockUsers), // Mock user list
      }));
   
      // Mock knex for the total count query
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         count: jest.fn().mockResolvedValue([{ count: totalCount }]), // Mock total count
      }));
   
      // Mocking the response object
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn();
   
      // Mock sendResponse function
      sendResponse.mockImplementation((message, res, statusCode, data, success) => {
         res.status(statusCode).json({ message, success, result: data });
      });
   
      // Call the controller method
      await authController.listUser(req, res);
   
      // Assertions
      expect(res.status).toHaveBeenCalledWith(constant.CODE.SUCCESS); // Should be 200
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            message: constant.MESSAGE.SUCCESS,
            success: 1,
            result: expect.objectContaining({
               userList: mockUsers,
               pagination: expect.objectContaining({
                  page: 1, // Page 1
                  limit: 10, // Default limit
                  totalCount,
                  totalPages: 1, // Total pages (2 users, 10 per page)
               }),
            }),
         })
      );
   });       

   // Test Case 2: Should return empty list if no users found
   test('should return empty list if no users found', async () => {
      // Mocking req.query
      req.query.page = '1'; // Setting the page to 1
      req.query.search = ''; // No search query
   
      const mockUsers = []; // No users found
      const totalCount = 0; // Total number of users is zero
   
      // Mock knex for the user list query
      knex.mockImplementationOnce(() => ({
         select: jest.fn().mockReturnThis(),
         where: jest.fn().mockReturnThis(),
         andWhere: jest.fn().mockReturnThis(),
         orderBy: jest.fn().mockReturnThis(),
         limit: jest.fn().mockReturnThis(),
         offset: jest.fn().mockResolvedValue(mockUsers), // Return empty array
      }));
   
      // Mock knex for the total count query
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         count: jest.fn().mockResolvedValue([{ count: totalCount }]), // Count is zero
      }));
   
      // Mocking the response object
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn();
   
      // Mock sendResponse function
      sendResponse.mockImplementation((message, res, statusCode, data, success) => {
         res.status(statusCode).json({ message, success, result: data });
      });
   
      // Call the controller method
      await authController.listUser(req, res);
   
      // Assertions
      expect(res.status).toHaveBeenCalledWith(constant.CODE.SUCCESS); // Should be 200
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            message: constant.MESSAGE.SUCCESS,
            success: 1,
            result: expect.objectContaining({
               userList: [], // Empty list
               pagination: expect.objectContaining({
                  page: 1, // Page 1
                  limit: 10, // Default limit
                  totalCount: 0, // Total count is zero
                  totalPages: 0, // Total pages is zero
               }),
            }),
         })
      );
   });   
   
   // Test Case 3: Should use default page if not provided in query
   test('should return paginated list of users with default page if not provided', async () => {
      req.query = {}; // Simulate no page query
   
      const mockUsers = [
         {
            id: 1,
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            mobileNumber: "1234567890",
            countryCode: "+1",
            gender: "M",
            profession: "Developer",
            dob: "1990-01-01",
            status: "1",
            userType: "user",
            created_at: "2024-10-10",
            updated_at: "2024-10-12"
         },
      ];
      const totalCount = 1;
   
      // Mock knex queries
      knex.mockImplementationOnce(() => ({
         select: jest.fn().mockReturnThis(),
         where: jest.fn().mockReturnThis(),
         andWhere: jest.fn().mockReturnThis(),
         orderBy: jest.fn().mockReturnThis(),
         limit: jest.fn().mockReturnThis(),
         offset: jest.fn().mockResolvedValue(mockUsers),
      }));
      knex.mockImplementationOnce(() => ({
         where: jest.fn().mockReturnThis(),
         count: jest.fn().mockResolvedValue([{ count: totalCount }]),
      }));
   
      // Mock sendResponse function
      sendResponse.mockImplementation((message, res, statusCode, data, success) => {
         res.status(statusCode).json({
            message,
            result: data,
            success,
         });
      });
   
      // Call the controller
      await authController.listUser(req, res);
   
      // Validate response
      expect(res.status).toHaveBeenCalledWith(constant.CODE.SUCCESS);
      expect(res.json).toHaveBeenCalledWith(
         expect.objectContaining({
            message: constant.MESSAGE.SUCCESS,
            result: expect.objectContaining({
               userList: mockUsers,
               pagination: expect.objectContaining({
                  page: 1, // Default page value
                  limit: 10, // Default limit value
                  totalCount,
                  totalPages: 1, // Total pages should be 1
               }),
            }),
         })
      );
   });
   

   // Test Case 4: Should return INTERNAL_SERVER_ERROR if database query fails
   test('should return INTERNAL_SERVER_ERROR if database query fails', async () => {
      knex.mockImplementationOnce(() => {
         throw new Error('Internal Server Error');
     });
      await authController.listUser(req, res);
      expect(sendResponse).toHaveBeenCalledWith(constant.MESSAGE.INTERNAL_ERROR,res, 
         constant.CODE.INTERNAL_SERVER_ERROR,{},0);
      
   });
});
