// This file handles OTP, registration, login, token refresh, and logout.
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const otpGenerator = require("otp-generator");

const Otp = require("../models/otp.model");

const { sendMail } = require("../config/mail.config");

const PRIMARY_ADMIN_EMAIL = (
    process.env.PRIMARY_ADMIN_EMAIL || "luckykumari42774@gmail.com"
).toLowerCase();

const normalizeEmail = (email) =>
    (email || "").trim().toLowerCase();

const publicUser = (user) => {
    const value = user.toObject ? user.toObject() : { ...user };
    delete value.password;
    return value;
};





const sendOtp = async (req, res) => {
    const normalizedEmail = normalizeEmail(req.body.email);
    const maskedEmail = normalizedEmail
        ? `${normalizedEmail.slice(0, 2)}***@${normalizedEmail.split("@")[1] || ""}`
        : "unknown";

    try {
        console.log(`[Auth OTP] Step 1: Request received for ${maskedEmail}`);

        if (!normalizedEmail) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            console.log(`[Auth OTP] Step 1b: User already exists for ${maskedEmail}`);
            return res.status(400).json({
                success: false,
                message: "An account with this email already exists. Please log in.",
            });
        }

        const hasEmailService = Boolean(
            (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim()) ||
            (process.env.BREVO_API_KEY && process.env.BREVO_API_KEY.trim()) ||
            (process.env.EMAIL_USER && process.env.EMAIL_PASS)
        );

        if (!hasEmailService) {
            console.error("[Auth OTP] No email provider configured (RESEND_API_KEY, BREVO_API_KEY, or EMAIL_USER/EMAIL_PASS).");
            return res.status(500).json({
                success: false,
                message: "Email service is not configured on the server. Please set RESEND_API_KEY (recommended) or EMAIL_USER/EMAIL_PASS in Render Environment variables.",
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

        await Otp.deleteMany({ email: normalizedEmail });

        await Otp.create({
            email: normalizedEmail,
            otp,
            expiresAt,
        });

        console.log(`[Auth OTP] Step 2: OTP record saved in MongoDB for ${maskedEmail}. Sending email...`);

        await sendMail({
            from: `"NGSkillForge" <${process.env.EMAIL_USER}>`,
            to: normalizedEmail,
            subject: "NGSkillForge — OTP Verification Code",
            text: `Your OTP verification code for NGSkillForge is: ${otp}\n\nThis code will expire in 5 minutes.`,
            html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
                <h2 style="color: #3b82f6;">NGSkillForge Account Verification</h2>
                <p>Use the following 6-digit code to complete your registration:</p>
                <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #0284c7; padding: 12px 0;">${otp}</div>
                <p style="color: #64748b; font-size: 13px;">This code expires in 5 minutes. If you did not request this code, please ignore this email.</p>
            </div>`,
        });

        console.log(`[Auth OTP] Step 3: Email delivered successfully for ${maskedEmail}. Returning HTTP 200.`);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
        });

    } catch (error) {
        if (normalizedEmail) {
            await Otp.deleteMany({ email: normalizedEmail }).catch(() => {});
        }

        console.error(`[Auth OTP] Step 3 (Failed): Error for ${maskedEmail}:`, error.code || error.message);

        let errorMessage = "Failed to send OTP email. Please try again.";
        if (error.code === "EAUTH") {
            errorMessage = "Email authentication failed. Please check EMAIL_USER and EMAIL_PASS (Gmail App Password).";
        } else if (error.code === "ENETUNREACH" || error.code === "ETIMEDOUT" || error.code === "ECONNREFUSED") {
            errorMessage = "Email server connection timed out or unreachable. Please try again shortly.";
        } else if (error.message) {
            errorMessage = error.message;
        }

        return res.status(500).json({
            success: false,
            message: errorMessage,
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
            isVerified: false,
            expiresAt: { $gte: new Date() },
        });



        if (!existingOtp) {

            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
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

        const { name, password } = req.body;
        const normalizedEmail = normalizeEmail(req.body.email);
        const effectiveRole =
            normalizedEmail === PRIMARY_ADMIN_EMAIL
                ? "admin"
                : "user";



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
            user: publicUser(user),
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
        }).select("+password");

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
                : "user";

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
            user: publicUser(user),
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

        const user = await User.findById(decoded.id).select("email role");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        const effectiveRole =
            normalizeEmail(user.email) === PRIMARY_ADMIN_EMAIL
                ? "admin"
                : "user";

        if (user.role !== effectiveRole) {
            user.role = effectiveRole;
            await user.save();
        }

        // Create a fresh access token without making the user log in again.
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



        return res.status(200).json({
            success: true,
            accessToken,
        });

    } catch (error) {

        return res.status(error.name === "TokenExpiredError" || error.name === "JsonWebTokenError" ? 401 : 500).json({
            success: false,
            message: "Refresh token failed",
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