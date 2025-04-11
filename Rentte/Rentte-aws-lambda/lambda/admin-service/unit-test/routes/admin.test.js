const request = require("supertest");
const express = require("express");
const passport = require("passport");
const app = express();

jest.mock("passport");
passport.authenticate = jest.fn(() => (req, res, next) => next());

const authController = require("../../admin/controller/authController");

// Mock all controller methods
jest.mock("../../admin/controller/authController", () => ({
  register: jest.fn((req, res) => res.status(201).json({ message: "Registered" })),
  login: jest.fn((req, res) => res.status(200).json({ message: "Logged in" })),
  forgotPassword: jest.fn((req, res) => res.status(200).json({ message: "Forgot password" })),
  resetPassword: jest.fn((req, res) => res.status(200).json({ message: "Reset password" })),
  sendOtp: jest.fn((req, res) => res.status(200).json({ message: "OTP sent" })),
  verifyOtp: jest.fn((req, res) => res.status(200).json({ message: "OTP verified" })),
  changePassword: jest.fn((req, res) => res.status(200).json({ message: "Password changed" })),
}));

const authRoutes = require("../../admin/routes/admin");

app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Auth Routes", () => {
  test("POST /register -> register controller", async () => {
    const res = await request(app).post("/api/auth/register").send({});
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Registered");
    expect(authController.register).toHaveBeenCalled();
  });

  test("POST /login -> login controller", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Logged in");
    expect(authController.login).toHaveBeenCalled();
  });

  test("POST /forget-password -> forgotPassword controller", async () => {
    const res = await request(app).post("/api/auth/forget-password").send({});
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Forgot password");
    expect(authController.forgotPassword).toHaveBeenCalled();
  });

  test("POST /reset-password -> resetPassword controller", async () => {
    const res = await request(app).post("/api/auth/reset-password").send({});
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Reset password");
    expect(authController.resetPassword).toHaveBeenCalled();
  });

  test("POST /send-otp -> sendOtp controller", async () => {
    const res = await request(app).post("/api/auth/send-otp").send({});
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("OTP sent");
    expect(authController.sendOtp).toHaveBeenCalled();
  });

  test("POST /verify-otp -> verifyOtp controller", async () => {
    const res = await request(app).post("/api/auth/verify-otp").send({});
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("OTP verified");
    expect(authController.verifyOtp).toHaveBeenCalled();
  });

  test("POST /change-password -> passport + changePassword controller", async () => {
    const res = await request(app).post("/api/auth/change-password").send({});
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Password changed");
    expect(authController.changePassword).toHaveBeenCalled();
  });
});
