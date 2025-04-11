const { blogInputValidator } = require("../../validators/blogValidator");

describe("blogInputValidator", () => {
  test("should return false for valid blog input", async () => {
    const result = await blogInputValidator(
      {
        title: "Test Blog Title",
        description: "This is a test blog post",
        blogimage: ["image1.jpg", "image2.png"],
      },
      "blogValidator"
    );
    expect(result).toBe(false);
  });

  test("should return error for missing title", async () => {
    const result = await blogInputValidator(
      {
        description: "Blog without a title",
        blogimage: ["img.jpg"],
      },
      "blogValidator"
    );
    expect(result).toBe("The title field is mandatory.");
  });

  test("should return error for missing description", async () => {
    const result = await blogInputValidator(
      {
        title: "No Description Blog",
        blogimage: ["img.jpg"],
      },
      "blogValidator"
    );
    expect(result).toBe("The description field is mandatory.");
  });

  test("should return error for missing blogimage", async () => {
    const result = await blogInputValidator(
      {
        title: "No Image Blog",
        description: "This blog has no image array",
      },
      "blogValidator"
    );
    expect(result).toBe("The blogimage field is mandatory.");
  });

  test("should return error if blogimage is not an array", async () => {
    const result = await blogInputValidator(
      {
        title: "Wrong Type Image",
        description: "Image should be an array",
        blogimage: "not-an-array",
      },
      "blogValidator"
    );
    expect(result).toBe("The blogimage must be an array.");
  });  

  test("should return false if no type is provided", async () => {
    const result = await blogInputValidator(
      {
        title: "Test",
        description: "Desc",
        blogimage: ["img.jpg"],
      }
    );
    expect(result).toBe(false);
  });
});
