require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Course = require('./models/course.model');
const Lecture = require('./models/lecture.model');
const User = require('./models/user.model');
const Progress = require('./models/progress.model');
const { getCourseProgress, markLectureComplete, toggleLectureComplete, recordLectureAccess } = require('./controllers/progress.controller');

async function runTests() {
    console.log('--- STARTING PHASE 5 PROGRESS PIPELINE TESTS ---');
    await mongoose.connect(process.env.MONGO_URI);

    // 1. Fetch real student and admin users
    const studentUser = await User.findOne({ email: 'luckykumari24@navgurukul.org' });
    const adminUser = await User.findOne({ email: (process.env.PRIMARY_ADMIN_EMAIL || 'luckykumari42774@gmail.com').toLowerCase() });

    console.log('✓ Found Student User:', studentUser?.email, studentUser?._id);
    console.log('✓ Found Admin User:', adminUser?.email, adminUser?._id);

    // 2. Fetch a course with lectures
    const jsCourse = await Course.findOne({ title: /javascript foundations/i });
    const jsLectures = await Lecture.find({ courseId: jsCourse._id }).sort({ lectureNumber: 1 });
    console.log(`✓ Testing with course "${jsCourse.title}" (${jsLectures.length} lectures)`);

    // Clean any prior test progress for studentUser in jsCourse
    await Progress.deleteMany({ userId: studentUser._id, courseId: jsCourse._id });

    // Mock Express req/res
    const mockRes = () => {
        const res = {
            statusCode: 200,
            data: null,
            status(code) { this.statusCode = code; return this; },
            json(d) { this.data = d; return this; },
        };
        return res;
    };

    // Test A: Initial progress check (0 completed)
    const reqA = { params: { courseId: jsCourse._id.toString() }, user: { id: studentUser._id.toString() } };
    const resA = mockRes();
    await getCourseProgress(reqA, resA);
    console.log('\n[Test A] Initial Progress:');
    console.log(' - Completed Count:', resA.data.completedCount);
    console.log(' - Progress Percentage:', resA.data.progressPercentage + '%');
    console.log(' - Continue Learning Lecture:', resA.data.continueLearningLecture?.lectureNumber, resA.data.continueLearningLecture?.title);
    if (resA.data.completedCount !== 0 || resA.data.continueLearningLecture?.lectureNumber !== 1) {
        throw new Error('Test A Failed: Expected 0 completed and Lecture 1 as continue target');
    }

    // Test B: Access lecture 2
    const lec2 = jsLectures[1];
    const reqB = { params: { lectureId: lec2._id.toString() }, user: { id: studentUser._id.toString() } };
    const resB = mockRes();
    await recordLectureAccess(reqB, resB);
    console.log('\n[Test B] Access Lecture 2:');
    console.log(' - Success:', resB.data.success);
    console.log(' - Last Accessed Recorded:', resB.data.lastAccessedAt);

    // Verify continue learning is now Lecture 2 (since it was accessed and is incomplete)
    const resBProgress = mockRes();
    await getCourseProgress(reqA, resBProgress);
    console.log(' - Continue Learning now targets:', resBProgress.data.continueLearningLecture?.lectureNumber);
    if (resBProgress.data.continueLearningLecture?.lectureNumber !== 2) {
        throw new Error('Test B Failed: Continue learning should target accessed incomplete Lecture 2');
    }

    // Test C: Mark Lecture 1 and 2 as complete
    const lec1 = jsLectures[0];
    const reqC1 = { params: { lectureId: lec1._id.toString() }, body: { completed: true }, user: { id: studentUser._id.toString() } };
    const resC1 = mockRes();
    await markLectureComplete(reqC1, resC1);
    console.log('\n[Test C1] Marked Lecture 1 complete:', resC1.data.isCompleted, 'Course %:', resC1.data.courseProgress.progressPercentage);

    const reqC2 = { params: { lectureId: lec2._id.toString() }, body: { completed: true }, user: { id: studentUser._id.toString() } };
    const resC2 = mockRes();
    await markLectureComplete(reqC2, resC2);
    console.log('[Test C2] Marked Lecture 2 complete:', resC2.data.isCompleted, 'Course %:', resC2.data.courseProgress.progressPercentage);

    // Test D: Completing the same lecture twice (idempotent)
    const resC2_dup = mockRes();
    await markLectureComplete(reqC2, resC2_dup);
    console.log('\n[Test D] Marked Lecture 2 complete twice:', resC2_dup.data.isCompleted, 'Completed count:', resC2_dup.data.courseProgress.completedCount);
    if (resC2_dup.data.courseProgress.completedCount !== 2) {
        throw new Error('Test D Failed: Duplicate completion created duplicate count');
    }

    // Test E: Verify Course and Module Progress & Continue Learning targeting Lecture 3
    const resE = mockRes();
    await getCourseProgress(reqA, resE);
    console.log('\n[Test E] Course & Module Progress:');
    console.log(' - Total lectures:', resE.data.totalLectures);
    console.log(' - Completed count:', resE.data.completedCount);
    console.log(' - Progress %:', resE.data.progressPercentage + '%');
    console.log(' - Modules Progress:');
    resE.data.modulesProgress.forEach(m => {
        console.log(`   * ${m.title}: ${m.completedLectures} / ${m.totalLectures} (${m.progressPercentage}%)`);
    });
    console.log(' - Continue Learning Lecture:', resE.data.continueLearningLecture?.lectureNumber, resE.data.continueLearningLecture?.title);
    if (resE.data.continueLearningLecture?.lectureNumber !== 3) {
        throw new Error('Test E Failed: Expected Continue Learning to be Lecture 3');
    }

    // Test F: User Isolation Test (Admin user checking progress should have 0 completed for JS course)
    const reqF = { params: { courseId: jsCourse._id.toString() }, user: { id: adminUser._id.toString() } };
    const resF = mockRes();
    await getCourseProgress(reqF, resF);
    console.log('\n[Test F] User Isolation:');
    console.log(' - Admin User Completed Count:', resF.data.completedCount);
    console.log(' - Admin User Progress %:', resF.data.progressPercentage + '%');
    if (resF.data.completedCount !== 0) {
        throw new Error('Test F Failed: User isolation violated! Student progress leaked to admin user');
    }

    // Test G: Course with zero lectures
    const zeroCourse = await Course.findOne({ title: /Full-Stack Project Lab/i }) || await Course.findOne({ title: /Artificial Intelligence/i });
    if (zeroCourse) {
        const reqG = { params: { courseId: zeroCourse._id.toString() }, user: { id: studentUser._id.toString() } };
        const resG = mockRes();
        await getCourseProgress(reqG, resG);
        console.log('\n[Test G] Course with zero lectures:');
        console.log(' - Total Lectures:', resG.data.totalLectures);
        console.log(' - Progress %:', resG.data.progressPercentage + '%');
        console.log(' - Is Course Completed:', resG.data.isCourseCompleted);
        console.log(' - Continue Learning:', resG.data.continueLearningLecture);
    }

    // Test H: Invalid course ID & Invalid lecture ID
    const reqH1 = { params: { courseId: 'nonexistent123456789012' }, user: { id: studentUser._id.toString() } };
    const resH1 = mockRes();
    await getCourseProgress(reqH1, resH1);
    console.log('\n[Test H] Invalid Course ID status:', resH1.statusCode);

    const reqH2 = { params: { lectureId: 'nonexistent123456789012' }, user: { id: studentUser._id.toString() } };
    const resH2 = mockRes();
    await markLectureComplete(reqH2, resH2);
    console.log(' - Invalid Lecture ID status:', resH2.statusCode);

    // Test I: Unauthenticated request to mark complete
    const reqI = { params: { lectureId: lec1._id.toString() }, body: { completed: true }, user: null };
    const resI = mockRes();
    await markLectureComplete(reqI, resI);
    console.log(' - Unauthenticated request status:', resI.statusCode, resI.data?.message);
    if (resI.statusCode !== 401) {
        throw new Error('Test I Failed: Unauthenticated request should return 401');
    }

    console.log('\n========================================');
    console.log('✓ ALL PHASE 5 BACKEND TESTS PASSED 100%!');
    console.log('========================================');
    process.exit(0);
}

runTests().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
