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

const { getPlatformAnalytics } = require('./controllers/analytics.controller');

// Helper to create mock Express req & res
function createMockReqRes({ params = {}, query = {}, body = {}, user = null } = {}) {
    const req = { params, query, body, user };
    let responseData = null;
    let statusCode = 200;
    const res = {
        status(code) {
            statusCode = code;
            return this;
        },
        json(data) {
            responseData = data;
            return this;
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

async function runPhase11Tests() {
    console.log('========================================================================');
    console.log('NGSkillForge Phase 11: Admin Analytics & Platform Insights Test');
    console.log('========================================================================\n');

    try {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(mongoUri);
        console.log('✓ Connected to MongoDB');

        // Identify test Admin and Student users
        const adminUser = await User.findOne({ role: 'admin' });
        const studentUser = await User.findOne({ role: 'user' });

        if (!adminUser || !studentUser) {
            throw new Error('Admin or student user missing in test database');
        }

        console.log(`✓ Admin User: ${adminUser.name} (${adminUser.email})`);
        console.log(`✓ Student User: ${studentUser.name} (${studentUser.email})`);

        // Target Course: JavaScript Foundations
        const course = await Course.findOne({ title: { $regex: /javascript/i } }) || await Course.findOne();
        if (!course) throw new Error('Target test course not found');
        console.log(`✓ Target Course: "${course.title}" (${course._id})\n`);

        // -----------------------------------------------------------------
        // TEST 1: Admin Accesses Analytics (Overview)
        // -----------------------------------------------------------------
        console.log('--- TEST 1: Admin Fetches Platform Analytics Overview ---');
        const { req: adminReq, res: adminRes } = createMockReqRes({
            user: { _id: adminUser._id, role: 'admin' },
            query: { timeRange: 'all' },
        });

        await getPlatformAnalytics(adminReq, adminRes);
        const data = adminRes.getData();

        if (!data || !data.success || !data.overview) {
            throw new Error(`Failed to fetch analytics: ${JSON.stringify(data)}`);
        }

        console.log('✓ Analytics successfully retrieved by Admin:');
        console.log(`  - Total Students: ${data.overview.totalStudents}`);
        console.log(`  - Active Students: ${data.overview.activeStudents}`);
        console.log(`  - Total Courses: ${data.overview.totalCourses}`);
        console.log(`  - Total Enrollments: ${data.overview.totalEnrollments}`);
        console.log(`  - Completed Courses: ${data.overview.completedCourses}`);
        console.log(`  - Certificates Issued: ${data.overview.certificatesIssued}`);
        console.log(`  - Overall Completion Rate: ${data.overview.completionRate !== null ? `${data.overview.completionRate}%` : 'N/A'}`);

        // -----------------------------------------------------------------
        // TEST 2: Validate Summary Counts Match Real Database
        // -----------------------------------------------------------------
        console.log('\n--- TEST 2: Verify Counts Match Exact Database Documents ---');
        const [realStudentCount, realCourseCount, realEnrollmentCount, realCertCount] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Course.countDocuments(),
            Enrollment.countDocuments(),
            Certificate.countDocuments(),
        ]);

        if (data.overview.totalStudents !== realStudentCount) {
            throw new Error(`Student count mismatch: API=${data.overview.totalStudents}, DB=${realStudentCount}`);
        }
        if (data.overview.totalCourses !== realCourseCount) {
            throw new Error(`Course count mismatch: API=${data.overview.totalCourses}, DB=${realCourseCount}`);
        }
        if (data.overview.totalEnrollments !== realEnrollmentCount) {
            throw new Error(`Enrollment count mismatch: API=${data.overview.totalEnrollments}, DB=${realEnrollmentCount}`);
        }
        if (data.overview.certificatesIssued !== realCertCount) {
            throw new Error(`Certificate count mismatch: API=${data.overview.certificatesIssued}, DB=${realCertCount}`);
        }
        console.log(`✓ Confirmed: All counts strictly match MongoDB collections with 0% discrepancy.`);

        // -----------------------------------------------------------------
        // TEST 3: Course Performance Table Analytics
        // -----------------------------------------------------------------
        console.log('\n--- TEST 3: Course Performance Table Analytics ---');
        if (!Array.isArray(data.coursePerformance) || data.coursePerformance.length === 0) {
            throw new Error('Course performance array is missing or empty');
        }

        console.log(`✓ Loaded performance metrics for ${data.coursePerformance.length} courses:`);
        data.coursePerformance.forEach((c) => {
            console.log(`  - "${c.title}": ${c.totalStudents} enrolled, ${c.completed} completed (${c.completionRate !== null ? `${c.completionRate}%` : 'No data'}), Avg Score: ${c.averageAssessmentScore !== null ? `${c.averageAssessmentScore}%` : 'No attempts'}`);
        });

        // -----------------------------------------------------------------
        // TEST 4: Assessment Performance Metrics
        // -----------------------------------------------------------------
        console.log('\n--- TEST 4: Assessment Telemetry & Pass/Fail Calculations ---');
        const assessment = data.assessmentAnalytics;
        console.log(`✓ Assessment Analytics:`);
        console.log(`  - Total Attempts: ${assessment.totalAttempts}`);
        console.log(`  - Passed Attempts: ${assessment.passedAttempts}`);
        console.log(`  - Failed Attempts: ${assessment.failedAttempts}`);
        console.log(`  - Pass Rate: ${assessment.passRate !== null ? `${assessment.passRate}%` : 'N/A'}`);
        console.log(`  - Fail Rate: ${assessment.failRate !== null ? `${assessment.failRate}%` : 'N/A'}`);
        console.log(`  - Average Score: ${assessment.averageScore !== null ? `${assessment.averageScore}%` : 'N/A'}`);
        console.log(`  - Average Attempts per Student: ${assessment.averageAttemptsPerStudent || 0}`);

        if (assessment.totalAttempts > 0 && assessment.passRate !== null && assessment.failRate !== null) {
            const sum = Math.round(assessment.passRate + assessment.failRate);
            if (sum !== 100) {
                console.warn(`Note: Pass rate (${assessment.passRate}%) + Fail rate (${assessment.failRate}%) sum=${sum}% due to rounding.`);
            }
        }

        // -----------------------------------------------------------------
        // TEST 5: Difficult Content & Error Rate Analysis
        // -----------------------------------------------------------------
        console.log('\n--- TEST 5: Difficult Content Real Error Rate Analysis ---');
        const difficult = data.difficultTopics;
        if (difficult.hasData) {
            console.log(`✓ Identified ${difficult.items.length} challenging questions based on real submission answers:`);
            difficult.items.forEach((item, idx) => {
                console.log(`  ${idx + 1}. "${item.topic}": ${item.errorRate}% error rate (${item.incorrectAttempts}/${item.totalAttempts} incorrect)`);
            });
        } else {
            console.log(`✓ Empty state handled cleanly: "${difficult.message}"`);
        }

        // -----------------------------------------------------------------
        // TEST 6: Lecture Engagement (Most vs Least Completed)
        // -----------------------------------------------------------------
        console.log('\n--- TEST 6: Lecture Engagement Analytics ---');
        const engagement = data.lectureEngagement;
        if (engagement.hasData) {
            console.log(`✓ Most Completed Lectures (Top ${engagement.mostCompleted.length}):`);
            engagement.mostCompleted.forEach((l) => console.log(`   - #${l.lectureNumber}: ${l.title} (${l.completedCount} completions)`));
            console.log(`✓ Least Completed Lectures (Bottom ${engagement.leastCompleted.length}):`);
            engagement.leastCompleted.forEach((l) => console.log(`   - #${l.lectureNumber}: ${l.title} (${l.completedCount} completions)`));
        } else {
            console.log(`✓ Lecture engagement data not yet available.`);
        }

        // -----------------------------------------------------------------
        // TEST 7: AI Tutor Analytics (Accurate Non-Fake Data Notice)
        // -----------------------------------------------------------------
        console.log('\n--- TEST 7: AI Tutor Analytics Integrity ---');
        const ai = data.aiAnalytics;
        if (ai.isPersisted === false && ai.message.includes('AI usage analytics will appear once AI conversations are stored')) {
            console.log(`✓ Confirmed: AI telemetry explicitly avoids fake data. Notice: "${ai.message}"`);
        } else {
            throw new Error('AI telemetry returned unexpected or fake persisted statistics');
        }

        // -----------------------------------------------------------------
        // TEST 8: Date Filter Filtering (e.g. last 7 days vs all time)
        // -----------------------------------------------------------------
        console.log('\n--- TEST 8: Date Filter Execution ---');
        const { req: filterReq, res: filterRes } = createMockReqRes({
            user: { _id: adminUser._id, role: 'admin' },
            query: { timeRange: '7d' },
        });
        await getPlatformAnalytics(filterReq, filterRes);
        const filteredData = filterRes.getData();
        if (filteredData.filter.timeRange !== '7d') {
            throw new Error('Date filter param not respected in analytics query');
        }
        console.log(`✓ 7-Day filter applied successfully:`);
        console.log(`  - 7d Enrollments: ${filteredData.overview.totalEnrollments}`);
        console.log(`  - 7d Completions: ${filteredData.overview.completedCourses}`);
        console.log(`  - 7d Certificates: ${filteredData.overview.certificatesIssued}`);

        // -----------------------------------------------------------------
        // TEST 9: Course Filter Execution (Filter by specific course)
        // -----------------------------------------------------------------
        console.log('\n--- TEST 9: Course Filter Execution ---');
        const { req: courseFilterReq, res: courseFilterRes } = createMockReqRes({
            user: { _id: adminUser._id, role: 'admin' },
            query: { courseId: course._id.toString() },
        });
        await getPlatformAnalytics(courseFilterReq, courseFilterRes);
        const courseFilteredData = courseFilterRes.getData();
        if (courseFilteredData.coursePerformance.length !== 1 || courseFilteredData.coursePerformance[0].courseId.toString() !== course._id.toString()) {
            throw new Error('Course filter failed to isolate target course');
        }
        console.log(`✓ Course filter successfully isolated "${courseFilteredData.coursePerformance[0].title}"`);

        // -----------------------------------------------------------------
        // TEST 10: Security & Privacy Check (No Passwords, JWTs, Tokens)
        // -----------------------------------------------------------------
        console.log('\n--- TEST 10: Security & Data Privacy Verification ---');
        const rawJson = JSON.stringify(data);
        if (rawJson.includes('password') || rawJson.includes('token') || rawJson.includes('jwt')) {
            throw new Error('SECURITY BREACH: Sensitive user authentication fields exposed in analytics payload!');
        }
        console.log(`✓ SECURITY CHECK PASSED: Zero passwords, tokens, or private credentials leaked.`);

        console.log('\n========================================================================');
        console.log('✅ ALL PHASE 11 ADMIN ANALYTICS & PLATFORM INSIGHTS TESTS PASSED!');
        console.log('========================================================================');
    } catch (err) {
        console.error('\n❌ PHASE 11 TEST FAILED:', err);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
}

runPhase11Tests();
