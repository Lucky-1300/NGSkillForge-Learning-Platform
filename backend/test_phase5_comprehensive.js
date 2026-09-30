require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

const Course = require('./models/course.model');
const Lecture = require('./models/lecture.model');
const User = require('./models/user.model');
const Progress = require('./models/progress.model');
const Enrollment = require('./models/enrollment.model');

const progressController = require('./controllers/progress.controller');
const lectureController = require('./controllers/lecture.controller');
const aiController = require('./controllers/ai.controller');

function createMockRes() {
    return {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(data) {
            this.body = data;
            return this;
        }
    };
}

async function runComprehensiveTests() {
    console.log('====================================================');
    console.log('NGSKILLFORGE PHASE 5 - COMPREHENSIVE VERIFICATION');
    console.log('====================================================\n');

    await mongoose.connect(process.env.MONGO_URI);

    // Get real student and admin user accounts
    const student = await User.findOne({ email: 'luckykumari24@navgurukul.org' });
    const admin = await User.findOne({ email: (process.env.PRIMARY_ADMIN_EMAIL || 'luckykumari42774@gmail.com').toLowerCase() });

    if (!student || !admin) {
        throw new Error('Test users not found');
    }

    console.log(`[AUTH] Authenticated as Student: ${student.email} (${student._id})`);
    console.log(`[AUTH] Other User (Admin): ${admin.email} (${admin._id})\n`);

    // Course to test: "JavaScript Foundations"
    const course = await Course.findOne({ title: /javascript foundations/i });
    if (!course) throw new Error('Course not found');
    const lectures = await Lecture.find({ courseId: course._id }).sort({ lectureNumber: 1 });
    console.log(`[SETUP] Target Course: "${course.title}" (${lectures.length} total lectures)`);

    // Clean any prior test progress for student and admin in this course
    await Progress.deleteMany({ courseId: course._id });
    await Enrollment.deleteMany({ course: course._id });

    // ----------------------------------------------------
    // 1. Initial State Check (0 completed, Continue Learning = Lecture 1)
    // ----------------------------------------------------
    console.log('\n--- Step 1 & 2: Open Lecture 1 & Verify Last Accessed ---');
    const lec1 = lectures[0];
    const lec2 = lectures[1];
    const lec3 = lectures[2];

    const accessReq1 = {
        params: { lectureId: lec1._id.toString() },
        user: { id: student._id.toString(), role: 'user' }
    };
    const accessRes1 = createMockRes();
    await progressController.recordLectureAccess(accessReq1, accessRes1);
    console.log('✓ Recorded access for Lecture 1 (timestamp:', accessRes1.body.lastAccessedAt, ')');

    // Access Lecture 2
    const accessReq2 = {
        params: { lectureId: lec2._id.toString() },
        user: { id: student._id.toString(), role: 'user' }
    };
    const accessRes2 = createMockRes();
    await progressController.recordLectureAccess(accessReq2, accessRes2);
    console.log('✓ Recorded access for Lecture 2 (timestamp:', accessRes2.body.lastAccessedAt, ')');

    // Verify lastAccessedAt in DB
    const pRecord2 = await Progress.findOne({ userId: student._id, lectureId: lec2._id });
    if (!pRecord2 || !pRecord2.lastAccessedAt) {
        throw new Error('Verification failed: lastAccessedAt was not saved in Progress model');
    }
    console.log('✓ Verified lastAccessedAt persists in MongoDB for Lecture 2');

    // ----------------------------------------------------
    // 2. Check Continue Learning Targets Lecture 2 (since it was accessed & incomplete)
    // ----------------------------------------------------
    const progReq1 = {
        params: { courseId: course._id.toString() },
        user: { id: student._id.toString(), role: 'user' }
    };
    const progRes1 = createMockRes();
    await progressController.getCourseProgress(progReq1, progRes1);
    console.log(`✓ Continue Learning lecture: Lecture ${progRes1.body.continueLearningLecture?.lectureNumber} ("${progRes1.body.continueLearningLecture?.title}")`);
    if (progRes1.body.continueLearningLecture?.lectureNumber !== 2) {
        throw new Error(`Expected continue learning to be Lecture 2, got ${progRes1.body.continueLearningLecture?.lectureNumber}`);
    }

    // ----------------------------------------------------
    // 3. Mark Lecture 1 Complete
    // ----------------------------------------------------
    console.log('\n--- Step 3, 4 & 5: Mark Lecture 1 Complete & Verify Persistence ---');
    const compReq1 = {
        params: { lectureId: lec1._id.toString() },
        body: { completed: true },
        user: { id: student._id.toString(), role: 'user' }
    };
    const compRes1 = createMockRes();
    await progressController.markLectureComplete(compReq1, compRes1);
    console.log('✓ Mark complete API response:', compRes1.body.message, '| isCompleted:', compRes1.body.isCompleted);
    console.log('  Course progress returned:', compRes1.body.courseProgress.progressPercentage + '%', `(${compRes1.body.courseProgress.completedCount}/${compRes1.body.courseProgress.totalLectures})`);

    // Verify persistence in MongoDB directly
    const pDb1 = await Progress.findOne({ userId: student._id, lectureId: lec1._id });
    if (!pDb1 || !pDb1.completed || !pDb1.completedAt) {
        throw new Error('Verification failed: Progress record not persisted in MongoDB with completed=true and completedAt');
    }
    console.log('✓ MongoDB Progress document verified in DB: completed =', pDb1.completed, ', completedAt =', pDb1.completedAt);

    // ----------------------------------------------------
    // 4. Mark Lecture 2 Complete & Test Completing Same Lecture Twice (Idempotency)
    // ----------------------------------------------------
    console.log('\n--- Step 6: Completing Same Lecture Twice (Idempotency Test) ---');
    const compReq2 = {
        params: { lectureId: lec2._id.toString() },
        body: { completed: true },
        user: { id: student._id.toString(), role: 'user' }
    };
    const compRes2 = createMockRes();
    await progressController.markLectureComplete(compReq2, compRes2);
    console.log('✓ Lecture 2 marked complete for the first time. Completed count:', compRes2.body.courseProgress.completedCount);

    const compRes2_repeat = createMockRes();
    await progressController.markLectureComplete(compReq2, compRes2_repeat);
    console.log('✓ Lecture 2 marked complete for the second time. Completed count:', compRes2_repeat.body.courseProgress.completedCount);

    if (compRes2_repeat.body.courseProgress.completedCount !== 2) {
        throw new Error('Verification failed: Completing same lecture twice resulted in duplicate progress count');
    }
    const dbCount = await Progress.countDocuments({ userId: student._id, courseId: course._id, completed: true });
    if (dbCount !== 2) {
        throw new Error(`DB Progress count mismatch: expected 2, got ${dbCount}`);
    }
    console.log('✓ DB documents count is exactly 2 (no duplicates in MongoDB)');

    // ----------------------------------------------------
    // 5. Verify Course Progress & Module Progress Calculations
    // ----------------------------------------------------
    console.log('\n--- Step 6 & 7: Verify Dynamic Course & Module Progress Calculation ---');
    const progRes2 = createMockRes();
    await progressController.getCourseProgress(progReq1, progRes2);

    const expectedPct = Math.round((2 / lectures.length) * 100);
    console.log(`✓ Course Progress: ${progRes2.body.completedCount} / ${progRes2.body.totalLectures} (${progRes2.body.progressPercentage}%) [Expected: ${expectedPct}%]`);
    if (progRes2.body.progressPercentage !== expectedPct) {
        throw new Error(`Course progress percent mismatch: expected ${expectedPct}%, got ${progRes2.body.progressPercentage}%`);
    }

    console.log('✓ Modules Progress breakdown:');
    progRes2.body.modulesProgress.forEach(m => {
        console.log(`   - ${m.title}: ${m.completedLectures} / ${m.totalLectures} lectures (${m.progressPercentage}%)`);
    });

    // Check Continue Learning now targets Lecture 3 (first incomplete lecture)
    console.log(`\n--- Step 8: Verify Continue Learning Targets Next Incomplete Lecture ---`);
    console.log(`✓ Continue Learning: Lecture ${progRes2.body.continueLearningLecture?.lectureNumber} ("${progRes2.body.continueLearningLecture?.title}")`);
    if (progRes2.body.continueLearningLecture?.lectureNumber !== 3) {
        throw new Error(`Expected continue learning to be Lecture 3, got ${progRes2.body.continueLearningLecture?.lectureNumber}`);
    }

    // ----------------------------------------------------
    // 6. User Security Isolation Test (Another user cannot see student's progress)
    // ----------------------------------------------------
    console.log('\n--- Step 9: User Isolation & Security Test ---');
    const adminProgReq = {
        params: { courseId: course._id.toString() },
        user: { id: admin._id.toString(), role: 'admin' }
    };
    const adminProgRes = createMockRes();
    await progressController.getCourseProgress(adminProgReq, adminProgRes);
    console.log(`✓ Admin User progress in same course: ${adminProgRes.body.completedCount} / ${adminProgRes.body.totalLectures} (${adminProgRes.body.progressPercentage}%)`);
    if (adminProgRes.body.completedCount !== 0) {
        throw new Error('SECURITY VIOLATION: Student progress was exposed to Admin user!');
    }
    console.log('✓ Security Verified: Progress is strictly isolated per authenticated user');

    // ----------------------------------------------------
    // 7. Test Edge Cases: Unauthenticated, Invalid Lecture, Invalid Course, Zero Lectures
    // ----------------------------------------------------
    console.log('\n--- Step 10: Edge Cases & Error Handling ---');

    // Unauthenticated request
    const unauthReq = {
        params: { lectureId: lec1._id.toString() },
        body: { completed: true },
        user: null
    };
    const unauthRes = createMockRes();
    await progressController.markLectureComplete(unauthReq, unauthRes);
    console.log('✓ Unauthenticated request rejected with status:', unauthRes.statusCode, `(${unauthRes.body?.message})`);
    if (unauthRes.statusCode !== 401) {
        throw new Error('Expected 401 for unauthenticated request');
    }

    // Invalid lecture ID
    const invLecReq = {
        params: { lectureId: 'nonexistent6a86c5acff45d5adfa19e999' },
        body: { completed: true },
        user: { id: student._id.toString(), role: 'user' }
    };
    const invLecRes = createMockRes();
    await progressController.markLectureComplete(invLecReq, invLecRes);
    console.log('✓ Invalid lecture ID handled with status:', invLecRes.statusCode, `(${invLecRes.body?.message})`);
    if (invLecRes.statusCode !== 404) {
        throw new Error('Expected 404 for invalid lecture ID');
    }

    // Invalid course ID
    const invCourseReq = {
        params: { courseId: 'nonexistent6a86c5acff45d5adfa19e999' },
        user: { id: student._id.toString(), role: 'user' }
    };
    const invCourseRes = createMockRes();
    await progressController.getCourseProgress(invCourseReq, invCourseRes);
    console.log('✓ Invalid course ID handled with status:', invCourseRes.statusCode, `(${invCourseRes.body?.message})`);
    if (invCourseRes.statusCode !== 404) {
        throw new Error('Expected 404 for invalid course ID');
    }

    // Course with zero lectures
    const zeroCourse = await Course.findOne({ title: /Full-Stack Project Lab/i }) || await Course.findOne({ title: /Artificial Intelligence/i });
    if (zeroCourse) {
        const zeroReq = {
            params: { courseId: zeroCourse._id.toString() },
            user: { id: student._id.toString(), role: 'user' }
        };
        const zeroRes = createMockRes();
        await progressController.getCourseProgress(zeroReq, zeroRes);
        console.log(`✓ Course with zero lectures handled gracefully: Total=${zeroRes.body.totalLectures}, Progress=${zeroRes.body.progressPercentage}%, continueLecture=${zeroRes.body.continueLearningLecture}`);
        if (zeroRes.body.totalLectures !== 0 || zeroRes.body.progressPercentage !== 0) {
            throw new Error('Expected 0 total lectures and 0% for empty course');
        }
    }

    // ----------------------------------------------------
    // 8. Confirm Existing Features (Lecture Content, Notes, MCQs, Tasks) Remain Intact
    // ----------------------------------------------------
    console.log('\n--- Step 11: Verify Existing Features (Notes, Tasks, MCQs) Intact ---');
    const lecReq = {
        params: { courseId: course._id.toString(), lectureNumber: '1' },
        user: { id: student._id.toString(), role: 'user' }
    };
    const lecRes = createMockRes();
    await lectureController.getLectureByNumber(lecReq, lecRes);

    console.log('✓ Lecture Title:', lecRes.body.lecture?.title);
    console.log('✓ Notes available:', Boolean(lecRes.body.content?.notes || lecRes.body.content?.structuredNotes));
    console.log('✓ Tasks count:', lecRes.body.content?.tasks?.length || 0);
    console.log('✓ MCQs count:', lecRes.body.content?.mcqs?.length || 0);
    console.log('✓ Lecture isCompleted status in response:', lecRes.body.isCompleted);

    if (!lecRes.body.lecture || !lecRes.body.content) {
        throw new Error('Existing lecture content / notes pipeline broken');
    }

    console.log('\n====================================================');
    console.log('🎉 ALL 10 VERIFICATION REQUIREMENTS PASSED 100%');
    console.log('====================================================');
    process.exit(0);
}

runComprehensiveTests().catch(err => {
    console.error('\n❌ Test failure:', err);
    process.exit(1);
});
