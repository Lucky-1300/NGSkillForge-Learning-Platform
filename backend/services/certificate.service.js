const crypto = require("crypto");
const PDFDocument = require("pdfkit");
const Certificate = require("../models/certificate.model");
const User = require("../models/user.model");
const Course = require("../models/course.model");
const Lecture = require("../models/lecture.model");
const Progress = require("../models/progress.model");
const Enrollment = require("../models/enrollment.model");
const AssessmentAttempt = require("../models/assessmentAttempt.model");
const { evaluateAndAwardAchievements } = require("./achievement.service");

/**
 * Generate a unique, professional certificate ID (e.g. NGSF-JS-2026-A7K92X)
 */
async function generateUniqueCertificateId(courseTitle = "COURSE") {
    let slug = "GEN";
    if (courseTitle) {
        const words = courseTitle.trim().toUpperCase().split(/\s+/);
        if (words.length >= 2) {
            slug = (words[0].slice(0, 2) + words[1].slice(0, 2)).replace(/[^A-Z]/g, "");
        } else {
            slug = words[0].slice(0, 4).replace(/[^A-Z]/g, "");
        }
        if (!slug || slug.length < 2) slug = "PRO";
    }

    const year = new Date().getFullYear();
    let isUnique = false;
    let certificateId = "";

    while (!isUnique) {
        const randomToken = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6 chars (e.g. A7K92X)
        certificateId = `NGSF-${slug}-${year}-${randomToken}`;

        const existing = await Certificate.findOne({ certificateId });
        if (!existing) {
            isUnique = true;
        }
    }

    return certificateId;
}

/**
 * Issue or retrieve a certificate for a student upon course completion
 * Strictly validates server-side eligibility (100% lectures + passed assessment)
 */
async function issueCertificateForStudent(userId, courseId) {
    if (!userId || !courseId) {
        throw new Error("User ID and Course ID are required to issue a certificate.");
    }

    // 1. Check if certificate already exists (prevent duplicates)
    const existingCert = await Certificate.findOne({ userId, courseId });
    if (existingCert) {
        return {
            certificate: existingCert,
            isNew: false,
        };
    }

    // 2. Fetch User and Course details
    const [user, course, totalLectures] = await Promise.all([
        User.findById(userId),
        Course.findById(courseId),
        Lecture.countDocuments({ courseId }),
    ]);

    if (!user) throw new Error("Student account not found.");
    if (!course) throw new Error("Course not found.");

    // 3. Verify Prerequisites Server-side (Lectures 100%)
    if (totalLectures > 0) {
        const completedLecturesCount = await Progress.countDocuments({
            userId,
            courseId,
            completed: true,
        });

        if (completedLecturesCount < totalLectures) {
            throw new Error(`Incomplete lectures. Student completed ${completedLecturesCount} of ${totalLectures} lectures.`);
        }
    }

    // 4. Verify Final Assessment Passed Server-side
    const bestPassedAttempt = await AssessmentAttempt.findOne({
        userId,
        courseId,
        passed: true,
    }).sort({ percentage: -1, createdAt: -1 });

    if (!bestPassedAttempt) {
        throw new Error("Student has not passed the final assessment for this course.");
    }

    const assessmentScore = bestPassedAttempt.percentage || 100;
    const completionDate = bestPassedAttempt.submittedAt || new Date();

    // 5. Generate Unique Certificate ID & Save Record
    const certificateId = await generateUniqueCertificateId(course.title);

    const certificate = await Certificate.create({
        certificateId,
        userId: user._id,
        courseId: course._id,
        studentName: user.name || "Student",
        courseName: course.title,
        completionDate,
        assessmentScore,
        issuedAt: new Date(),
        pdfGenerated: true,
    });

    // 6. Update Enrollment Course Completion Record
    await Enrollment.findOneAndUpdate(
        { user: user._id, course: course._id },
        {
            $set: {
                courseCompleted: true,
                completedAt: completionDate,
                assessmentPassed: true,
                progress: 100,
            },
            $max: {
                bestAssessmentScore: assessmentScore,
            },
        },
        { upsert: true, returnDocument: "after" }
    );

    // 7. Evaluate and award achievements
    await evaluateAndAwardAchievements(user._id);

    return {
        certificate,
        isNew: true,
    };
}

/**
 * Generate a PDF stream/buffer for a certificate
 * Layout: Landscape A4 (841.89 x 595.28 points) with modern, elegant design
 */
