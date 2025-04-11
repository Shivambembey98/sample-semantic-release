// userRoutes.test.js

const request = require("supertest");
const express = require("express");

// === MOCKS SETUP ====================================

// Mock passport so that the JWT authentication behaves based on the request header.
// If the header is 'fail', we simulate an authentication failure.
jest.mock("passport", () => ({
  authenticate: jest.fn((strategy, options) => {
    return (req, res, next) => {
      if (req.headers.authorization === "fail") {
        return res.status(401).json({ error: "Unauthorized" });
      }
      // Simulate a successful authentication by attaching a dummy user.
      req.user = { id: "dummyUser" };
      next();
    };
  }),
}));

// Mock the userController to return a known JSON response.
jest.mock("../../admin/controller/userController", () => ({
  blockAndUnblockUser: jest.fn((req, res) => {
    res
      .status(200)
      .json({ success: true, message: "User blocked/unblocked." });
  }),
}));

// === ROUTER SETUP ====================================

// Import the router after setting up the mocks.
// Adjust the path below to point to your actual router file.
const router = require("../../admin/routes/user");

// Create an Express app and mount the router.
const app = express();
app.use(express.json()); // Needed to parse JSON bodies in POST requests.
app.use("/", router);

// === TESTS ===========================================

describe("POST /block-and-unblock-user", () => {
  it("should block/unblock a user when authenticated", async () => {
    const response = await request(app)
      .post("/block-and-unblock-user")
      // Provide a valid authorization header (any value different from "fail").
      .set("Authorization", "Bearer validToken")
      .send({ userId: "user123", block: true });  // Sample body payload

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "User blocked/unblocked.",
    });
  });

  it("should return 401 when authentication fails", async () => {
    const response = await request(app)
      .post("/block-and-unblock-user")
      // Set the header to "fail" to simulate an authentication failure.
      .set("Authorization", "fail")
      .send({ userId: "user123", block: true });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Unauthorized" });
  });
});
