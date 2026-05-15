const validateRegister = (req, res, next) => {

    try {

        const { name, email, password, role } = req.body;

        
        if (!name || !email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        
        if (name.length < 3) {
            return res.status(400).json({
                success: false,
                message: "Name must be at least 3 characters",
            });
        }

        
        if (!email.includes("@")) {
            return res.status(400).json({
                success: false,
                message: "Invalid email",
            });
        }

        
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        
        if (role !== "user" && role !== "admin") {
            return res.status(400).json({
                success: false,
                message: "Role must be user or admin",
            });
        }

        next();

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Validation Error",
            error: error.message,
        });

    }
};



const validateLogin = (req, res, next) => {

    try {

        const { email, password } = req.body;

       
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        
        if (!email.includes("@")) {
            return res.status(400).json({
                success: false,
                message: "Invalid email",
            });
        }

        next();

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Validation Error",
            error: error.message,
        });

    }
};



module.exports = {
    validateRegister,
    validateLogin,
};