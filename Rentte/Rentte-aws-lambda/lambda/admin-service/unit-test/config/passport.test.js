const passport = require("passport");
const knex = require("../../db/db"); 
jest.mock("passport");
jest.mock("../../db/db"); 

const jwtStrategyLoader = require("../../config/passport"); 

describe("Passport JWT Strategy", () => {
  const mockUse = jest.fn();
  const mockUser = { id: 1, name: "John Doe" };

  beforeEach(() => {
    passport.use = mockUse;
    jest.clearAllMocks();
    process.env.JWT_SECRET_KEY = "test_secret_key";
  });

  test("should call done with user on valid token", async () => {
    knex.mockImplementation(() => ({
      where: () => ({
        first: () => Promise.resolve(mockUser),
      }),
    }));

    jwtStrategyLoader(passport);

    const [[strategy]] = mockUse.mock.calls;
    const payload = {
      id: 1,
      exp: Math.ceil(Date.now() / 1000) + 60, // valid token
    };

    const done = jest.fn();

    await strategy._verify({}, payload, done);

    expect(done).toHaveBeenCalledWith(null, mockUser);
  });

  test("should call done with 'Unauthorize' on expired token", async () => {
    const expiredPayload = {
      id: 1,
      exp: Math.ceil(Date.now() / 1000) - 60, // expired token
    };

    jwtStrategyLoader(passport);
    const [[strategy]] = mockUse.mock.calls;
    const done = jest.fn();

    await strategy._verify({}, expiredPayload, done);

    expect(done).toHaveBeenCalledWith(null, "Unauthorize");
  });

  test("should call done with false and 'User not found' if user doesn't exist", async () => {
    knex.mockImplementation(() => ({
      where: () => ({
        first: () => Promise.resolve(null), // user not found
      }),
    }));

    jwtStrategyLoader(passport);

    const [[strategy]] = mockUse.mock.calls;
    const payload = {
      id: 2,
      exp: Math.ceil(Date.now() / 1000) + 60,
    };

    const done = jest.fn();

    await strategy._verify({}, payload, done);

    expect(done).toHaveBeenCalledWith(null, false, "User not found");
  });

  test("should call done with error if exception occurs", async () => {
    knex.mockImplementation(() => {
      throw new Error("DB error");
    });

    jwtStrategyLoader(passport);

    const [[strategy]] = mockUse.mock.calls;
    const payload = {
      id: 1,
      exp: Math.ceil(Date.now() / 1000) + 60,
    };

    const done = jest.fn();

    await strategy._verify({}, payload, done);

    expect(done).toHaveBeenCalledWith(expect.any(Error), false);
  });
});
