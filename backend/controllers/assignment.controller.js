const Assignment = require("../models/assignment.model");

const cloudinary = require("cloudinary").v2;



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});




const uploadAssignment = async (req, res) => {

    try {

        const { title, description, course } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "File is required",
            });
        }



        const result = await cloudinary.uploader.upload(
            req.file.path,
            {
                resource_type: "auto",
                folder: "assignments",
            }
        );



        const assignment = await Assignment.create({
            title,
            description,
            fileName: req.file.originalname,
            fileUrl: result.secure_url,
            publicId: result.public_id,
            uploadedBy: req.user.id,
            course,
        });



        return res.status(201).json({
            success: true,
            message: "Assignment uploaded successfully",
            assignment,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Assignment upload failed",
            error: error.message,
        });

    }

};





const getAllAssignments = async (req, res) => {

    try {

        const assignments = await Assignment.find()
        .populate("uploadedBy", "name email")
        .populate("course", "title");



        return res.status(200).json({
            success: true,
            assignments,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to fetch assignments",
            error: error.message,
        });

    }

};





const getSingleAssignment = async (req, res) => {

    try {

        const assignment = await Assignment.findById(
            req.params.id
        )
        .populate("uploadedBy", "name email")
        .populate("course", "title");



        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found",
            });
        }



        return res.status(200).json({
            success: true,
            assignment,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to fetch assignment",
            error: error.message,
        });

    }

};





const deleteAssignment = async (req, res) => {

    try {

        const assignment = await Assignment.findById(
            req.params.id
        );



        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found",
            });
        }



        await cloudinary.uploader.destroy(
            assignment.publicId
        );



        await Assignment.findByIdAndDelete(
            req.params.id
        );



        return res.status(200).json({
            success: true,
            message: "Assignment deleted successfully",
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to delete assignment",
            error: error.message,
        });

    }

};



module.exports = {
    uploadAssignment,
    getAllAssignments,
    getSingleAssignment,
    deleteAssignment,
};