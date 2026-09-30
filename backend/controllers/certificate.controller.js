const Certificate = require("../models/certificate.model");
const Course = require("../models/course.model");
const {
    issueCertificateForStudent,
    createCertificatePdfDocument,
} = require("../services/certificate.service");
const { resolveCourse } = require("../services/courseHelper");

/**
 * GET /api/certificates/my
 * Fetch all certificates earned by the authenticated student
 */
const getMyCertificates = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required." });
        }

        const certificates = await Certificate.find({ userId })
            .populate("courseId", "title category level thumbnail duration")
            .sort({ completionDate: -1, createdAt: -1 });

        return res.status(200).json({
            success: true,
            certificates: certificates.map((c) => ({
                _id: c._id,
                certificateId: c.certificateId,
                courseId: c.courseId?._id || c.courseId,
                courseName: c.courseName,
                courseDetails: c.courseId,
                studentName: c.studentName,
                completionDate: c.completionDate,
                assessmentScore: c.assessmentScore,
                issuedAt: c.issuedAt,
            })),
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch student certificates.",
            error: error.message,
        });
    }
};

/**
 * GET /api/certificates/:certificateId
 * Fetch single certificate by unique certificate ID (e.g. NGSF-JS-2026-A7K92X) or Mongo _id
 */
const getCertificateById = async (req, res) => {
    try {
        const { certificateId } = req.params;
        const query = certificateId.length === 24 && /^[0-9a-fA-F]{24}$/.test(certificateId)
            ? { $or: [{ _id: certificateId }, { certificateId: certificateId.toUpperCase() }] }
            : { certificateId: certificateId.toUpperCase() };

        const certificate = await Certificate.findOne(query).populate("courseId", "title category level thumbnail duration");

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: "Certificate not found.",
            });
        }

        return res.status(200).json({
            success: true,
            certificate: {
                _id: certificate._id,
                certificateId: certificate.certificateId,
                courseId: certificate.courseId?._id || certificate.courseId,
                courseName: certificate.courseName,
                courseDetails: certificate.courseId,
                studentName: certificate.studentName,
                completionDate: certificate.completionDate,
                assessmentScore: certificate.assessmentScore,
                issuedAt: certificate.issuedAt,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to load certificate.",
            error: error.message,
        });
    }
};

/**
 * GET /api/certificates/:certificateId/download
 * Generate and stream server-side verified Certificate PDF
 */
const downloadCertificatePdf = async (req, res) => {
    try {
        const { certificateId } = req.params;
        const query = certificateId.length === 24 && /^[0-9a-fA-F]{24}$/.test(certificateId)
            ? { $or: [{ _id: certificateId }, { certificateId: certificateId.toUpperCase() }] }
            : { certificateId: certificateId.toUpperCase() };

        const certificate = await Certificate.findOne(query);

        if (!certificate) {
            return res.status(404).json({
                success: false,
                message: "Certificate not found.",
            });
        }

        // Set response headers for PDF download
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="NGSkillForge-Certificate-${certificate.certificateId}.pdf"`
        );

        // Build and pipe PDF stream
        const pdfDoc = createCertificatePdfDocument(certificate);
        pdfDoc.pipe(res);
        pdfDoc.end();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to generate certificate PDF.",
            error: error.message,
        });
    }
};

/**
 * GET /api/certificates/verify/:certificateId
 * Public endpoint to verify certificate authenticity without requiring authentication
 * Strictly sanitizes output to expose only verification details
 */
const verifyCertificatePublic = async (req, res) => {
    try {
        const { certificateId } = req.params;
        if (!certificateId || !certificateId.trim()) {
            return res.status(400).json({
                success: false,
                valid: false,
                message: "Certificate ID is required.",
            });
        }

        const cleanId = certificateId.trim().toUpperCase();
        const certificate = await Certificate.findOne({ certificateId: cleanId });

        if (!certificate) {
            return res.status(404).json({
                success: false,
                valid: false,
                message: "Certificate Not Found. The specified ID does not match any authentic NGSkillForge records.",
            });
        }

        // Return strictly sanitized public verification details (NO passwords, emails, tokens, internal IDs)
        return res.status(200).json({
            success: true,
            valid: true,
            certificate: {
                certificateId: certificate.certificateId,
                studentName: certificate.studentName,
                courseName: certificate.courseName,
                completionDate: certificate.completionDate,
                assessmentScore: certificate.assessmentScore,
                issuedAt: certificate.issuedAt,
                status: "Verified Authentic",
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            valid: false,
            message: "Failed to verify certificate.",
            error: error.message,
        });
    }
};

/**
 * POST /api/certificates/claim/:courseId
 * On-demand certificate issuance for an eligible student
 */
const claimCourseCertificate = async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user?.id || req.user?._id;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Authentication required." });
        }

        const course = await resolveCourse(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found." });
        }

        const { certificate, isNew } = await issueCertificateForStudent(userId, course._id);

        return res.status(isNew ? 201 : 200).json({
            success: true,
            message: isNew
                ? "🎉 Congratulations! Your verified course completion certificate has been generated."
                : "Your course completion certificate is ready.",
            certificate,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || "Failed to claim certificate.",
        });
    }
};

module.exports = {
    getMyCertificates,
    getCertificateById,
    downloadCertificatePdf,
    verifyCertificatePublic,
    claimCourseCertificate,
};
