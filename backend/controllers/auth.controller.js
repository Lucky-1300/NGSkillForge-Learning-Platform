// This file handles OTP, registration, login, token refresh, and logout.
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const otpGenerator = require("otp-generator");

const Otp = require("../models/otp.model");

const transporter = require("../config/mail.config");

const PRIMARY_ADMIN_EMAIL = (
    process.env.PRIMARY_ADMIN_EMAIL || "luckykumari42774@gmail.com"
).toLowerCase();

const normalizeEmail = (email) =>
    (email || "").trim().toLowerCase();





const sendOtp = async (req, res) => {

    try {

        const normalizedEmail = normalizeEmail(req.body.email);

        if (!normalizedEmail) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        // Generate a 6-digit OTP without letters or symbols.



        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });



        const expiresAt = new Date(
            Date.now() + 5 * 60 * 1000
        );



        await Otp.create({
            email: normalizedEmail,
            otp,
            expiresAt,
        });



        await transporter.sendMail({
            from: process.env.EMAIL_USER,

            to: normalizedEmail,

            subject: "OTP Verification",

            text: `Your OTP is ${otp}`,
        });



        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to send OTP",
            error: error.message,
        });

    }

};





const verifyOtp = async (req, res) => {

    try {

        const { otp } = req.body;
        const normalizedEmail = normalizeEmail(req.body.email);



        // Check if the entered OTP matches the one saved in the database.
        const existingOtp = await Otp.findOne({
            email: normalizedEmail,
            otp,
        });



        if (!existingOtp) {

            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });

        }



        if (existingOtp.expiresAt < new Date()) {

            return res.status(400).json({
                success: false,
                message: "OTP expired",
            });

        }



        // Mark this OTP as verified so the user can register.
        existingOtp.isVerified = true;

        await existingOtp.save();



        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "OTP verification failed",
            error: error.message,
        });

    }

};





const registerUser = async (req, res) => {

    try {

        const { name, password, role } = req.body;
        const normalizedEmail = normalizeEmail(req.body.email);
        const effectiveRole =
            normalizedEmail === PRIMARY_ADMIN_EMAIL
                ? "admin"
                : role;



        // Do not create the account twice for the same email.
        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {

            return res.status(400).json({
                success: false,
                message: "User already exists",
            });

        }



        // Registration is allowed only after the OTP has been verified.
        const verifiedOtp = await Otp.findOne({
            email: normalizedEmail,
            isVerified: true,
        });



        if (!verifiedOtp) {

            return res.status(400).json({
                success: false,
                message: "Please verify OTP first",
            });

        }



        // Store password in hashed form instead of plain text.
        const hashedPassword = await bcrypt.hash(password, 10);



        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            role: effectiveRole,
        });



        // Remove OTP after successful registration so it cannot be reused.
        await Otp.deleteOne({ email: normalizedEmail });



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

        const { password } = req.body;
        const normalizedEmail = normalizeEmail(req.body.email);

        
        // Find the user by email first.
        const user = await User.findOne({
            email: normalizedEmail,
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        
        // Compare the typed password with the hashed password from MongoDB.
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

        const effectiveRole =
            normalizedEmail === PRIMARY_ADMIN_EMAIL
                ? "admin"
                : user.role;

        if (user.role !== effectiveRole) {
            user.role = effectiveRole;
            await user.save();
        }

       
    // Access token is short-lived and used for protected routes.
    const accessToken = jwt.sign(
    {
        id: user._id,
        role: effectiveRole,
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "15m",
    }
);



// Refresh token lasts longer and can be exchanged for a new access token.
const refreshToken = jwt.sign(
    {
        id: user._id,
        role: effectiveRole,
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "7d",
    }
);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            accessToken,
            refreshToken,
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

const refreshToken = async (req, res) => {

    try {

        const { token } = req.body;

        if (!token) {

            return res.status(401).json({
                success: false,
                message: "Refresh token missing",
            });

        }



        // Verify the refresh token and extract user info from it.
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );



        // Create a fresh access token without making the user log in again.
        const accessToken = jwt.sign(
            {
                id: decoded.id,
                role: decoded.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "15m",
            }
        );



        return res.status(200).json({
            success: true,
            accessToken,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Refresh token failed",
            error: error.message,
        });

    }

};




const logoutUser = async (req, res) => {

    return res.status(200).json({
        success: true,
        message: "Logout successful",
    });

};



module.exports = {
    sendOtp,
    verifyOtp,
    registerUser,
    loginUser,
    refreshToken,
    logoutUser,
};