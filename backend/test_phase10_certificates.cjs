require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

const User = require('./models/user.model');
const Course = require('./models/course.model');
const Lecture = require('./models/lecture.model');
const Progress = require('./models/progress.model');
const Enrollment = require('./models/enrollment.model');
const Assessment = require('./models/assessment.model');
const AssessmentAttempt = require('./models/assessmentAttempt.model');
const Certificate = require('./models/certificate.model');
const StudentAchievement = require('./models/studentAchievement.model');

const {
    getMyCertificates,
    getCertificateById,
    downloadCertificatePdf,
    verifyCertificatePublic,
    claimCourseCertificate,
} = require('./controllers/certificate.controller');

const { getStudentDashboard } = require('./controllers/dashboard.controller');
const { evaluateAndAwardAchievements } = require('./services/achievement.service');
const { issueCertificateForStudent, generateUniqueCertificateId } = require('./services/certificate.service');

// Helper to create mock Express req & res
function createMockReqRes({ params = {}, query = {}, body = {}, user = null } = {}) {
    const req = { params, query, body, user };
    let responseData = null;
    let statusCode = 200;
    const headers = {};
    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        setHeader(name, value) {
            headers[name.toLowerCase()] = value;
            return this;
        },
        getHeader(name) {
            return headers[name.toLowerCase()];
        },
        json(data) {
            responseData = data;
            return this;
        },
        write(chunk) {
            if (!this.chunks) this.chunks = [];
            this.chunks.push(chunk);
        },
        end(data) {
            if (data) {
                if (!this.chunks) this.chunks = [];
                this.chunks.push(data);
            }
            this.ended = true;
        },
        getStatusCode() {
            return statusCode;
        },
        getData() {
            return responseData;
        },
    };
    return { req, res };
}

