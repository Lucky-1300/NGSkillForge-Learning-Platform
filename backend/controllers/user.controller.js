const User = require("../models/user.model");





const getProfile = async (req, res) => {

    try {

        const user = await User.findById(req.user.id)
        .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to get profile",
            error: error.message,
        });

    }

};





const getAllUsers = async (req, res) => {

    try {

        const users = await User.find()
        .select("-password");

        return res.status(200).json({
            success: true,
            users,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to fetch users",
            error: error.message,
        });

    }

};





const deleteUser = async (req, res) => {

    try {

        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        await User.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "User deleted successfully",
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to delete user",
            error: error.message,
        });

    }

};



module.exports = {
    getProfile,
    getAllUsers,
    deleteUser,
};