// This middleware checks the JWT token and adds user info to the request.
const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
    try {
        let token = req.header("Authorization");

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access Denied. No Token Provided",
            });
        }

        // Remove Bearer prefix if present
        if (token.startsWith("Bearer ")) {
            token = token.slice(7);
        }

        if (!token || token === "null" || token === "undefined") {
            return res.status(401).json({
                success: false,
                message: "Access Denied. Invalid Token",
            });
        }

        // Decode and verify the token using the app secret key.
        const verifiedToken = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = verifiedToken;
        if (req.user && req.user.id && !req.user._id) {
            req.user._id = req.user.id;
        }
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: error.name === "TokenExpiredError"
                ? "Token expired"
                : "Invalid Token",
        });
    }
};

const optionalAuthMiddleware = async (req, res, next) => {
    try {
        let token = req.header("Authorization");
        if (token) {
            if (token.startsWith("Bearer ")) {
                token = token.slice(7);
            }
            if (token && token !== "null" && token !== "undefined") {
                const verifiedToken = jwt.verify(token, process.env.JWT_SECRET);
                req.user = verifiedToken;
                if (req.user && req.user.id && !req.user._id) {
                    req.user._id = req.user.id;
                }
            }
        }
    } catch (error) {
        // Silently treat invalid/expired token as guest user for optional routes
        req.user = null;
    }
    next();
};

module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.optionalAuthMiddleware = optionalAuthMiddleware;