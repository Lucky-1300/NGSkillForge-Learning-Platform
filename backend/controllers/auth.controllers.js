const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



const registerUser = async (req, res) => {

    try {

        const { name, email, password, role } = req.body;

        
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        
        const hashedPassword = await bcrypt.hash(password, 10);

        
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });

        
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Registration Failed",
            error: error.message,
        });

    }
};





const loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials",
            });
        }

       
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Login Failed",
            error: error.message,
        });

    }
};



module.exports = {
    registerUser,
    loginUser,
};