async function runPhase10Tests() {
    console.log('========================================================================');
    console.log('NGSkillForge Phase 10: Certificates, Student Dashboard & Achievements Test');
    console.log('========================================================================\n');

    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(mongoUri);
        console.log('✓ Connected to MongoDB');

        // Identify test Admin and Student users
        const adminUser = await User.findOne({ role: 'admin' });
        const studentUser = await User.findOne({ role: 'user' });
        const secondStudent = await User.findOne({ role: 'user', _id: { $ne: studentUser._id } }) || adminUser;

        if (!adminUser || !studentUser) {
            throw new Error('Admin or student user missing in test database');
        }

        console.log(`✓ Admin User: ${adminUser.name} (${adminUser.email})`);
        console.log(`✓ Student User: ${studentUser.name} (${studentUser.email})`);

        // Target Course: JavaScript Foundations
        const course = await Course.findOne({ title: { $regex: /javascript/i } }) || await Course.findOne();
        if (!course) throw new Error('Target test course not found');
        console.log(`✓ Target Course: "${course.title}" (${course._id})\n`);

        const totalLectures = await Lecture.countDocuments({ courseId: course._id });
        console.log(`✓ Course has ${totalLectures} total lectures.\n`);

        // Clean up previous test artifacts for deterministic test run
        await Certificate.deleteMany({ userId: studentUser._id, courseId: course._id });
        await StudentAchievement.deleteMany({ userId: studentUser._id });

        // -----------------------------------------------------------------
        // TEST 1: Incomplete Course -> Certificate is NOT Available
        // -----------------------------------------------------------------
        console.log('--- TEST 1: Incomplete Course Blocks Certificate Generation ---');
        // Reset progress to 0 for test
        await Progress.deleteMany({ userId: studentUser._id, courseId: course._id });
        await Enrollment.deleteMany({ user: studentUser._id, course: course._id });
        await AssessmentAttempt.deleteMany({ userId: studentUser._id, courseId: course._id });

        const { req: claimBlockReq, res: claimBlockRes } = createMockReqRes({
            params: { courseId: course._id.toString() },
            user: { _id: studentUser._id, role: 'user' },
        });

        await claimCourseCertificate(claimBlockReq, claimBlockRes);
        if (claimBlockRes.getStatusCode() === 400 && claimBlockRes.getData().success === false) {
            console.log(`✓ Incomplete course correctly blocked certificate: "${claimBlockRes.getData().message}"`);
        } else {
            throw new Error('Certificate was erroneously issued for an incomplete course!');
        }

        // -----------------------------------------------------------------
        // TEST 2: Complete Lectures & Pass Final Assessment
        // -----------------------------------------------------------------
        console.log('\n--- TEST 2: Student Completes Lectures & Passes Final Assessment ---');
        const lectures = await Lecture.find({ courseId: course._id });
        for (const lect of lectures) {
            await Progress.create({
                userId: studentUser._id,
                courseId: course._id,
                lectureId: lect._id,
                completed: true,
                completedAt: new Date(),
            });
        }
        console.log(`✓ Marked all ${lectures.length} lectures as completed in Progress.`);

        // Find or create published assessment
        let assessment = await Assessment.findOne({ courseId: course._id, status: 'published' });
        if (!assessment) {
            assessment = await Assessment.create({
                courseId: course._id,
                title: `${course.title} Final Assessment`,
                description: 'Final Assessment',
                status: 'published',
                passingPercentage: 70,
                questions: [
                    {
                        question: 'What keyword declares a block-scoped variable in JS?',
                        options: ['var', 'let', 'global'],
                        correctAnswer: 1,
                        explanation: 'let is block-scoped.',
                    },
                ],
                createdBy: adminUser._id,
            });
        }

        // Record a passing attempt (100% score)
        const passingAttempt = await AssessmentAttempt.create({
            userId: studentUser._id,
            courseId: course._id,
            assessmentId: assessment._id,
            attemptNumber: 1,
            answers: [
                {
                    questionId: assessment.questions[0]._id,
                    selectedOption: 1,
                    isCorrect: true,
                    correctAnswer: 1,
                    explanation: 'let is block-scoped.',
                },
            ],
            totalQuestions: 1,
            correctAnswers: 1,
            score: 1,
            percentage: 100,
            passingPercentage: 70,
            passed: true,
            status: 'submitted',
            startedAt: new Date(),
            submittedAt: new Date(),
        });
        console.log(`✓ Created passing assessment attempt (Score: 100%, Passed: true).`);

        // -----------------------------------------------------------------
        // TEST 3: Generate Certificate & Verify Unique ID
        // -----------------------------------------------------------------
        console.log('\n--- TEST 3: Certificate Issuance & Format Validation ---');
        const { req: claimOkReq, res: claimOkRes } = createMockReqRes({
            params: { courseId: course._id.toString() },
            user: { _id: studentUser._id, role: 'user' },
        });
        await claimCourseCertificate(claimOkReq, claimOkRes);
        const certData = claimOkRes.getData().certificate;
        if (!certData || !certData.certificateId) {
            throw new Error(`Failed to claim certificate: ${JSON.stringify(claimOkRes.getData())}`);
        }
        console.log(`✓ Certificate Issued Successfully!`);
        console.log(`  - Certificate ID: ${certData.certificateId}`);
        console.log(`  - Student Name: ${certData.studentName}`);
        console.log(`  - Course Name: ${certData.courseName}`);
        console.log(`  - Assessment Score: ${certData.assessmentScore}%`);

        // Validate certificate ID format: NGSF-[CODE]-[YEAR]-[TOKEN]
        const certIdPattern = /^NGSF-[A-Z0-9]+-\d{4}-[A-Z0-9]{6}$/;
        if (!certIdPattern.test(certData.certificateId)) {
            throw new Error(`Certificate ID "${certData.certificateId}" does not match required format (e.g. NGSF-JS-2026-A7K92X)`);
        }
        console.log(`✓ Certificate ID format validated against pattern: ${certIdPattern}`);

        // -----------------------------------------------------------------
        // TEST 4: Idempotency (Prevent Duplicate Certificates)
        // -----------------------------------------------------------------
        console.log('\n--- TEST 4: Idempotency Check (No Duplicates) ---');
        const { req: claimDupReq, res: claimDupRes } = createMockReqRes({
            params: { courseId: course._id.toString() },
            user: { _id: studentUser._id, role: 'user' },
        });
        await claimCourseCertificate(claimDupReq, claimDupRes);
        const dupCertData = claimDupRes.getData().certificate;
        if (dupCertData.certificateId !== certData.certificateId) {
            throw new Error('Duplicate certificate was generated instead of returning existing one');
        }

        const totalCertsInDb = await Certificate.countDocuments({
            userId: studentUser._id,
            courseId: course._id,
        });
        if (totalCertsInDb !== 1) {
            throw new Error(`Expected exactly 1 certificate document in DB, found ${totalCertsInDb}`);
        }
        console.log(`✓ Idempotency Confirmed: Exactly 1 certificate document exists for user + course.`);

        // -----------------------------------------------------------------
        // TEST 5: Student Dashboard API Integration
        // -----------------------------------------------------------------
        console.log('\n--- TEST 5: Student Dashboard API Delivery ---');
        const { req: dashReq, res: dashRes } = createMockReqRes({
            user: { _id: studentUser._id, role: 'user' },
        });
        await getStudentDashboard(dashReq, dashRes);
        const dashData = dashRes.getData();
        if (!dashData.success || !dashData.overview) {
            throw new Error('Failed to fetch student dashboard');
        }
        console.log(`✓ Student Dashboard Retrieved:`);
        console.log(`  - Enrolled: ${dashData.overview.enrolledCoursesCount}`);
        console.log(`  - Completed: ${dashData.overview.completedCoursesCount}`);
        console.log(`  - Certificates: ${dashData.overview.certificatesEarnedCount}`);
        console.log(`  - Completed Courses Count: ${dashData.completedCourses.length}`);
        console.log(`  - Achievements Count: ${dashData.achievements.length}`);
        console.log(`  - Recent Activity Items: ${dashData.recentActivity.length}`);

        if (dashData.completedCourses.length === 0 || !dashData.completedCourses[0].certificateId) {
            throw new Error('Completed courses on dashboard missing certificateId');
        }
        console.log(`✓ Completed course properly linked to Certificate ID: ${dashData.completedCourses[0].certificateId}`);

        // -----------------------------------------------------------------
        // TEST 6: Student My Certificates Endpoint
        // -----------------------------------------------------------------
        console.log('\n--- TEST 6: Student My Certificates API ---');
        const { req: myCertReq, res: myCertRes } = createMockReqRes({
            user: { _id: studentUser._id, role: 'user' },
        });
        await getMyCertificates(myCertReq, myCertRes);
        const myCertData = myCertRes.getData();
        if (!myCertData.success || myCertData.certificates.length === 0) {
            throw new Error('Failed to fetch student certificates list');
        }
        console.log(`✓ Found ${myCertData.certificates.length} certificate(s) on /api/certificates/my`);

        // -----------------------------------------------------------------
        // TEST 7: Single Certificate View by ID
        // -----------------------------------------------------------------
        console.log('\n--- TEST 7: Single Certificate Details View ---');
        const { req: getCertReq, res: getCertRes } = createMockReqRes({
            params: { certificateId: certData.certificateId },
        });
        await getCertificateById(getCertReq, getCertRes);
        const singleCert = getCertRes.getData().certificate;
        if (!singleCert || singleCert.certificateId !== certData.certificateId) {
            throw new Error('Failed to fetch certificate by ID');
        }
        console.log(`✓ Successfully retrieved certificate by ID: ${singleCert.certificateId}`);

        // -----------------------------------------------------------------
        // TEST 8: Server-Side PDF Generation & Streaming
        // -----------------------------------------------------------------
        console.log('\n--- TEST 8: Server-Side PDF Download Test ---');
        const { req: pdfReq, res: pdfRes } = createMockReqRes({
            params: { certificateId: certData.certificateId },
        });
        await downloadCertificatePdf(pdfReq, pdfRes);
        const contentType = pdfRes.getHeader('content-type');
        const contentDisp = pdfRes.getHeader('content-disposition');
        if (contentType !== 'application/pdf' || !contentDisp.includes('attachment')) {
            throw new Error(`Invalid PDF headers: contentType=${contentType}, disposition=${contentDisp}`);
        }
        console.log(`✓ PDF Headers verified: Content-Type=${contentType}, Content-Disposition=${contentDisp}`);

        // -----------------------------------------------------------------
        // TEST 9: Public Certificate Verification (No Login Required)
        // -----------------------------------------------------------------
        console.log('\n--- TEST 9: Public Certificate Verification (Unauthenticated) ---');
        const { req: verifyReq, res: verifyRes } = createMockReqRes({
            params: { certificateId: certData.certificateId },
            user: null, // Public unauthenticated request
        });
        await verifyCertificatePublic(verifyReq, verifyRes);
        const verifyData = verifyRes.getData();
        if (!verifyData.success || !verifyData.valid || verifyData.certificate.certificateId !== certData.certificateId) {
            throw new Error(`Public verification failed: ${JSON.stringify(verifyData)}`);
        }
        console.log(`✓ Public Verification Succeeded:`);
        console.log(`  - Verified Status: ${verifyData.certificate.status}`);
        console.log(`  - Student: ${verifyData.certificate.studentName}`);
        console.log(`  - Course: ${verifyData.certificate.courseName}`);
        console.log(`  - Score: ${verifyData.certificate.assessmentScore}%`);

        // Check that NO private data is exposed
        if (verifyData.certificate.password || verifyData.certificate.email || verifyData.certificate.jwt) {
            throw new Error('SECURITY VIOLATION: Private credentials exposed on public verification endpoint!');
        }
        console.log(`✓ SECURITY CHECK PASSED: Zero private credentials exposed in public verification payload.`);

        // -----------------------------------------------------------------
        // TEST 10: Invalid Certificate ID Returns 404
        // -----------------------------------------------------------------
        console.log('\n--- TEST 10: Invalid Certificate ID Rejection ---');
        const { req: badVerifyReq, res: badVerifyRes } = createMockReqRes({
            params: { certificateId: 'NGSF-FAKE-2026-000000' },
        });
        await verifyCertificatePublic(badVerifyReq, badVerifyRes);
        if (badVerifyRes.getStatusCode() === 404 && badVerifyRes.getData().valid === false) {
            console.log(`✓ Invalid certificate correctly rejected with 404 Not Found: "${badVerifyRes.getData().message}"`);
        } else {
            throw new Error('Invalid certificate ID was not properly rejected with 404');
        }

        // -----------------------------------------------------------------
        // TEST 11: Achievement Engine Evaluation
        // -----------------------------------------------------------------
        console.log('\n--- TEST 11: Achievement Engine Evaluation ---');
        const achievementRes = await evaluateAndAwardAchievements(studentUser._id);
        console.log(`✓ Total Achievements in System: ${achievementRes.allAchievements.length}`);
        achievementRes.allAchievements.forEach((ach) => {
            console.log(`  - ${ach.icon} ${ach.title}: ${ach.isEarned ? 'EARNED ✓' : 'LOCKED 🔒'} (${ach.description})`);
        });

        const earnedKeys = new Set(achievementRes.earnedAchievements.map((a) => a.achievementKey));
        if (!earnedKeys.has('FIRST_LECTURE') || !earnedKeys.has('FIRST_ASSESSMENT') || !earnedKeys.has('FIRST_COURSE')) {
            throw new Error('Expected achievements were not awarded correctly');
        }
        console.log(`✓ Key achievements (FIRST_LECTURE, FIRST_ASSESSMENT, FIRST_COURSE) confirmed awarded in DB.`);

        console.log('\n========================================================================');
        console.log('✅ ALL PHASE 10 CERTIFICATES, DASHBOARD & ACHIEVEMENTS TESTS PASSED!');
        console.log('========================================================================');
    } catch (err) {
        console.error('\n❌ PHASE 10 TEST FAILED:', err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

runPhase10Tests();
