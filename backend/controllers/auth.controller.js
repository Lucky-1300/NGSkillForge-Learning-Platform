const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const otpGenerator = require("otp-generator");

const Otp = require("../models/otp.model");

const transporter = require("../config/mail.config");





const sendOtp = async (req, res) => {

    try {

        const { email } = req.body;



        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });



        const expiresAt = new Date(
            Date.now() + 5 * 60 * 1000
        );



        await Otp.create({
            email,
            otp,
            expiresAt,
        });



        await transporter.sendMail({
            from: process.env.EMAIL_USER,

            to: email,

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

        const { email, otp } = req.body;



        const existingOtp = await Otp.findOne({
            email,
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

        const { name, email, password, role } = req.body;



        const existingUser = await User.findOne({ email });

        if (existingUser) {

            return res.status(400).json({
                success: false,
                message: "User already exists",
            });

        }



        const verifiedOtp = await Otp.findOne({
            email,
            isVerified: true,
        });



        if (!verifiedOtp) {

            return res.status(400).json({
                success: false,
                message: "Please verify OTP first",
            });

        }



        const hashedPassword = await bcrypt.hash(password, 10);



        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        });



        await Otp.deleteOne({ email });



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

       
       const accessToken = jwt.sign(
    {
        id: user._id,
        role: user.role,
    },
    process.env.JWT_SECRET,
    {
        expiresIn: "15m",
    }
);



const refreshToken = jwt.sign(
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



        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );



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