function createCertificatePdfDocument(certificate) {
    const doc = new PDFDocument({
        size: "A4",
        layout: "landscape",
        margins: { top: 30, bottom: 30, left: 30, right: 30 },
        info: {
            Title: `Certificate of Completion - ${certificate.courseName}`,
            Author: "NGSkillForge Learning Platform",
            Subject: `Verified Completion Certificate for ${certificate.studentName}`,
            Keywords: "certificate, completion, NGSkillForge, verified",
        },
    });

    const width = 841.89;
    const height = 595.28;

    // --- Background Fill ---
    doc.rect(0, 0, width, height).fill("#0B0F19");

    // --- Outer Decorative Border ---
    doc.rect(20, 20, width - 40, height - 40)
        .lineWidth(2)
        .stroke("#3B82F6");

    // --- Inner Golden Accent Border ---
    doc.rect(28, 28, width - 56, height - 56)
        .lineWidth(1)
        .stroke("#F59E0B");

    // --- Corner Ornaments ---
    const cornerSize = 24;
    // Top-Left
    doc.rect(34, 34, cornerSize, cornerSize).fill("#1E293B");
    // Top-Right
    doc.rect(width - 34 - cornerSize, 34, cornerSize, cornerSize).fill("#1E293B");
    // Bottom-Left
    doc.rect(34, height - 34 - cornerSize, cornerSize, cornerSize).fill("#1E293B");
    // Bottom-Right
    doc.rect(width - 34 - cornerSize, height - 34 - cornerSize, cornerSize, cornerSize).fill("#1E293B");

    // --- Platform Brand Header ---
    doc.fillColor("#60A5FA")
        .fontSize(14)
        .font("Helvetica-Bold")
        .text("NGSKILLFORGE LEARNING PLATFORM", 0, 65, { align: "center", characterSpacing: 2 });

    // --- Certificate Title ---
    doc.fillColor("#FFFFFF")
        .fontSize(28)
        .font("Helvetica-Bold")
        .text("CERTIFICATE OF COMPLETION", 0, 95, { align: "center", characterSpacing: 3 });

    doc.fillColor("#94A3B8")
        .fontSize(12)
        .font("Helvetica")
        .text("THIS IS PROUDLY PRESENTED TO", 0, 140, { align: "center", characterSpacing: 1.5 });

    // --- Student Name ---
    doc.fillColor("#38BDF8")
        .fontSize(32)
        .font("Helvetica-Bold")
        .text(certificate.studentName.toUpperCase(), 0, 175, { align: "center" });

    // Underline accent for student name
    doc.moveTo(width / 2 - 140, 218)
        .lineTo(width / 2 + 140, 218)
        .lineWidth(1.5)
        .stroke("#F59E0B");

    // --- Course Completion Statement ---
    doc.fillColor("#E2E8F0")
        .fontSize(12)
        .font("Helvetica")
        .text("has successfully mastered the comprehensive curriculum and passed the final assessment for", 0, 235, { align: "center" });

    // --- Course Title ---
    doc.fillColor("#FBBF24")
        .fontSize(22)
        .font("Helvetica-Bold")
        .text(certificate.courseName, 0, 260, { align: "center" });

    // --- Score & Status Badge ---
    const scoreText = `Assessment Score: ${certificate.assessmentScore}%  •  Status: Verified Complete`;
    doc.fillColor("#34D399")
        .fontSize(13)
        .font("Helvetica-Bold")
        .text(scoreText, 0, 305, { align: "center" });

    // --- Details Grid at Bottom ---
    const formattedDate = new Date(certificate.completionDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const col1X = 75;
    const col2X = width / 2 - 75;
    const col3X = width - 235;
    const metaY = 380;

    // Date Column
    doc.fillColor("#94A3B8").fontSize(10).font("Helvetica").text("DATE OF COMPLETION", col1X, metaY);
    doc.fillColor("#FFFFFF").fontSize(12).font("Helvetica-Bold").text(formattedDate, col1X, metaY + 16);
    doc.moveTo(col1X, metaY + 34).lineTo(col1X + 160, metaY + 34).lineWidth(1).stroke("#475569");

    // Verification Seal / Authority Column
    doc.fillColor("#94A3B8").fontSize(10).font("Helvetica").text("ISSUING AUTHORITY", col2X, metaY, { width: 150, align: "center" });
    doc.fillColor("#60A5FA").fontSize(12).font("Helvetica-Bold").text("NGSkillForge Academic Board", col2X, metaY + 16, { width: 150, align: "center" });
    doc.moveTo(col2X, metaY + 34).lineTo(col2X + 150, metaY + 34).lineWidth(1).stroke("#475569");

    // Certificate ID Column
    doc.fillColor("#94A3B8").fontSize(10).font("Helvetica").text("CERTIFICATE ID", col3X, metaY);
    doc.fillColor("#FBBF24").fontSize(12).font("Helvetica-Bold").text(certificate.certificateId, col3X, metaY + 16);
    doc.moveTo(col3X, metaY + 34).lineTo(col3X + 160, metaY + 34).lineWidth(1).stroke("#475569");

    // --- Footer Verification Link ---
    doc.fillColor("#64748B")
        .fontSize(9)
        .font("Helvetica")
        .text(`Verify authenticity at: https://ngskillforge.com/verify-certificate  |  Certificate ID: ${certificate.certificateId}`, 0, 520, { align: "center" });

    return doc;
}

module.exports = {
    generateUniqueCertificateId,
    issueCertificateForStudent,
    createCertificatePdfDocument,
};
