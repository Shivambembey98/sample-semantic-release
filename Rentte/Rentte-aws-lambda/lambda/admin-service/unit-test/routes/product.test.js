// productRoutes.test.js

const request = require("supertest");
const express = require("express");

// === MOCKS SETUP ======================================

// Mock passport so that the JWT authentication behavior is simulated.
// If the 'Authorization' header equals "fail", it returns a 401 Unauthorized.
jest.mock("passport", () => ({
  authenticate: jest.fn((strategy, options) => {
    return (req, res, next) => {
      if (req.headers.authorization === "fail") {
        return res.status(401).json({ error: "Unauthorized" });
      }
      req.user = { id: "dummyUser" };
      next();
    };
  })
}));

// Mock the upload middleware from s3bucketConfig to simply call next()
// so file upload handling is bypassed.
jest.mock("../../config/s3bucketConfig", () => ({
  single: jest.fn(() => (req, res, next) => {
    next();
  }),
}));

// Mock the productController with stub functions returning a JSON message.
jest.mock("../../admin/controller/productController", () => ({
  addCategory: jest.fn((req, res) =>
    res.status(200).json({ route: "addCategory" })
  ),
  updateCategory: jest.fn((req, res) =>
    res.status(200).json({ route: "updateCategory" })
  ),
  categoryList: jest.fn((req, res) =>
    res.status(200).json({ route: "categoryList" })
  ),
  deleteCategory: jest.fn((req, res) =>
    res.status(200).json({ route: "deleteCategory" })
  ),
  addSubCategory: jest.fn((req, res) =>
    res.status(200).json({ route: "addSubCategory" })
  ),
  updateSubCategory: jest.fn((req, res) =>
    res.status(200).json({ route: "updateSubCategory" })
  ),
  subCategoryList: jest.fn((req, res) =>
    res.status(200).json({ route: "subCategoryList" })
  ),
  deleteSubCategory: jest.fn((req, res) =>
    res.status(200).json({ route: "deleteSubCategory" })
  ),
  getAllProducts: jest.fn((req, res) =>
    res.status(200).json({ route: "getAllProducts" })
  ),
  postBanner: jest.fn((req, res) =>
    res.status(200).json({ route: "postBanner" })
  ),
  updateBanner: jest.fn((req, res) =>
    res.status(200).json({ route: "updateBanner" })
  ),
  deleteBanner: jest.fn((req, res) =>
    res.status(200).json({ route: "deleteBanner" })
  ),
  imageValidation: jest.fn((req, res) =>
    res.status(200).json({ route: "imageValidation" })
  )
}));

// Import the router after setting up all mocks.
// Adjust the relative path below to match your project structure.
const router = require("../../admin/routes/product");

// === EXPRESS APP SETUP ==============================

const app = express();
app.use(express.json()); // for parsing JSON bodies

// Mount the router at the root.
app.use("/", router);

// === TESTS ==========================================

describe("Product Routes", () => {
  describe("POST /create-category", () => {
    it("should call addCategory and return expected response", async () => {
      const res = await request(app)
        .post("/create-category")
        .set("Authorization", "Bearer validToken")
        .send({ name: "Electronics" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ route: "addCategory" });
    });
  });

  describe("POST /update-category", () => {
    it("should call updateCategory and return expected response", async () => {
      const res = await request(app)
        .post("/update-category")
        .set("Authorization", "Bearer validToken")
        .send({ id: "cat123", name: "Updated Electronics" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ route: "updateCategory" });
    });
  });

  describe("GET /category-list", () => {
    it("should call categoryList and return expected response", async () => {
      const res = await request(app)
        .get("/category-list")
        .set("Authorization", "Bearer validToken");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ route: "categoryList" });
    });
  });

  describe("DELETE /delete-category", () => {
    it("should call deleteCategory and return expected response", async () => {
      const res = await request(app)
        .delete("/delete-category")
        .set("Authorization", "Bearer validToken")
        .send({ id: "cat123" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ route: "deleteCategory" });
    });
  });

  describe("POST /create-subcategory", () => {
    it("should call addSubCategory and return expected response", async () => {
      const res = await request(app)
        .post("/create-subcategory")
        .set("Authorization", "Bearer validToken")
        // Use .field() and .attach() to simulate multipart form data.
        .field("name", "Smartphones")
        .attach("subcategoryimage", Buffer.from("dummy image"), "image.jpg");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ route: "addSubCategory" });
    });
  });

  describe("POST /update-subcategory", () => {
    it("should call updateSubCategory and return expected response", async () => {
      const res = await request(app)
        .post("/update-subcategory")
        .set("Authorization", "Bearer validToken")
        .field("id", "subcat123")
        .field("name", "Updated Smartphones")
        .attach("subcategoryimage", Buffer.from("dummy image"), "image.jpg");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ route: "updateSubCategory" });
    });
  });

  describe("GET /subcategory-list", () => {
    it("should call subCategoryList and return expected response", async () => {
      const res = await request(app)
        .get("/subcategory-list")
        .set("Authorization", "Bearer validToken");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ route: "subCategoryList" });
    });
  });

  describe("DELETE /delete-subcategory", () => {
    it("should call deleteSubCategory and return expected response", async () => {
      const res = await request(app)
        .delete("/delete-subcategory")
        .set("Authorization", "Bearer validToken")
        .send({ id: "subcat123" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ route: "deleteSubCategory" });
    });
  });

  describe("GET /get-all-product", () => {
    it("should call getAllProducts and return expected response", async () => {
      const res = await request(app)
        .get("/get-all-product")
        .set("Authorization", "Bearer validToken");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ route: "getAllProducts" });
    });
  });

  describe("POST /post-banner", () => {
    it("should call postBanner and return expected response", async () => {
      const res = await request(app)
        .post("/post-banner")
        .set("Authorization", "Bearer validToken")
        .field("title", "Summer Sale Banner")
        .attach("bannerimage", Buffer.from("dummy image"), "banner.jpg");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ route: "postBanner" });
    });
  });

  describe("POST /update-banner", () => {
    it("should call updateBanner and return expected response", async () => {
      const res = await request(app)
        .post("/update-banner")
        .set("Authorization", "Bearer validToken")
        .field("id", "banner123")
        .field("title", "Updated Summer Sale Banner")
        .attach("bannerimage", Buffer.from("dummy image"), "banner.jpg");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ route: "updateBanner" });
    });
  });

  describe("DELETE /delete-banner", () => {
    it("should call deleteBanner and return expected response", async () => {
      const res = await request(app)
        .delete("/delete-banner")
        .set("Authorization", "Bearer validToken")
        .send({ id: "banner123" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ route: "deleteBanner" });
    });
  });

  describe("POST /product-image-validation", () => {
    it("should call imageValidation and return expected response", async () => {
      const res = await request(app)
        .post("/product-image-validation")
        .set("Authorization", "Bearer validToken")
        .send({ imageUrl: "http://example.com/image.jpg" });
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ route: "imageValidation" });
    });
  });

  describe("Authentication Failure", () => {
    it("should return 401 when authentication fails", async () => {
      const res = await request(app)
        .get("/category-list")
        .set("Authorization", "fail");
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Unauthorized" });
    });
  });
});
