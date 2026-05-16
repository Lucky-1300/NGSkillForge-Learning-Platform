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
        // Postman sends Bearer token, so remove that part before verification.
        if (token.startsWith("Bearer ")) {
            token = token.slice(7);
        }

        // Decode and verify the token using the app secret key.
        const verifiedToken = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = verifiedToken;

        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid Token",
            error: error.message,
        });

    }
};

module.exports = authMiddleware;