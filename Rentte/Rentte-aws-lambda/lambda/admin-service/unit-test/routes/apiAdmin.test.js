const request = require("supertest");
const express = require("express");

// Mock all nested routers
jest.mock("../../admin/routes/admin", () => {
  const router = require("express").Router();
  router.get("/test", (req, res) => res.status(200).json({ message: "Admin route hit" }));
  return router;
});

jest.mock("../../admin/routes/product", () => {
  const router = require("express").Router();
  router.get("/test", (req, res) => res.status(200).json({ message: "Product route hit" }));
  return router;
});

jest.mock("../../admin/routes/user", () => {
  const router = require("express").Router();
  router.get("/test", (req, res) => res.status(200).json({ message: "User route hit" }));
  return router;
});

jest.mock("../../admin/routes/faq", () => {
  const router = require("express").Router();
  router.get("/test", (req, res) => res.status(200).json({ message: "FAQ route hit" }));
  return router;
});

jest.mock("../../admin/routes/jobs", () => {
  const router = require("express").Router();
  router.get("/test", (req, res) => res.status(200).json({ message: "Jobs route hit" }));
  return router;
});

// Load your api.js router file
const apiRoutes = require("../../routes/api");

// Set up app with only api routes
const app = express();
app.use("/api", apiRoutes);

describe("API Router Mounting", () => {
  test("should route /api/admin/auth to adminRoutes", async () => {
    const res = await request(app).get("/api/admin/auth/test");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Admin route hit");
  });

  test("should route /api/admin/product to productRoutes", async () => {
    const res = await request(app).get("/api/admin/product/test");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Product route hit");
  });

  test("should route /api/admin/user to userRoutes", async () => {
    const res = await request(app).get("/api/admin/user/test");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User route hit");
  });

  test("should route /api/admin/faqs to faqRoutes", async () => {
    const res = await request(app).get("/api/admin/faqs/test");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("FAQ route hit");
  });

  test("should route /api/admin/jobs to jobRoutes", async () => {
    const res = await request(app).get("/api/admin/jobs/test");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Jobs route hit");
  });
});
