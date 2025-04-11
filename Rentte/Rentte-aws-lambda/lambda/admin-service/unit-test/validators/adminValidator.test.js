const { adminInputValidation } = require("../../validators/adminValidator");

describe("adminInputValidation", () => {
  test("should return false for valid forgotPassword input", async () => {
    const result = await adminInputValidation(
      { email: "test@example.com" },
      "forgotPassword"
    );
    expect(result).toBe(false);
  });

  test("should return correct message for missing email in forgotPassword", async () => {
    const result = await adminInputValidation({}, "forgotPassword");
    expect(result).toBe("The email field is mandatory.");
  });

  test("should return false for valid resetPassword input", async () => {
    const result = await adminInputValidation(
      {
        token: "abc123",
        newPassword: "secret123",
        confirmPassword: "secret123",
      },
      "resetPassword"
    );
    expect(result).toBe(false);
  });

  test("should return error for mismatched passwords in resetPassword", async () => {
    const result = await adminInputValidation(
      {
        token: "abc123",
        newPassword: "secret123",
        confirmPassword: "wrongpass",
      },
      "resetPassword"
    );
    expect(result).toBe("The confirm password and newPassword must match.");
  });

  test("should return false for valid admin login input", async () => {
    const result = await adminInputValidation(
      {
        email: "admin@example.com",
        password: "adminpass",
      },
      "adminLoginValidation"
    );
    expect(result).toBe(false);
  });

  test("should return undefined or false for missing type key", async () => {
    const result = await adminInputValidation({ email: "test@example.com" });
    expect(result).toBe(false); 
  });
});
