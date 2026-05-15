const roleMiddleware = (...roles) => {

    return (req, res, next) => {

        try {

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "User not authenticated",
                });
            }

            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied",
                });
            }

            next();

        } catch (error) {

            return res.status(500).json({
                success: false,
                message: "Role Middleware Error",
                error: error.message,
            });

        }

    };

};

module.exports = roleMiddleware;