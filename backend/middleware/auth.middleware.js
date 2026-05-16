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