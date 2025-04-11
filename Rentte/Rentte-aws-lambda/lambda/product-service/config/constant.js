const STATUS_CODE = {
   ERROR: 0,
   SUCCESS: 200,
};
const SALT_VALUE = {
   value: 5,
};
const CODE = {
   AUTH: 401,
   SUCCESS: 200,
   PARAMETER_MISSING: 418,
   NOT_EXIST: 413,
   ID_NOT_EXIST: 416,
   ALREADY_EXIST: 409,
   INVALID_PHONE_CODE: 411,
   INVALID_EMAIL: 402,
   EMAILEXIST: 421,
   PHONEEXIST: 422,
   ALREADY_BOOKMARKED: 412,
   INAVLID_ACCESS_TYPE: 417,
   INVALID_ALLOWED_TYPE: 420,
   ALREADY_SET_ACCOUNT: 421,
   INCORRECT_PASSWORD: 422,
   INCORRECT_TEXT: 423,
   OTHER_DEVICE: 424,
   BLOCKED: 425,
   INTERNAL_SERVER_ERROR: 500,
   INPUT_VALIDATION: 403,
   BAD_REQUEST: 400,
   NOT_FOUND: 404,
};
const ADMIN_TYPE = {
   admin: 1,
   subAdmin: 2,
   user: 3,
};
const STATUS = {
   ACTIVE: 1,
   BLOCK: 2,
   DELETE: 3,
};
const CMS_TYPE = {
   ABOUTUS: 1,
   TERM_COND: 2,
   PRIVACY_POLICY: 3,
};

const USER_TYPE = {
   CONSUMER: 1,
   BUSINESS: 2,
};

const BUSINESS_TYPE = {
   INDIVIDUAL: 3,
   INSTITUTIONAL: 4,
};

const OTP_TYPE = {
   SEND_OTP: 'sendotp',
};

const MESSAGE = {
   SUCCESS: 'Success',
   INTERNAL_ERROR: 'Internal Server Error',
   ACCOUNT_DELETE: 'Your account has been deleted, please contact admin to reactivate',
   ACCOUNT_BLOCK: "You are blocked by Admin, please contact admin for more details",
   SENT_OTP: 'Otp sent successfully',
   INVALID_OTP: 'Invalid OTP',
   Unauthorized: 'Unauthorized Token',
   EMAIL_ALREADY_REGISTERED: "This email is already registered",
   EMAIL_NOT_REGISTERED: "This email is not registered.",
   REGISTERED: "Registered Successfully.",
   INCORRECT_PASS: "You have entered incorrect password.",
   OLD_INCORRECT_PASS: "Old password is incorrect.",
   PASSWORD_UPDATE: "Password updated successfully",
   EMAIL_SEND: `Please check your email inbox. Password reset instructions 
   sent to the associated email address.`,
   PROFILE_UPDATE: "Profile updated successfully",
   INVALID_USER: 'Invalid user role',
   ADD: "{{key}} added successfully",
   UPDATE: "{{key}} updated successfully",
   DATA_FETCH: "{{key}} data fetched successfully",
   EXPIRE_LINK: "Reset link has been expired",
   INVALID_FIELD: 'Invalid input addressId is required with makeDefault',
   UNBLOCK: "{{key}} unblocked successfully",
   DELETE: "{{key}} deleted successfully",
   BLOCK: "{{key}} blocked successfully",
   ALREADY_EXIST: "{{key}} already exist.",
   BAD_REQUEST: "Bad request",
   RATE_LIMITER_MESSAGE: "Too many requests from this IP, please try again after 15 minutes",
   NOT_FOUND: "{{key}} not found",
   VIEW_COUNT: "View count update successfully",
   CLICK_COUNT: "Chat click count successfully",
   ID_LIST_INVALID: "Product id list not found",
   UPDATE_SERACH_COUNT: "Update search count successfully",
   RENT_PRODUCT: "Product already on rent",
};

const DAYS = {
   sun: "Sunday",
   mon: "Monday",
   tue: "Tuesday",
   wed: "Wednesday",
   thu: "Thursday",
   fri: "Friday",
   sat: "Saturday",
};

// ========================== Export Module Start ==========================

module.exports = Object.freeze({
   STATUS_CODE,
   CODE,
   SALT_VALUE,
   ADMIN_TYPE,
   STATUS,
   CMS_TYPE,
   USER_TYPE,
   BUSINESS_TYPE,
   MESSAGE,
   OTP_TYPE,
   DAYS,
});
// ========================== Export Module End ============================
