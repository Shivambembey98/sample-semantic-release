// jobRoutes.test.js

// Import required modules and configuration.
const request = require('supertest');
const express = require('express');

// === MOCKS SETUP ============================

// Mock passport so that the JWT strategy behaves based on the request header.
jest.mock('passport', () => ({
  authenticate: jest.fn((strategy, options) => {
    return (req, res, next) => {
      // Check for a special header value to simulate failure.
      // For example, if the Authorization header is exactly 'fail', then return 401.
      if (req.headers.authorization === 'fail') {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      // Otherwise, assume authentication succeeded.
      req.user = { id: 'testUser' };
      next();
    };
  })
}));

// Mock the jobController to return a known JSON response.
jest.mock('../../admin/controller/jobApplicationController', () => ({
  getAllJobApplications: jest.fn((req, res) => {
    res.status(200).json({ success: true, applications: [] });
  })
}));

// === ROUTER SETUP ============================

// Import the router after setting up the mocks.
const router = require('../../admin/routes/jobs'); // Replace with the actual relative path

// Create an Express app and mount the router.
const app = express();
app.use('/', router);

// === TESTS ===================================

describe('GET /get-all-jobapplications', () => {
  it('should return job applications when authenticated', async () => {
    const response = await request(app)
      .get('/get-all-jobapplications')
      // Send an Authorization header that does not trigger failure.
      .set('Authorization', 'Bearer validToken');
      
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, applications: [] });
  });

  it('should return 401 when authentication fails', async () => {
    const response = await request(app)
      .get('/get-all-jobapplications')
      // Set the header to "fail" to simulate authentication failure.
      .set('Authorization', 'fail');
      
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized' });
  });
});
