const mongoose = require("mongoose");

const fail = (res, message) => res.status(400).json({ success: false, message });
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isId = (value) => mongoose.Types.ObjectId.isValid(value);
const requiredString = (value, max = 500) => typeof value === "string" && value.trim().length > 0 && value.trim().length <= max;

const validateRegister = (req, res, next) => {
    const { name, email, password } = req.body || {};
    if (!requiredString(name, 100) || !email || !password) return fail(res, "Name, email and password are required");
    if (name.trim().length < 3) return fail(res, "Name must be at least 3 characters");
    if (!isEmail(email.trim())) return fail(res, "Invalid email");
    if (typeof password !== "string" || password.length < 6 || password.length > 128) return fail(res, "Password must be between 6 and 128 characters");
    next();
};

const validateLogin = (req, res, next) => {
    const { email, password } = req.body || {};
    if (!email || !password) return fail(res, "Email and password are required");
    if (!isEmail(String(email).trim())) return fail(res, "Invalid email");
    next();
};

const validateOtpRequest = (req, res, next) => {
    const { email } = req.body || {};
    if (!email || !isEmail(String(email).trim())) return fail(res, "A valid email is required");
    next();
};

const validateOtpVerification = (req, res, next) => {
    const { email, otp } = req.body || {};
    if (!email || !isEmail(String(email).trim())) return fail(res, "A valid email is required");
    if (!/^\d{6}$/.test(String(otp || ""))) return fail(res, "OTP must be a 6-digit code");
    next();
};

const validateRefreshToken = (req, res, next) => {
    if (!req.body?.token || typeof req.body.token !== "string") return fail(res, "Refresh token is required");
    next();
};

const validateObjectId = (param = "id") => (req, res, next) => {
    if (!isId(req.params[param])) return fail(res, `Invalid ${param}`);
    next();
};

const validateCourseQuery = (req, res, next) => {
    const page = req.query.page === undefined ? 1 : Number(req.query.page);
    const limit = req.query.limit === undefined ? 5 : Number(req.query.limit);
    if (!Number.isInteger(page) || page < 1) return fail(res, "Page must be a positive integer");
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) return fail(res, "Limit must be between 1 and 100");
    if (req.query.search && String(req.query.search).length > 100) return fail(res, "Search is too long");
    if (req.query.category && String(req.query.category).length > 100) return fail(res, "Category is too long");
    if (req.query.level && !["Beginner", "Intermediate", "Advanced"].includes(req.query.level)) return fail(res, "Invalid course level");
    next();
};

const validateCourse = (req, res, next) => {
    const { title, description, instructor, price, category, level, duration } = req.body || {};
    if (![title, description, instructor, category, duration].every((value) => requiredString(value))) return fail(res, "Title, description, instructor, category and duration are required");
    if (price === undefined || price === "" || !Number.isFinite(Number(price)) || Number(price) < 0) return fail(res, "Price must be a non-negative number");
    if (level && !["Beginner", "Intermediate", "Advanced"].includes(level)) return fail(res, "Invalid course level");
    next();
};

const validateCourseUpdate = (req, res, next) => {
    const allowedFields = ["title", "description", "instructor", "price", "thumbnail", "category", "level", "duration"];
    const fields = Object.keys(req.body || {});
    if (!fields.length || fields.some((field) => !allowedFields.includes(field))) return fail(res, "Provide valid course fields to update");
    if (req.body.title !== undefined && !requiredString(req.body.title, 200)) return fail(res, "Invalid course title");
    if (req.body.description !== undefined && !requiredString(req.body.description, 3000)) return fail(res, "Invalid course description");
    if (req.body.instructor !== undefined && !requiredString(req.body.instructor, 150)) return fail(res, "Invalid instructor");
    if (req.body.category !== undefined && !requiredString(req.body.category, 100)) return fail(res, "Invalid category");
    if (req.body.duration !== undefined && !requiredString(req.body.duration, 100)) return fail(res, "Invalid duration");
    if (req.body.price !== undefined && (!Number.isFinite(Number(req.body.price)) || Number(req.body.price) < 0)) return fail(res, "Price must be a non-negative number");
    if (req.body.level !== undefined && !["Beginner", "Intermediate", "Advanced"].includes(req.body.level)) return fail(res, "Invalid course level");
    next();
};

const validateEnrollment = (req, res, next) => {
    if (!isId(req.body?.courseId)) return fail(res, "A valid course ID is required");
    next();
};

const validateAssignment = (req, res, next) => {
    if (!requiredString(req.body?.title, 200) || !requiredString(req.body?.description, 2000)) return fail(res, "Title and description are required");
    if (!isId(req.body?.course)) return fail(res, "A valid course ID is required");
    next();
};

module.exports = { validateRegister, validateLogin, validateOtpRequest, validateOtpVerification, validateRefreshToken, validateObjectId, validateCourseQuery, validateCourse, validateCourseUpdate, validateEnrollment, validateAssignment };
