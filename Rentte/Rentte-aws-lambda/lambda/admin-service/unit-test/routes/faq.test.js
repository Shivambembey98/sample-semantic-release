const request = require("supertest");
const express = require("express");
const passport = require("passport");

const app = express();

// Mock passport
jest.mock("passport");
passport.authenticate = jest.fn(() => (req, res, next) => next());

jest.mock("../../config/s3bucketConfig", () => ({
  single: () => (req, res, next) => {
    req.file = {}; // Simulate uploaded file
    next();
  },
}));

const faqController = require("../../admin/controller/faqController");
jest.mock("../../admin/controller/faqController", () => ({
  createFaqCategory: jest.fn((req, res) => res.status(201).json({ message: "FAQ Category Created" })),
  editFaqCategory: jest.fn((req, res) => res.status(200).json({ message: "FAQ Category Edited" })),
  deleteFaqCategory: jest.fn((req, res) => res.status(200).json({ message: "FAQ Category Deleted" })),
  createFaq: jest.fn((req, res) => res.status(201).json({ message: "FAQ Created" })),
  editFaq: jest.fn((req, res) => res.status(200).json({ message: "FAQ Edited" })),
  deleteFaq: jest.fn((req, res) => res.status(200).json({ message: "FAQ Deleted" })),
  getAllCustomerQuery: jest.fn((req, res) => res.status(200).json({ message: "Customer Queries Fetched" })),
}));

const faqRoutes = require("../../admin/routes/faq");
app.use(express.json());
app.use("/api/faq", faqRoutes);

describe("FAQ Routes", () => {
  test("POST /create-faq-category", async () => {
    const res = await request(app).post("/api/faq/create-faq-category");
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("FAQ Category Created");
    expect(faqController.createFaqCategory).toHaveBeenCalled();
  });

  test("POST /edit-faq-category", async () => {
    const res = await request(app).post("/api/faq/edit-faq-category");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("FAQ Category Edited");
    expect(faqController.editFaqCategory).toHaveBeenCalled();
  });

  test("DELETE /delete-faq-category", async () => {
    const res = await request(app).delete("/api/faq/delete-faq-category");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("FAQ Category Deleted");
    expect(faqController.deleteFaqCategory).toHaveBeenCalled();
  });

  test("POST /create-faq", async () => {
    const res = await request(app).post("/api/faq/create-faq");
    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("FAQ Created");
    expect(faqController.createFaq).toHaveBeenCalled();
  });

  test("POST /edit-faq", async () => {
    const res = await request(app).post("/api/faq/edit-faq");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("FAQ Edited");
    expect(faqController.editFaq).toHaveBeenCalled();
  });

  test("DELETE /delete-faq", async () => {
    const res = await request(app).delete("/api/faq/delete-faq");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("FAQ Deleted");
    expect(faqController.deleteFaq).toHaveBeenCalled();
  });

  test("GET /get-all-customer-query", async () => {
    const res = await request(app).get("/api/faq/get-all-customer-query");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Customer Queries Fetched");
    expect(faqController.getAllCustomerQuery).toHaveBeenCalled();
  });
});
